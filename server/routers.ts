import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as api from "./externalApis";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen diese Aktion ausführen." });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Dashboard Stats ───────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return db.getContentStats();
    }),
  }),

  // ─── Content Posts ─────────────────────────────────────────
  content: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getContentPosts({
          status: input?.status,
          limit: input?.limit,
          offset: input?.offset,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await db.getContentPostById(input.id);
        if (!result) throw new TRPCError({ code: "NOT_FOUND" });
        return result;
      }),

    getByDateRange: protectedProcedure
      .input(z.object({
        start: z.string(),
        end: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getContentPostsByDateRange(new Date(input.start), new Date(input.end));
      }),

    // Generate content via GoViralBitch API and add to queue as PENDING
    generate: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "reel", "story", "hooks", "ad_copy", "follow_up", "objection"]),
        topic: z.string().optional(),
        pillar: z.string().optional(),
        platform: z.string().optional(),
        platforms: z.array(z.string()).optional(),
        count: z.number().optional(),
        leadName: z.string().optional(),
        step: z.number().optional(),
        interest: z.string().optional(),
        partnerName: z.string().optional(),
        objection: z.string().optional(),
        context: z.string().optional(),
        product: z.string().optional(),
        objective: z.string().optional(),
        format: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let apiResponse: api.GoViralBitchResponse;

        switch (input.contentType) {
          case "post":
            apiResponse = await api.generatePost({ topic: input.topic, pillar: input.pillar, platform: input.platform, count: input.count });
            break;
          case "reel":
            apiResponse = await api.generateReel({ topic: input.topic, pillar: input.pillar, duration: input.duration, count: input.count });
            break;
          case "story":
            apiResponse = await api.generateStory({ topic: input.topic, pillar: input.pillar, platform: input.platform, count: input.count });
            break;
          case "hooks":
            apiResponse = await api.generateHooks({ topic: input.topic, pillar: input.pillar, count: input.count });
            break;
          case "ad_copy":
            apiResponse = await api.generateAdCopy({ product: input.product, objective: input.objective, format: input.format, count: input.count });
            break;
          case "follow_up":
            if (!input.leadName || !input.step) throw new TRPCError({ code: "BAD_REQUEST", message: "leadName und step sind erforderlich" });
            apiResponse = await api.generateFollowUp({ lead_name: input.leadName, step: input.step, interest: input.interest, partner_name: input.partnerName });
            break;
          case "objection":
            if (!input.objection) throw new TRPCError({ code: "BAD_REQUEST", message: "objection ist erforderlich" });
            apiResponse = await api.generateObjection({ objection: input.objection, context: input.context, partner_name: input.partnerName });
            break;
          default:
            throw new TRPCError({ code: "BAD_REQUEST", message: "Unbekannter Content-Typ" });
        }

        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: input.contentType,
          content: apiResponse.content,
          platforms: input.platforms || [input.platform || "instagram"],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
          apiMetadata: apiResponse.metadata,
        });

        await db.createApprovalLog({
          contentPostId: postId,
          userId: ctx.user.id,
          action: "edited",
          comment: "Content generiert und zur Review eingereicht",
          previousStatus: null,
          newStatus: "pending",
        });

        return { id: postId, content: apiResponse.content };
      }),

    // Generate batch (week plan) via GoViralBitch
    generateBatch: protectedProcedure
      .input(z.object({
        weekStart: z.string().optional(),
        platforms: z.array(z.string()).optional(),
        postsPerDay: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const apiResponse = await api.generateBatch({
          week_start: input.weekStart,
          platforms: input.platforms,
          posts_per_day: input.postsPerDay,
        });

        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: "batch",
          content: apiResponse.content,
          platforms: input.platforms || ["instagram", "facebook", "tiktok"],
          status: "pending",
          topic: "Wochenplan",
          apiMetadata: apiResponse.metadata,
        });

        await db.createApprovalLog({
          contentPostId: postId,
          userId: ctx.user.id,
          action: "edited",
          comment: "Wochenplan generiert und zur Review eingereicht",
          previousStatus: null,
          newStatus: "pending",
        });

        return { id: postId, content: apiResponse.content };
      }),

    // Edit content (before approval)
    edit: protectedProcedure
      .input(z.object({
        id: z.number(),
        editedContent: z.string(),
        platforms: z.array(z.string()).optional(),
        scheduledAt: z.string().optional(),
        personalizationNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData: Record<string, unknown> = { editedContent: input.editedContent };
        if (input.platforms) updateData.platforms = input.platforms;
        if (input.scheduledAt) updateData.scheduledAt = new Date(input.scheduledAt);
        if (input.personalizationNotes) updateData.personalizationNotes = input.personalizationNotes;

        await db.updateContentPost(input.id, updateData as any);
        await db.createApprovalLog({
          contentPostId: input.id,
          userId: ctx.user.id,
          action: "edited",
          comment: "Content bearbeitet",
          previousStatus: post.post.status,
          newStatus: post.post.status,
        });

        return { success: true };
      }),

    // Share post to content library for all team members
    shareToLibrary: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        await db.sharePostToLibrary(input.id);

        // Also add to content library table
        await db.addToContentLibrary({
          title: post.post.topic || `${post.post.contentType} - ${new Date().toLocaleDateString("de-DE")}`,
          category: post.post.mediaUrl ? (post.post.videoUrl ? "video" : "image") : "text",
          pillar: post.post.pillar || undefined,
          textContent: post.post.editedContent || post.post.content,
          imageUrl: post.post.mediaUrl || undefined,
          videoUrl: post.post.videoUrl || undefined,
          platforms: post.post.platforms as string[],
          tags: [post.post.contentType, post.post.pillar || "allgemein"].filter(Boolean) as string[],
          createdById: ctx.user.id,
          sourcePostId: input.id,
          personalizationHints: "Passe den Text an deine persönliche Story an. Ändere den Hook und CTA passend zu deinem Stil.",
        });

        return { success: true };
      }),
  }),

  // ─── KI Media Generation ──────────────────────────────────
  media: router({
    generateImage: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1),
        contentPostId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        const result = await generateImage({ prompt: input.prompt });
        if (!result.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Bild konnte nicht generiert werden" });

        if (input.contentPostId) {
          await db.updateContentPost(input.contentPostId, {
            mediaUrl: result.url,
            mediaType: "image",
            imagePrompt: input.prompt,
          } as any);
        }

        return { url: result.url };
      }),

    generateVideo: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1),
        imageUrl: z.string().optional(),
        model: z.enum(["kling-3", "veo-3", "minimax"]).optional(),
        duration: z.enum(["5", "10"]).optional(),
        aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
        contentPostId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await api.generateVideoWithFal({
          prompt: input.prompt,
          imageUrl: input.imageUrl,
          model: input.model,
          duration: input.duration,
          aspectRatio: input.aspectRatio,
        });

        if (input.contentPostId) {
          await db.updateContentPost(input.contentPostId, {
            videoUrl: result.videoUrl,
            mediaType: input.imageUrl ? "image_and_video" : "video",
            videoPrompt: input.prompt,
          } as any);
        }

        return result;
      }),

    uploadMedia: protectedProcedure
      .input(z.object({
        contentPostId: z.number(),
        mediaType: z.enum(["image", "video"]),
        base64Data: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64Data, "base64");
        const key = `media/${input.contentPostId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);

        const updateData: Record<string, unknown> = {};
        if (input.mediaType === "image") {
          updateData.mediaUrl = url;
          updateData.mediaType = "image";
        } else {
          updateData.videoUrl = url;
          updateData.mediaType = "video";
        }
        await db.updateContentPost(input.contentPostId, updateData as any);

        return { url };
      }),
  }),

  // ─── Approval Workflow ─────────────────────────────────────
  approval: router({
    approve: adminProcedure
      .input(z.object({
        id: z.number(),
        comment: z.string().optional(),
        scheduledAt: z.string().optional(),
        autoPublish: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.post.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Nur ausstehende Posts können genehmigt werden" });

        await db.updateContentPostStatus(input.id, "approved", ctx.user.id, input.comment);
        if (input.scheduledAt) {
          await db.updateContentPost(input.id, { scheduledAt: new Date(input.scheduledAt) } as any);
        }

        await db.createApprovalLog({
          contentPostId: input.id,
          userId: ctx.user.id,
          action: "approved",
          comment: input.comment || "Genehmigt",
          previousStatus: "pending",
          newStatus: "approved",
        });

        // Auto-publish if requested and user has Blotato key or system key exists
        if (input.autoPublish) {
          try {
            const creator = await db.getUserById(post.post.createdById);
            const blotatoKey = creator?.blotatoApiKey || process.env.BLOTATO_API_KEY;
            if (blotatoKey) {
              const contentToPublish = post.post.editedContent || post.post.content;
              const platforms = post.post.platforms as string[];
              let accounts = await api.getBlotatoAccounts(blotatoKey);
              if (accounts.length === 0) accounts = api.LR_BLOTATO_ACCOUNTS;
              const mediaUrls: string[] = [];
              if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
              if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);
              const postIds = await api.publishToAllPlatforms(contentToPublish, platforms, accounts, mediaUrls.length > 0 ? mediaUrls : undefined, input.scheduledAt, blotatoKey);
              await db.setBlotatoPostIds(input.id, postIds);
              await db.updateContentPostStatus(input.id, "scheduled", ctx.user.id);
              await db.createApprovalLog({
                contentPostId: input.id,
                userId: ctx.user.id,
                action: "scheduled",
                comment: `Auto-Published auf ${platforms.join(", ")} via Blotato`,
                previousStatus: "approved",
                newStatus: "scheduled",
              });
            }
          } catch (err) {
            console.error("[Auto-Publish] Failed:", err);
            // Don't fail the approval, just log the error
          }
        }

        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({
        id: z.number(),
        comment: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        await db.updateContentPostStatus(input.id, "rejected", ctx.user.id, input.comment);
        await db.createApprovalLog({
          contentPostId: input.id,
          userId: ctx.user.id,
          action: "rejected",
          comment: input.comment,
          previousStatus: post.post.status,
          newStatus: "rejected",
        });

        return { success: true };
      }),

    // Publish approved post to Blotato (ONLY after approval!)
    publish: adminProcedure
      .input(z.object({
        id: z.number(),
        scheduledDate: z.string().optional(),
        useBlotatoKeyOf: z.number().optional(), // Use specific team member's Blotato key
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.post.status !== "approved") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nur genehmigte Posts können veröffentlicht werden. Bitte zuerst genehmigen!" });
        }

        // Determine which Blotato key to use
        let blotatoKey = process.env.BLOTATO_API_KEY;
        if (input.useBlotatoKeyOf) {
          const targetUser = await db.getUserById(input.useBlotatoKeyOf);
          if (targetUser?.blotatoApiKey) {
            blotatoKey = targetUser.blotatoApiKey;
          }
        }

        const contentToPublish = post.post.editedContent || post.post.content;
        const platforms = post.post.platforms as string[];

        let accounts = await api.getBlotatoAccounts(blotatoKey);
        if (accounts.length === 0) accounts = api.LR_BLOTATO_ACCOUNTS;

        const mediaUrls: string[] = [];
        if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
        if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);

        const postIds = await api.publishToAllPlatforms(
          contentToPublish, platforms, accounts,
          mediaUrls.length > 0 ? mediaUrls : undefined,
          input.scheduledDate, blotatoKey,
        );

        await db.setBlotatoPostIds(input.id, postIds);
        await db.updateContentPostStatus(input.id, "scheduled", ctx.user.id);

        await db.createApprovalLog({
          contentPostId: input.id,
          userId: ctx.user.id,
          action: "scheduled",
          comment: `Auf ${platforms.join(", ")} geplant via Blotato`,
          previousStatus: "approved",
          newStatus: "scheduled",
        });

        return { success: true, postIds };
      }),

    logs: protectedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => {
        return db.getApprovalLogsForPost(input.contentPostId);
      }),
  }),

  // ─── Quality Gate ──────────────────────────────────────────
  qualityGate: router({
    check: protectedProcedure
      .input(z.object({
        content: z.string(),
        platform: z.string(),
      }))
      .mutation(async ({ input }) => {
        return api.runQualityGate(input.content, input.platform);
      }),
  }),

  // ─── Brand Voice & Viral Tools ─────────────────────────────
  brandVoice: router({
    get: protectedProcedure.query(() => api.LR_BRAND_VOICE),
    getCTAs: protectedProcedure
      .input(z.object({ platform: z.string() }))
      .query(({ input }) => api.CTA_TEMPLATES[input.platform.toLowerCase()] || {}),
    getHooks: protectedProcedure.query(() => api.HOOK_FORMULAS),
    getScriptTemplates: protectedProcedure.query(() => api.VIRAL_SCRIPT_TEMPLATES),
    getBlockers: protectedProcedure.query(() => api.LR_BRAND_VOICE.audienceBlockers),

    generateWithVoice: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "reel_script", "story", "carousel", "ad_copy", "linkedin", "youtube_script"]),
        platform: z.string(),
        pillar: z.string(),
        topic: z.string(),
        hookStyle: z.enum(["curiosity", "story", "value", "contrarian", "socialProof"]).optional(),
        scriptTemplate: z.string().optional(),
        includeBlocker: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const voice = api.LR_BRAND_VOICE;
        const platformVoice = voice.tonePerPlatform[input.platform.toLowerCase() as keyof typeof voice.tonePerPlatform];
        const pillarInfo = voice.pillars.find(p => p.name === input.pillar);

        const hookExamples = input.hookStyle
          ? api.HOOK_FORMULAS[input.hookStyle].slice(0, 3).join("\n")
          : api.HOOK_FORMULAS.curiosity.slice(0, 2).join("\n");

        const ctaExamples = api.CTA_TEMPLATES[input.platform.toLowerCase()]?.dm?.slice(0, 2).join("\n") || "Link in Bio";

        let blockerInfo = "";
        if (input.includeBlocker) {
          const relevantBlockers = voice.audienceBlockers.filter(b => b.pillar === input.pillar || b.pillar === pillarInfo?.name);
          if (relevantBlockers.length > 0) {
            blockerInfo = `\n\nEinwandbehandlung einbauen:\n${relevantBlockers.map(b => `Einwand: "${b.lie}" → Antwort: "${b.destruction}"`).join("\n")}`;
          }
        }

        let templateInfo = "";
        if (input.scriptTemplate && api.VIRAL_SCRIPT_TEMPLATES[input.scriptTemplate as keyof typeof api.VIRAL_SCRIPT_TEMPLATES]) {
          const tmpl = api.VIRAL_SCRIPT_TEMPLATES[input.scriptTemplate as keyof typeof api.VIRAL_SCRIPT_TEMPLATES];
          templateInfo = `\n\nVerwende dieses Script-Template:\n${tmpl.structure}`;
        }

        const systemPrompt = `Du bist der Content-Creator für das ${voice.identity.name} von ${voice.identity.leader}.
Unternehmen: ${voice.identity.company} (${voice.identity.companyAge}, ${voice.identity.countries} Länder)
Zertifizierungen: ${voice.identity.certifications.join(", ")} (NICHT ${voice.identity.notCertified.join(", ")}!)
Einstiegspreis: ${voice.identity.entryPrice} (früher ${voice.identity.previousPrice})
KI-Assistentin: ${voice.identity.aiAssistant}

PLATTFORM: ${input.platform}
Ton: ${platformVoice?.tone || "professionell, authentisch"}
Format: ${platformVoice?.format || "Posts"}

CONTENT-PILLAR: ${pillarInfo?.emoji || ""} ${input.pillar}
${pillarInfo?.description || ""}

HOOK-BEISPIELE (verwende ähnliche Hooks):
${hookExamples}

CTA-BEISPIELE (verwende einen passenden CTA):
${ctaExamples}
${blockerInfo}${templateInfo}

REGELN:
1. Schreibe auf Deutsch
2. Verwende den richtigen Ton für ${input.platform}
3. Der Hook MUSS in den ersten 2 Sekunden fesseln
4. IMMER einen CTA am Ende
5. NIEMALS "TÜV" erwähnen - nur "Fresenius-geprüft" und "Dermatest-zertifiziert"
6. Content muss viral-tauglich sein - provokant, emotional, überraschend
7. Nutze Emojis passend zur Plattform
8. Ziel: Kontakte generieren, Leads anziehen, Business aufbauen`;

        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Erstelle einen ${input.contentType} über "${input.topic}" für ${input.platform}. Pillar: ${input.pillar}. Mach es viral!` },
          ],
        });

        const generatedContent = typeof llmResponse.choices?.[0]?.message?.content === "string"
          ? llmResponse.choices[0].message.content
          : "Content konnte nicht generiert werden";

        const qualityResult = api.runQualityGate(generatedContent, input.platform);

        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: input.contentType,
          content: generatedContent,
          platforms: [input.platform],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
          qualityScore: qualityResult.score,
          apiMetadata: { hookStyle: input.hookStyle, scriptTemplate: input.scriptTemplate, qualityScore: qualityResult.score },
        });

        await db.createApprovalLog({
          contentPostId: postId,
          userId: ctx.user.id,
          action: "edited",
          comment: `Content mit Brand Voice generiert (Quality Score: ${qualityResult.score}/100)`,
          previousStatus: null,
          newStatus: "pending",
        });

        return { id: postId, content: generatedContent, qualityGate: qualityResult };
      }),
  }),

  // ─── Content Templates ─────────────────────────────────────
  templates: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => db.getContentTemplates(input?.category)),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.string(),
        content: z.string(),
        platforms: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createContentTemplate({
          ...input,
          platforms: input.platforms || null,
          createdById: ctx.user.id,
        });
        return { id };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteContentTemplate(input.id);
        return { success: true };
      }),

    useTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementTemplateUsage(input.id);
        return { success: true };
      }),
  }),

  // ─── Creator Spy ───────────────────────────────────────────
  creatorSpy: router({
    reports: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getCreatorSpyReports(input?.limit || 10)),

    latest: protectedProcedure.query(async () => db.getLatestCreatorSpyReport()),

    analyze: adminProcedure
      .input(z.object({ hashtags: z.array(z.string()).optional() }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const hashtags = input.hashtags || [
          "LR Health Beauty", "Network Marketing Erfolg", "Nebeneinkommen online",
          "MLM deutsch", "Autokonzept LR", "Aloe Vera LR",
        ];
        const now = new Date();
        const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Du bist ein Creator Spy Agent für das LR Lifestyle Team von Mathias Vinzing. Analysiere virale Posts aus der Network Marketing / LR / MLM / Lifestyle Nische.

Für die Hashtags: ${hashtags.join(", ")}

Erstelle einen detaillierten Report mit:
1. TOP 5 HOOKS der Woche - die besten Aufhänger die du in der Nische siehst
2. HOOK-ANALYSE: Für jeden Hook: Warum funktioniert er? Welches Framework?
3. PERFORMANCE-TIER: S (viral), A (sehr gut), B (gut)
4. TOP 5 NACHMACH-IDEEN: Konkrete Content-Ideen die das LR Team adaptieren kann
5. TREND-WARNUNG: Was kommt als nächstes in der Nische?
6. CONTENT-GAPS: Was machen Wettbewerber NICHT, wo das LR Team einsteigen kann?
7. PLATTFORM-TRENDS: Welche Formate performen gerade am besten?

WICHTIG: LR ist Fresenius-geprüft und Dermatest-zertifiziert (NICHT TÜV!). Einstieg kostet 99 Euro.`
            },
            {
              role: "user",
              content: `Erstelle den Creator Spy Report für KW ${weekNumber} / ${now.getFullYear()}.`
            }
          ],
        });

        const rawContent = llmResponse.choices?.[0]?.message?.content;
        const reportContent: string = typeof rawContent === "string" ? rawContent : "Kein Report generiert";
        const hookMatches = reportContent.match(/(?:HOOK|Hook)[^:]*:\s*["""]?([^"""\n]+)/g) || [];
        const topHooks = hookMatches.slice(0, 5).map((h: string) => h.replace(/(?:HOOK|Hook)[^:]*:\s*["""]?/, "").trim());
        const ideaMatches = reportContent.match(/(?:IDEE|Idee|NACHMACH)[^:]*:\s*([^\n]+)/g) || [];
        const contentIdeas = ideaMatches.slice(0, 5).map((i: string) => i.replace(/(?:IDEE|Idee|NACHMACH)[^:]*:\s*/, "").trim());
        const trendMatch = (reportContent as string).match(/(?:TREND|Trend)[^:]*:\s*([^\n]+(?:\n(?![A-Z#])[^\n]+)*)/);
        const trendWarnings = trendMatch ? trendMatch[1].trim() : null;

        const id = await db.createCreatorSpyReport({
          weekNumber, year: now.getFullYear(), reportContent,
          topHooks: topHooks.length > 0 ? topHooks : null,
          contentIdeas: contentIdeas.length > 0 ? contentIdeas : null,
          trendWarnings, postsAnalyzed: 0, hashtags,
        });

        return { id, reportContent, topHooks, contentIdeas };
      }),
  }),

  // ─── Content Library (für alle Team-Mitglieder) ────────────
  library: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        pillar: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getContentLibrary({
          category: input?.category,
          pillar: input?.pillar,
          limit: input?.limit,
          offset: input?.offset,
        });
      }),

    add: protectedProcedure
      .input(z.object({
        title: z.string(),
        category: z.enum(["image", "video", "text", "template", "reel_script"]),
        pillar: z.string().optional(),
        textContent: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        platforms: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        personalizationHints: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.addToContentLibrary({
          ...input,
          createdById: ctx.user.id,
        });
        return { id };
      }),

    copy: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementLibraryCopyCount(input.id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFromContentLibrary(input.id);
        return { success: true };
      }),
  }),

  // ─── A/B Testing ───────────────────────────────────────────
  abTest: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.getABTestGroups(input?.status)),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        variantAContent: z.string(),
        variantBContent: z.string(),
        platform: z.string(),
        topic: z.string().optional(),
        pillar: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create variant A post
        const variantAId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: "post",
          content: input.variantAContent,
          platforms: [input.platform],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
          abTestVariant: "A",
        });

        // Create variant B post
        const variantBId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: "post",
          content: input.variantBContent,
          platforms: [input.platform],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
          abTestVariant: "B",
        });

        // Create test group
        const groupId = await db.createABTestGroup({
          name: input.name,
          variantAId,
          variantBId,
          createdById: ctx.user.id,
        });

        // Link posts to group
        await db.updateContentPost(variantAId, { abTestGroupId: groupId } as any);
        await db.updateContentPost(variantBId, { abTestGroupId: groupId } as any);

        return { groupId, variantAId, variantBId };
      }),

    complete: adminProcedure
      .input(z.object({
        id: z.number(),
        winner: z.enum(["A", "B"]),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.completeABTest(input.id, input.winner, input.reason);
        return { success: true };
      }),
  }),

  // ─── Feedback Loop ─────────────────────────────────────────
  feedback: router({
    topPerforming: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getTopPerformingPosts(input?.limit || 10)),

    updateScore: adminProcedure
      .input(z.object({
        postId: z.number(),
        feedbackScore: z.number().min(0).max(100),
        successFactors: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        await db.updatePostFeedback(input.postId, input.feedbackScore, input.successFactors);
        return { success: true };
      }),

    // Analyze why a post performed well using LLM
    analyzeSuccess: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        const post = await db.getContentPostById(input.postId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        const analytics = await db.getAnalyticsForPost(input.postId);

        const { invokeLLM } = await import("./_core/llm");
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Du bist ein Social Media Analyst. Analysiere warum dieser Content gut performt hat und gib konkrete Empfehlungen was das Team daraus lernen kann.`
            },
            {
              role: "user",
              content: `Content: "${post.post.content}"\nPlattformen: ${(post.post.platforms as string[]).join(", ")}\nTyp: ${post.post.contentType}\nPillar: ${post.post.pillar || "k.A."}\n\nAnalytics: ${JSON.stringify(analytics.slice(0, 3))}\n\nAnalysiere: 1) Was macht diesen Content erfolgreich? 2) Welche Elemente (Hook, CTA, Emotion) funktionieren? 3) Wie kann das Team mehr davon machen?`
            }
          ],
        });

        const analysis = typeof llmResponse.choices?.[0]?.message?.content === "string"
          ? llmResponse.choices[0].message.content
          : "Analyse nicht verfügbar";

        return { analysis };
      }),
  }),

  // ─── Optimal Posting Times ─────────────────────────────────
  postingTimes: router({
    get: protectedProcedure
      .input(z.object({ platform: z.string().optional() }).optional())
      .query(async ({ input }) => db.getOptimalPostingTimes(input?.platform)),

    calculate: adminProcedure.mutation(async () => {
      // Calculate optimal times from analytics data
      const db2 = await db.getDb();
      if (!db2) return { message: "Keine Daten verfügbar" };

      const { invokeLLM } = await import("./_core/llm");
      const summary = await db.getAnalyticsSummary();

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Du bist ein Social Media Timing-Experte. Basierend auf den Analytics-Daten, berechne die optimalen Posting-Zeiten pro Plattform und Wochentag. Gib die Ergebnisse als JSON zurück.`
          },
          {
            role: "user",
            content: `Analytics-Zusammenfassung: ${JSON.stringify(summary)}\n\nBerechne die besten Posting-Zeiten für: Instagram, Facebook, TikTok, LinkedIn, Twitter. Format: { platform, dayOfWeek (0=So, 1=Mo...), bestHour (0-23), avgEngagement }`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "posting_times",
            strict: true,
            schema: {
              type: "object",
              properties: {
                times: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      dayOfWeek: { type: "integer" },
                      bestHour: { type: "integer" },
                      avgEngagement: { type: "string" },
                    },
                    required: ["platform", "dayOfWeek", "bestHour", "avgEngagement"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["times"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = llmResponse.choices?.[0]?.message?.content;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          for (const time of parsed.times) {
            await db.upsertOptimalPostingTime({
              platform: time.platform,
              dayOfWeek: time.dayOfWeek,
              bestHour: time.bestHour,
              avgEngagement: time.avgEngagement,
            });
          }
          return { message: `${parsed.times.length} Posting-Zeiten berechnet und gespeichert` };
        } catch { /* ignore parse errors */ }
      }
      return { message: "Posting-Zeiten konnten nicht berechnet werden" };
    }),
  }),

  // ─── User Settings (Personal Blotato Key, Branding, etc.) ──
  userSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        hasBlotatoKey: !!user.blotatoApiKey,
        autoPostEnabled: user.autoPostEnabled,
        preferredPostingTimes: user.preferredPostingTimes,
        personalBranding: user.personalBranding,
      };
    }),

    saveBlotatoKey: protectedProcedure
      .input(z.object({ blotatoApiKey: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserBlotatoKey(ctx.user.id, input.blotatoApiKey);
        return { success: true };
      }),

    removeBlotatoKey: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.updateUserBlotatoKey(ctx.user.id, null);
        return { success: true };
      }),

    toggleAutoPost: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserAutoPost(ctx.user.id, input.enabled);
        return { success: true };
      }),

    savePostingTimes: protectedProcedure
      .input(z.object({ times: z.record(z.string(), z.string()) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPostingTimes(ctx.user.id, input.times as Record<string, string>);
        return { success: true };
      }),

    savePersonalBranding: protectedProcedure
      .input(z.object({
        signature: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        ownIntro: z.string().optional(),
        customCTA: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPersonalBranding(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ─── Analytics ─────────────────────────────────────────────
  analytics: router({
    summary: protectedProcedure.query(async () => db.getAnalyticsSummary()),
    forPost: protectedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => db.getAnalyticsForPost(input.contentPostId)),
  }),

  // ─── Team Management ───────────────────────────────────────
  team: router({
    list: protectedProcedure.query(async () => db.getAllUsers()),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    // Partner freischalten (Admin only)
    approvePartner: adminProcedure
      .input(z.object({
        userId: z.number(),
        partnerNumber: z.string().min(1),
        phoneNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.approvePartner(input.userId, input.partnerNumber, input.phoneNumber);
        return { success: true };
      }),
    // Partner sperren (Admin only)
    revokePartner: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await db.revokePartner(input.userId);
        return { success: true };
      }),
    // Partner-Profil aktualisieren (eigene Daten)
    updateProfile: protectedProcedure
      .input(z.object({
        phoneNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ─── Lina Integration API ─────────────────────────────────
  lina: router({
    // Public endpoint for Lina to fetch approved content
    getApprovedContent: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        platform: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const posts = await db.getContentPosts({
          status: "approved",
          limit: input?.limit || 5,
        });
        return posts.map(p => ({
          id: p.post.id,
          content: p.post.editedContent || p.post.content,
          contentType: p.post.contentType,
          platforms: p.post.platforms,
          mediaUrl: p.post.mediaUrl,
          videoUrl: p.post.videoUrl,
          topic: p.post.topic,
          pillar: p.post.pillar,
          createdAt: p.post.createdAt,
        }));
      }),

    // Public endpoint for Lina to fetch library content
    getLibraryContent: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const items = await db.getContentLibrary({
          category: input?.category,
          limit: input?.limit || 10,
        });
        return items.map(i => ({
          id: i.item.id,
          title: i.item.title,
          category: i.item.category,
          textContent: i.item.textContent,
          imageUrl: i.item.imageUrl,
          videoUrl: i.item.videoUrl,
          platforms: i.item.platforms,
          tags: i.item.tags,
        }));
      }),
  }),

  // ─── API Health ────────────────────────────────────────────
  apiHealth: router({
    goViralBitch: publicProcedure.query(async () => {
      const healthy = await api.goViralBitchHealthCheck();
      return { status: healthy ? "online" : "offline", url: "https://goviralbitch-deploy.onrender.com" };
    }),
    blotatoAccounts: protectedProcedure.query(async () => {
      try {
        const accounts = await api.getBlotatoAccounts();
        return { connected: accounts.length > 0, accounts, fallback: accounts.length === 0 };
      } catch {
        return { connected: false, accounts: api.LR_BLOTATO_ACCOUNTS, fallback: true };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
