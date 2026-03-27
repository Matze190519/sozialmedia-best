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
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData: Record<string, unknown> = { editedContent: input.editedContent };
        if (input.platforms) updateData.platforms = input.platforms;
        if (input.scheduledAt) updateData.scheduledAt = new Date(input.scheduledAt);

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
  }),

  // ─── KI Media Generation ──────────────────────────────────
  media: router({
    // KI-Bild generieren via eingebaute Image Generation API
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

    // Echte Video-KI via fal.ai (Kling 3.0 Pro, Veo 3.1, Minimax)
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

    // Upload eigenes Bild/Video
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
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.post.status !== "approved") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nur genehmigte Posts können veröffentlicht werden. Bitte zuerst genehmigen!" });
        }

        const contentToPublish = post.post.editedContent || post.post.content;
        const platforms = post.post.platforms as string[];

        let accounts = await api.getBlotatoAccounts();
        if (accounts.length === 0) {
          accounts = api.LR_BLOTATO_ACCOUNTS;
        }

        const mediaUrls: string[] = [];
        if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
        if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);

        const postIds = await api.publishToAllPlatforms(
          contentToPublish,
          platforms,
          accounts,
          mediaUrls.length > 0 ? mediaUrls : undefined,
          input.scheduledDate,
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
    // Get the complete Brand Voice config
    get: protectedProcedure.query(() => {
      return api.LR_BRAND_VOICE;
    }),

    // Get CTA templates for a platform
    getCTAs: protectedProcedure
      .input(z.object({ platform: z.string() }))
      .query(({ input }) => {
        return api.CTA_TEMPLATES[input.platform.toLowerCase()] || {};
      }),

    // Get Hook Formulas
    getHooks: protectedProcedure.query(() => {
      return api.HOOK_FORMULAS;
    }),

    // Get Viral Script Templates
    getScriptTemplates: protectedProcedure.query(() => {
      return api.VIRAL_SCRIPT_TEMPLATES;
    }),

    // Get Audience Blockers (Einwandbehandlung)
    getBlockers: protectedProcedure.query(() => {
      return api.LR_BRAND_VOICE.audienceBlockers;
    }),

    // Generate content with Brand Voice using LLM
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

        // Build hook examples
        const hookExamples = input.hookStyle
          ? api.HOOK_FORMULAS[input.hookStyle].slice(0, 3).join("\n")
          : api.HOOK_FORMULAS.curiosity.slice(0, 2).join("\n");

        // Build CTA examples
        const ctaExamples = api.CTA_TEMPLATES[input.platform.toLowerCase()]?.dm?.slice(0, 2).join("\n") || "Link in Bio";

        // Build blocker info
        let blockerInfo = "";
        if (input.includeBlocker) {
          const relevantBlockers = voice.audienceBlockers.filter(b => b.pillar === input.pillar || b.pillar === pillarInfo?.name);
          if (relevantBlockers.length > 0) {
            blockerInfo = `\n\nEinwandbehandlung einbauen:\n${relevantBlockers.map(b => `Einwand: "${b.lie}" → Antwort: "${b.destruction}"`).join("\n")}`;
          }
        }

        // Build script template
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

        // Auto Quality Gate
        const qualityResult = api.runQualityGate(generatedContent, input.platform);

        // Save to DB
        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: input.contentType,
          content: generatedContent,
          platforms: [input.platform],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
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

        return {
          id: postId,
          content: generatedContent,
          qualityGate: qualityResult,
        };
      }),
  }),

  // ─── Content Templates ─────────────────────────────────────
  templates: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getContentTemplates(input?.category);
      }),

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
      .query(async ({ input }) => {
        return db.getCreatorSpyReports(input?.limit || 10);
      }),

    latest: protectedProcedure.query(async () => {
      return db.getLatestCreatorSpyReport();
    }),

    // Manually trigger a Creator Spy analysis via LLM
    analyze: adminProcedure
      .input(z.object({
        hashtags: z.array(z.string()).optional(),
      }))
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
2. HOOK-ANALYSE: Für jeden Hook: Warum funktioniert er? Welches Framework? (Story, Frage, Kontroverse, Statistik)
3. PERFORMANCE-TIER: S (viral), A (sehr gut), B (gut) - für jeden analysierten Trend
4. TOP 5 NACHMACH-IDEEN: Konkrete Content-Ideen die das LR Team adaptieren kann
5. TREND-WARNUNG: Was kommt als nächstes in der Nische?
6. CONTENT-GAPS: Was machen Wettbewerber NICHT, wo das LR Team einsteigen kann?
7. PLATTFORM-TRENDS: Welche Formate performen gerade am besten auf welcher Plattform?

WICHTIG: LR ist Fresenius-geprüft und Dermatest-zertifiziert (NICHT TÜV!). Einstieg kostet 99 Euro.
Format: Klar strukturiert mit Emojis für bessere Lesbarkeit.`
            },
            {
              role: "user",
              content: `Erstelle den Creator Spy Report für KW ${weekNumber} / ${now.getFullYear()}. Analysiere aktuelle Trends in der Network Marketing, MLM, Nebeneinkommen und Lifestyle-Nische auf Instagram, TikTok und LinkedIn.`
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
          weekNumber,
          year: now.getFullYear(),
          reportContent,
          topHooks: topHooks.length > 0 ? topHooks : null,
          contentIdeas: contentIdeas.length > 0 ? contentIdeas : null,
          trendWarnings,
          postsAnalyzed: 0,
          hashtags,
        });

        return { id, reportContent, topHooks, contentIdeas };
      }),
  }),

  // ─── Analytics ─────────────────────────────────────────────
  analytics: router({
    summary: protectedProcedure.query(async () => {
      return db.getAnalyticsSummary();
    }),

    forPost: protectedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => {
        return db.getAnalyticsForPost(input.contentPostId);
      }),
  }),

  // ─── Team Management ───────────────────────────────────────
  team: router({
    list: protectedProcedure.query(async () => {
      return db.getAllUsers();
    }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
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
