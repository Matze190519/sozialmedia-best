import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, approvedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as api from "./externalApis";
import * as trendScanner from "./trendScanner";
import * as hashtagEngine from "./hashtagEngine";
import * as lifestyleEngine from "./lifestyleEngine";
import { notifyOwner } from "./_core/notification";
import { sendBrevoNotification } from "./brevoNotify";

// Admin-only procedure (requires admin role)
const adminProcedure = approvedProcedure.use(({ ctx, next }) => {
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
    stats: approvedProcedure.query(async ({ ctx }) => {
      // Jeder User sieht nur seine eigenen Stats
      return db.getContentStats(ctx.user.id);
    }),
  }),

  // ─── Content Posts ─────────────────────────────────────────
  content: router({
    list: approvedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        // Jeder User sieht nur seine eigenen Posts
        return db.getContentPosts({
          status: input?.status,
          createdById: ctx.user.id,
          limit: input?.limit,
          offset: input?.offset,
        });
      }),

    getById: approvedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const result = await db.getContentPostById(input.id);
        if (!result) throw new TRPCError({ code: "NOT_FOUND" });
        // Jeder User sieht nur seine eigenen Posts
        if (result.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Du kannst nur deinen eigenen Content ansehen." });
        return result;
      }),

    getByDateRange: approvedProcedure
      .input(z.object({
        start: z.string(),
        end: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getContentPostsByDateRange(new Date(input.start), new Date(input.end));
      }),

    // Generate content via GoViralBitch API and add to queue as PENDING
    generate: approvedProcedure
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
        autoGenerateImage: z.boolean().optional(),
        autoGenerateVideo: z.boolean().optional(),
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

        // Auto-generate image if requested
        let imageUrl: string | null = null;
        if (input.autoGenerateImage) {
          try {
            const imgPrompt = `${input.topic || input.pillar || "LR Lifestyle"}, premium social media content, cinematic lighting, professional photography, no text, no words, no letters, no watermarks`;
            if (process.env.FAL_API_KEY) {
              const premiumResult = await api.generatePremiumImage({ prompt: imgPrompt, aspectRatio: "1:1" });
              imageUrl = premiumResult.imageUrl;
            } else {
              const { generateImage } = await import("./_core/imageGeneration");
              const fallbackResult = await generateImage({ prompt: imgPrompt });
              imageUrl = fallbackResult.url || null;
            }
            if (imageUrl) {
              await db.updateContentPost(postId, { mediaUrl: imageUrl, mediaType: "image", imagePrompt: imgPrompt } as any);
            }
          } catch (err) {
            console.error("[AutoImage] Generation failed:", err);
          }
        }

        // Auto-generate video if requested
        let videoUrl: string | null = null;
        if (input.autoGenerateVideo) {
          try {
            const vidPrompt = `${input.topic || input.pillar || "LR Lifestyle"}, cinematic slow motion, premium social media content, professional`;
            const videoResult = await api.generateVideoWithFal({
              prompt: vidPrompt,
              imageUrl: imageUrl || undefined,
              model: "auto",
              duration: "5",
              aspectRatio: "9:16",
              generateAudio: true,
            });
            if (videoResult.videoUrl) {
              videoUrl = videoResult.videoUrl;
              await db.updateContentPost(postId, {
                videoUrl: videoResult.videoUrl,
                mediaType: imageUrl ? "image_and_video" : "video",
                videoPrompt: vidPrompt,
              } as any);
            }
          } catch (err) {
            console.error("[AutoVideo] Generation failed:", err);
          }
        }

        return { id: postId, content: apiResponse.content, imageUrl, videoUrl };
      }),

    // Generate batch (week plan) via GoViralBitch
    generateBatch: approvedProcedure
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
    edit: approvedProcedure
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
    shareToLibrary: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

         // Nur vollstaendige Posts mit Bild/Video in Bibliothek
        if (!post.post.mediaUrl && !post.post.videoUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nur Posts mit Bild oder Video können in die Bibliothek. Generiere zuerst ein Bild oder Video." });
        }
        await db.sharePostToLibrary(input.id);
        // Also add to content library table
        await db.addToContentLibrary({
          title: post.post.topic || `${post.post.contentType} - ${new Date().toLocaleDateString("de-DE")}`,
          category: post.post.videoUrl ? "video" : "image",
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
    // Premium Bildgenerierung - Nano Banana Pro (Google Gemini 3 Pro Image)
    generateImage: approvedProcedure
      .input(z.object({
        prompt: z.string().min(1),
        contentPostId: z.number().optional(),
        usePremium: z.boolean().optional(), // true = Nano Banana Pro via fal.ai
        aspectRatio: z.string().optional(),
        resolution: z.enum(["1K", "2K", "4K"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Budget-Check (Admin hat kein Limit)
        const { checkBudget, trackUsage } = await import("./budgetTracker");
        const isAdmin = ctx.user.role === "admin";
        if (!isAdmin) {
          const budgetCheck = await checkBudget(ctx.user.id, "image");
          if (!budgetCheck.allowed) {
            throw new TRPCError({ code: "FORBIDDEN", message: budgetCheck.reason || "Budget erreicht" });
          }
        }

        let imageUrl: string;

        if (input.usePremium !== false && process.env.FAL_API_KEY) {
          // Premium: Nano Banana Pro (beste Qualität)
          const result = await api.generatePremiumImage({
            prompt: input.prompt,
            aspectRatio: (input.aspectRatio as any) || "1:1",
            resolution: input.resolution || "2K",
          });
          imageUrl = result.imageUrl;
          console.log(`[Premium Image] Nano Banana Pro: ${result.model}`);
        } else {
          // Fallback: Built-in Image Generation
          const { generateImage } = await import("./_core/imageGeneration");
          const result = await generateImage({ prompt: input.prompt });
          if (!result.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Bild konnte nicht generiert werden" });
          imageUrl = result.url;
        }

        // Budget tracken
        await trackUsage(ctx.user.id, "image", "nano-banana-2", input.contentPostId);

        if (input.contentPostId) {
          await db.updateContentPost(input.contentPostId, {
            mediaUrl: imageUrl,
            mediaType: "image",
            imagePrompt: input.prompt,
          } as any);
        }

        return { url: imageUrl };
      }),

    // Premium Videogenerierung - Auto: Veo 3.1 (<=8s) / Kling 3.0 Pro (>8s)
    generateVideo: approvedProcedure
      .input(z.object({
        prompt: z.string().min(1),
        imageUrl: z.string().optional(),
        model: z.enum(["kling-3", "veo-3", "minimax", "auto"]).optional(),
        duration: z.string().optional(),
        aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
        generateAudio: z.boolean().optional(),
        resolution: z.enum(["720p", "1080p", "4k"]).optional(),
        contentPostId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Budget-Check (Admin hat kein Limit)
        const { checkBudget, trackUsage } = await import("./budgetTracker");
        const isAdmin = ctx.user.role === "admin";
        if (!isAdmin) {
          const budgetCheck = await checkBudget(ctx.user.id, "video");
          if (!budgetCheck.allowed) {
            throw new TRPCError({ code: "FORBIDDEN", message: budgetCheck.reason || "Budget erreicht" });
          }
        }

        // Admin = Veo 3.1 (Top-Modell), Partner = Kling 3.0 Pro (guenstiger mit Musik)
        const videoModel = isAdmin ? (input.model || "veo-3") : "kling-3";

        const result = await api.generateVideoWithFal({
          prompt: input.prompt,
          imageUrl: input.imageUrl,
          model: videoModel,
          duration: input.duration || "5",
          aspectRatio: input.aspectRatio,
          generateAudio: input.generateAudio !== false, // Immer mit Audio/Musik
          resolution: input.resolution,
        });

        // Budget tracken
        await trackUsage(ctx.user.id, "video", result.model || "kling-3", input.contentPostId, parseInt(input.duration || "5"));

        if (input.contentPostId) {
          await db.updateContentPost(input.contentPostId, {
            videoUrl: result.videoUrl,
            mediaType: input.imageUrl ? "image_and_video" : "video",
            videoPrompt: input.prompt,
          } as any);
        }

        return result;
      }),

    // Attach a product image URL directly to a content post
    attachProductImage: approvedProcedure
      .input(z.object({
        contentPostId: z.number(),
        imageUrl: z.string(),
        productName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateContentPost(input.contentPostId, {
          mediaUrl: input.imageUrl,
          mediaType: "image",
          imagePrompt: input.productName ? `Produktbild: ${input.productName}` : "Produktbild",
        } as any);
        return { url: input.imageUrl };
      }),

    uploadMedia: approvedProcedure
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

  // ─── Budget Tracking ──────────────────────────────────────
  budget: router({
    // Admin: Globaler Budget-Status
    status: approvedProcedure.query(async () => {
      const { getBudgetStatus } = await import("./budgetTracker");
      return getBudgetStatus();
    }),
    // Partner: Eigene Usage
    myUsage: approvedProcedure.query(async ({ ctx }) => {
      const { getPartnerUsage } = await import("./budgetTracker");
      return getPartnerUsage(ctx.user.id);
    }),
    // Admin: Alle Partner Usage + Kosten-Details
    allPartnerUsage: adminProcedure.query(async () => {
      const { getAllPartnerUsage } = await import("./budgetTracker");
      return getAllPartnerUsage();
    }),
  }),

  // ─── Approval Workflow ─────────────────────────────────────
  approval: router({
    approve: approvedProcedure
      .input(z.object({
        id: z.number(),
        comment: z.string().optional(),
        scheduledAt: z.string().optional(),
        autoPublish: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        // Jeder Partner darf nur seinen EIGENEN Content freigeben
        if (post.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Du kannst nur deinen eigenen Content freigeben." });
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

        // Send notification via Brevo
        try {
          await sendBrevoNotification({
            title: `✅ Content freigegeben`,
            content: `${ctx.user.name || "Partner"} hat Content freigegeben: "${(post.post.editedContent || post.post.content).substring(0, 100)}..." | Plattformen: ${(post.post.platforms as string[]).join(", ")}`,
          });
        } catch { /* notification failure shouldn't block approval */ }

        // Auto-save to content library on every approval - NUR wenn Bild oder Video vorhanden
        const hasMedia = !!(post.post.mediaUrl || post.post.videoUrl);
        if (hasMedia) {
        try {
          await db.addToContentLibrary({
            title: post.post.topic || `${post.post.contentType} - ${new Date().toLocaleDateString("de-DE")}`,
            category: post.post.videoUrl ? "video" : "image",
            pillar: post.post.pillar || undefined,
            textContent: post.post.editedContent || post.post.content,
            imageUrl: post.post.mediaUrl || undefined,
            videoUrl: post.post.videoUrl || undefined,
            platforms: post.post.platforms as string[],
            tags: [post.post.contentType, post.post.pillar || "allgemein"].filter(Boolean) as string[],
            createdById: ctx.user.id,
            sourcePostId: input.id,
            personalizationHints: "Passe den Text an deine persönliche Story an.",
          });
        } catch (libErr) {
          console.error("[Approval] Auto-save to library failed:", libErr);
        }
        } // end hasMedia check

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

    reject: approvedProcedure
      .input(z.object({
        id: z.number(),
        comment: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        // Jeder Partner darf nur seinen EIGENEN Content ablehnen
        if (post.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Du kannst nur deinen eigenen Content ablehnen." });

        await db.updateContentPostStatus(input.id, "rejected", ctx.user.id, input.comment);
        await db.createApprovalLog({
          contentPostId: input.id,
          userId: ctx.user.id,
          action: "rejected",
          comment: input.comment,
          previousStatus: post.post.status,
          newStatus: "rejected",
        });

        // Send notification via Brevo
        try {
          await sendBrevoNotification({
            title: `❌ Content abgelehnt`,
            content: `${ctx.user.name || "Partner"} hat Content abgelehnt: "${(post.post.editedContent || post.post.content).substring(0, 80)}..." | Grund: ${input.comment}`,
          });
        } catch { /* notification failure shouldn't block rejection */ }

        return { success: true };
      }),

    // Publish approved post to Blotato (ONLY after approval!)
    publish: approvedProcedure
      .input(z.object({
        id: z.number(),
        scheduledDate: z.string().optional(),
        useBlotatoKeyOf: z.number().optional(), // Use specific team member's Blotato key
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        // Jeder Partner darf nur seinen EIGENEN Content publishen
        if (post.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Du kannst nur deinen eigenen Content veröffentlichen." });
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

        // Send notification via Brevo
        try {
          await sendBrevoNotification({
            title: `🚀 Content veröffentlicht`,
            content: `${ctx.user.name || "Partner"} hat Content auf ${platforms.join(", ")} veröffentlicht via Blotato. ${postIds.length} Plattform(en) geplant.`,
          });
        } catch { /* notification failure shouldn't block publishing */ }

        return { success: true, postIds };
      }),

    logs: approvedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => {
        return db.getApprovalLogsForPost(input.contentPostId);
      }),
  }),

  // ─── Quality Gate ──────────────────────────────────────────
  qualityGate: router({
    check: approvedProcedure
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
    get: approvedProcedure.query(() => api.LR_BRAND_VOICE),
    getCTAs: approvedProcedure
      .input(z.object({ platform: z.string() }))
      .query(({ input }) => api.CTA_TEMPLATES[input.platform.toLowerCase()] || {}),
    getHooks: approvedProcedure.query(() => api.HOOK_FORMULAS),
    getScriptTemplates: approvedProcedure.query(() => api.VIRAL_SCRIPT_TEMPLATES),
    getBlockers: approvedProcedure.query(() => api.LR_BRAND_VOICE.audienceBlockers),

    generateWithVoice: approvedProcedure
      .input(z.object({
        contentType: z.enum(["post", "reel_script", "story", "carousel", "ad_copy", "linkedin", "youtube_script"]),
        platform: z.string(),
        pillar: z.string(),
        topic: z.string(),
        hookStyle: z.enum(["curiosity", "story", "value", "contrarian", "socialProof"]).optional(),
        scriptTemplate: z.string().optional(),
        includeBlocker: z.boolean().optional(),
        autoGenerateImage: z.boolean().optional(),
        autoGenerateVideo: z.boolean().optional(),
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

        // Auto-generate image if requested
        let imageUrl: string | null = null;
        if (input.autoGenerateImage) {
          try {
            const imgPrompt = `${input.topic}, ${input.pillar}, premium social media content, cinematic lighting, professional photography, no text, no words, no letters, no watermarks`;
            if (process.env.FAL_API_KEY) {
              const premiumResult = await api.generatePremiumImage({ prompt: imgPrompt, aspectRatio: "1:1" });
              imageUrl = premiumResult.imageUrl;
            } else {
              const { generateImage } = await import("./_core/imageGeneration");
              const fallbackResult = await generateImage({ prompt: imgPrompt });
              imageUrl = fallbackResult.url || null;
            }
            if (imageUrl) {
              await db.updateContentPost(postId, { mediaUrl: imageUrl, mediaType: "image", imagePrompt: imgPrompt } as any);
            }
          } catch (err) {
            console.error("[AutoImage] Brand Voice generation failed:", err);
          }
        }

        // Auto-generate video if requested
        let videoUrl: string | null = null;
        if (input.autoGenerateVideo) {
          try {
            const vidPrompt = `${input.topic}, ${input.pillar}, cinematic slow motion, premium social media content, professional`;
            const videoResult = await api.generateVideoWithFal({
              prompt: vidPrompt,
              imageUrl: imageUrl || undefined,
              model: "auto",
              duration: "5",
              aspectRatio: "9:16",
              generateAudio: true,
            });
            if (videoResult.videoUrl) {
              videoUrl = videoResult.videoUrl;
              await db.updateContentPost(postId, {
                videoUrl: videoResult.videoUrl,
                mediaType: imageUrl ? "image_and_video" : "video",
                videoPrompt: vidPrompt,
              } as any);
            }
          } catch (err) {
            console.error("[AutoVideo] Brand Voice generation failed:", err);
          }
        }

        return { id: postId, content: generatedContent, qualityGate: qualityResult, imageUrl, videoUrl };
      }),
  }),

  // ─── Content Templates ─────────────────────────────────────
  templates: router({
    list: approvedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => db.getContentTemplates(input?.category)),

    create: approvedProcedure
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

    delete: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteContentTemplate(input.id);
        return { success: true };
      }),

    useTemplate: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementTemplateUsage(input.id);
        return { success: true };
      }),
  }),

  // ─── Creator Spy ───────────────────────────────────────────
  creatorSpy: router({
    reports: approvedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getCreatorSpyReports(input?.limit || 10)),

    latest: approvedProcedure.query(async () => db.getLatestCreatorSpyReport()),

    analyze: approvedProcedure
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
    list: approvedProcedure
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

    add: approvedProcedure
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

    copy: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementLibraryCopyCount(input.id);
        return { success: true };
      }),

    delete: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFromContentLibrary(input.id);
        return { success: true };
      }),
  }),

  // ─── A/B Testing ───────────────────────────────────────────
  abTest: router({
    list: approvedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.getABTestGroups(input?.status)),

    create: approvedProcedure
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

    complete: approvedProcedure
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
    topPerforming: approvedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getTopPerformingPosts(input?.limit || 10)),

    updateScore: approvedProcedure
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
    analyzeSuccess: approvedProcedure
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
    get: approvedProcedure
      .input(z.object({ platform: z.string().optional() }).optional())
      .query(async ({ input }) => db.getOptimalPostingTimes(input?.platform)),

    // Smart Scheduling: Nächsten optimalen Zeitpunkt für eine Plattform
    smartNext: approvedProcedure
      .input(z.object({ platform: z.string() }))
      .query(({ input }) => {
        const { getNextSmartPostingTime } = require("./smartPostingTimes");
        return getNextSmartPostingTime(input.platform);
      }),

    // Smart Scheduling: Nächste optimale Zeiten für mehrere Plattformen
    smartNextMulti: approvedProcedure
      .input(z.object({ platforms: z.array(z.string()) }))
      .query(({ input }) => {
        const { getNextSmartPostingTimes } = require("./smartPostingTimes");
        return getNextSmartPostingTimes(input.platforms);
      }),

    // Kompletter Wochenplan für eine Plattform
    weeklySchedule: approvedProcedure
      .input(z.object({ platform: z.string() }))
      .query(({ input }) => {
        const { getWeeklySchedule } = require("./smartPostingTimes");
        return getWeeklySchedule(input.platform);
      }),

    // Alle Plattform-Schedules auf einen Blick
    allSchedules: approvedProcedure
      .query(() => {
        const { getAllSchedules } = require("./smartPostingTimes");
        return getAllSchedules();
      }),

    // Bester Zeitpunkt für einen bestimmten Tag
    bestForDay: approvedProcedure
      .input(z.object({ platform: z.string(), dayOfWeek: z.number().min(0).max(6) }))
      .query(({ input }) => {
        const { getBestTimeForDay } = require("./smartPostingTimes");
        return getBestTimeForDay(input.platform, input.dayOfWeek);
      }),

    calculate: approvedProcedure.mutation(async () => {
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
    get: approvedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        hasBlotatoKey: !!user.blotatoApiKey,
        autoPostEnabled: user.autoPostEnabled,
        preferredPostingTimes: user.preferredPostingTimes,
        personalBranding: user.personalBranding,
      };
    }),

    saveBlotatoKey: approvedProcedure
      .input(z.object({ blotatoApiKey: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserBlotatoKey(ctx.user.id, input.blotatoApiKey);
        return { success: true };
      }),

    removeBlotatoKey: approvedProcedure
      .mutation(async ({ ctx }) => {
        await db.updateUserBlotatoKey(ctx.user.id, null);
        return { success: true };
      }),

    toggleAutoPost: approvedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserAutoPost(ctx.user.id, input.enabled);
        return { success: true };
      }),

    savePostingTimes: approvedProcedure
      .input(z.object({ times: z.record(z.string(), z.string()) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPostingTimes(ctx.user.id, input.times as Record<string, string>);
        return { success: true };
      }),

    savePersonalBranding: approvedProcedure
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
    summary: approvedProcedure.query(async () => db.getAnalyticsSummary()),
    forPost: approvedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => db.getAnalyticsForPost(input.contentPostId)),
  }),

  // ─── Team Management ───────────────────────────────────────
  team: router({
    list: approvedProcedure.query(async () => db.getAllUsers()),
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
    updateProfile: approvedProcedure
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

  // ─── LR Products (Botpress Produktbild-Bibliothek) ────────
  products: router({
    list: approvedProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getLRProducts({
          category: input?.category,
          search: input?.search,
          limit: input?.limit,
          offset: input?.offset,
        });
      }),

    categories: approvedProcedure.query(async () => {
      return db.getLRProductCategories();
    }),

    count: approvedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getLRProductCount(input?.category);
      }),

    getById: approvedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getLRProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    import: approvedProcedure.mutation(async () => {
      // Import products from Botpress ProductTable
      const https = await import("https");
      const TOKEN = "bp_bak_0JrsLy9xuwOrJinDMZwYxOXbymwyQ7oguOhh";
      const BOT_ID = "cac882a1-cf8f-4b8f-9740-8f96ea9558db";
      const TABLE_ID = "table_01JTKAZKTK0P69PRWZ3PMEYDR9";

      const fetchRows = (offset: number, limit: number): Promise<any> => {
        return new Promise((resolve, reject) => {
          const url = `https://api.botpress.cloud/v1/tables/${TABLE_ID}/rows/find`;
          const body = JSON.stringify({ offset, limit });
          const options = {
            method: "POST",
            headers: {
              Authorization: `bearer ${TOKEN}`,
              "x-bot-id": BOT_ID,
              "Content-Type": "application/json",
              "Content-Length": String(Buffer.byteLength(body)),
            },
          };
          const req = https.request(url, options, (res: any) => {
            let data = "";
            res.on("data", (chunk: string) => (data += chunk));
            res.on("end", () => {
              try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
          });
          req.on("error", reject);
          req.write(body);
          req.end();
        });
      };

      let allRows: any[] = [];
      let offset = 0;
      const limit = 100;
      while (true) {
        const result = await fetchRows(offset, limit);
        if (result.rows && result.rows.length > 0) {
          allRows = allRows.concat(result.rows);
          if (result.rows.length < limit) break;
          offset += limit;
        } else break;
      }

      // Clear existing and import fresh
      await db.clearLRProducts();
      const products = allRows
        .filter((r: any) => r.Image)
        .map((r: any) => ({
          name: r.Name || "Unbekannt",
          category: r.Categories || "Sonstige",
          price: r.Price ? String(Math.round(r.Price * 100) / 100) : null,
          imageUrl: r.Image,
          description: r.Beschreibung_kurz || null,
          descriptionWA: r.Beschreibung_kurz_wa || null,
          whatsappText: r.WhatsApp_Text || null,
        }));

      const imported = await db.importLRProducts(products);
      return { imported, total: allRows.length };
    }),
  }),

  // ─── Trend Scanner ─────────────────────────────────────────
  trends: router({
    scan: approvedProcedure.mutation(async () => {
      const trends = await trendScanner.runFullTrendScan();
      if (trends.length > 0) {
        await db.saveTrendScans(trends);
      }
      return { scanned: trends.length, topTrends: trends.slice(0, 10) };
    }),
    scanPillar: approvedProcedure
      .input(z.object({ pillar: z.string(), platform: z.enum(["tiktok", "youtube", "reddit"]).optional() }))
      .mutation(async ({ input }) => {
        const pillarData = trendScanner.CONTENT_PILLARS[input.pillar as trendScanner.PillarKey];
        if (!pillarData) throw new TRPCError({ code: "BAD_REQUEST", message: "Unbekannter Pillar" });
        const keywords = [...pillarData.keywords].slice(0, 3);
        const allTrends: any[] = [];
        for (const kw of keywords) {
          if (!input.platform || input.platform === "tiktok") {
            const tt = await trendScanner.scanTikTok(kw, input.pillar as trendScanner.PillarKey);
            allTrends.push(...tt);
          }
          if (!input.platform || input.platform === "youtube") {
            const yt = await trendScanner.scanYouTube(kw, input.pillar as trendScanner.PillarKey);
            allTrends.push(...yt);
          }
          await new Promise(r => setTimeout(r, 300));
        }
        if (allTrends.length > 0) await db.saveTrendScans(allTrends);
        return { scanned: allTrends.length, trends: allTrends.slice(0, 20) };
      }),
    latest: approvedProcedure
      .input(z.object({ platform: z.string().optional(), pillar: z.string().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getLatestTrends({ platform: input?.platform, pillar: input?.pillar, limit: input?.limit });
      }),
    top: approvedProcedure
      .input(z.object({ hours: z.number().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTopTrends(input?.hours || 24, input?.limit || 20);
      }),
    generateIdeas: approvedProcedure.mutation(async () => {
      const topTrends = await db.getTopTrends(48, 20);
      if (topTrends.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Keine Trends gefunden. Bitte zuerst einen Scan durchführen." });
      }
      const ideas = await trendScanner.generateContentIdeasFromTrends(topTrends);
      return ideas;
    }),
    markUsed: approvedProcedure
      .input(z.object({ trendId: z.number(), contentPostId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markTrendUsed(input.trendId, input.contentPostId);
        return { success: true };
      }),
    pillars: publicProcedure.query(() => {
      return Object.entries(trendScanner.CONTENT_PILLARS).map(([key, val]) => ({
        key,
        name: val.name,
        emoji: val.emoji,
        frequency: val.frequency,
        keywordCount: val.keywords.length,
      }));
    }),

    // Autopilot: Trend → Content + Bild → zur Freigabe - alles in einem Schritt
    autopilot: approvedProcedure
      .input(z.object({
        trendId: z.number(),
        trendTitle: z.string(),
        trendPlatform: z.string(),
        trendPillar: z.string(),
        trendViralScore: z.number().optional(),
        trendSourceUrl: z.string().optional(),
        contentType: z.string().optional(),
        targetPlatform: z.string().optional(),
        generateImage: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Step 1: Generate content from trend
        const generated = await trendScanner.autopilotGenerateFromTrend(
          {
            title: input.trendTitle,
            platform: input.trendPlatform,
            pillar: input.trendPillar,
            sourceUrl: input.trendSourceUrl,
            viralScore: input.trendViralScore,
          },
          input.contentType || "post",
          input.targetPlatform || "instagram"
        );

        // Step 2: Create content post (goes to approval queue)
        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: input.contentType || "post",
          content: generated.content,
          platforms: [input.targetPlatform || "instagram"],
          status: "pending",
          topic: `Trend: ${input.trendTitle.slice(0, 100)}`,
          pillar: input.trendPillar,
          apiMetadata: {
            source: "autopilot",
            trendId: input.trendId,
            trendPlatform: input.trendPlatform,
            viralScore: input.trendViralScore,
            hook: generated.hook,
            imagePrompt: generated.imagePrompt,
          },
        });

        // Step 3: Generate image if requested
        let imageUrl: string | null = null;
        if (input.generateImage !== false) {
          try {
            // Premium: Nano Banana Pro wenn FAL_API_KEY vorhanden
            if (process.env.FAL_API_KEY) {
              const premiumResult = await api.generatePremiumImage({ prompt: generated.imagePrompt, aspectRatio: "1:1" });
              imageUrl = premiumResult.imageUrl;
            } else {
              const { generateImage } = await import("./_core/imageGeneration");
              const fallbackResult = await generateImage({ prompt: generated.imagePrompt });
              imageUrl = fallbackResult.url || null;
            }
            if (imageUrl) {
              await db.updateContentPost(postId, {
                mediaUrl: imageUrl,
                mediaType: "image",
              } as any);
            }
          } catch (err) {
            console.error("[Autopilot] Image generation failed:", err);
          }
        }

        // Step 4: Generate video from image
        let videoUrl: string | null = null;
        if (imageUrl) {
          try {
            const videoResult = await api.generateVideoWithFal({
              prompt: generated.imagePrompt,
              imageUrl,
              model: "auto",
              duration: "5",
              aspectRatio: "9:16",
              generateAudio: true,
            });
            videoUrl = videoResult.videoUrl || null;
            if (videoUrl) {
              await db.updateContentPost(postId, { videoUrl } as any);
            }
          } catch (err) {
            console.error("[Autopilot] Video generation failed:", err);
          }
        }

        // Step 5: Generate smart hashtags
        let hashtags: string[] = [];
        try {
          const hashResult = await hashtagEngine.generateSmartHashtags(
            generated.content,
            input.targetPlatform || "instagram",
            input.trendPillar,
            input.trendTitle
          );
          hashtags = hashResult.hashtags || [];
          if (hashtags.length > 0) {
            const contentWithHashtags = generated.content + "\n\n" + hashtags.join(" ");
            await db.updateContentPost(postId, { editedContent: contentWithHashtags } as any);
          }
        } catch (err) {
          console.error("[Autopilot] Hashtag generation failed:", err);
        }

        // Step 6: Mark trend as used
        await db.markTrendUsed(input.trendId, postId);

        // Step 7: Log
        await db.createApprovalLog({
          contentPostId: postId,
          userId: ctx.user.id,
          action: "edited",
          comment: `Autopilot: Content + Bild + Video + Hashtags aus ${input.trendPlatform}-Trend generiert (Viral Score: ${input.trendViralScore}/100)`,
          previousStatus: null,
          newStatus: "pending",
        });

        return {
          postId,
          content: generated.content,
          hook: generated.hook,
          imagePrompt: generated.imagePrompt,
          imageUrl,
          videoUrl,
          hashtags,
        };
      }),
  }),

  // ─── Smart Hashtag Engine ──────────────────────────────────
  hashtags: router({
    generate: approvedProcedure
      .input(z.object({
        content: z.string(),
        platform: z.string().default("instagram"),
        pillar: z.string().optional(),
        topic: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return hashtagEngine.generateSmartHashtags(input.content, input.platform, input.pillar, input.topic);
      }),
    research: approvedProcedure
      .input(z.object({ topic: z.string(), pillar: z.string().optional() }))
      .mutation(async ({ input }) => {
        return hashtagEngine.researchInstagramHashtags(input.topic, input.pillar);
      }),
    platforms: publicProcedure.query(() => {
      return Object.entries(hashtagEngine.PLATFORM_RULES).map(([key, val]) => ({
        platform: key,
        maxHashtags: val.maxHashtags,
        style: val.style,
        placement: val.placement,
      }));
    }),
    pools: publicProcedure.query(() => {
      return Object.entries(hashtagEngine.LR_HASHTAG_POOLS).map(([key, tags]) => ({
        category: key,
        hashtags: tags,
        count: tags.length,
      }));
    }),
  }),

  // ─── Monatsplan Generator ─────────────────────────────────
  monthlyPlan: router({
    generate: approvedProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number().min(2024).max(2030) }))
      .mutation(async ({ ctx, input }) => {
        const plan = await hashtagEngine.generateMonthlyPlan(input.month, input.year);
        const planId = await db.saveMonthlyPlan({
          month: input.month,
          year: input.year,
          planData: plan.posts,
          summary: plan.summary,
          totalPosts: plan.posts.length,
          postsCreated: 0,
          createdById: ctx.user.id,
        });
        return { id: planId, ...plan };
      }),
    list: approvedProcedure.query(async () => {
      return db.getMonthlyPlans();
    }),
    get: approvedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMonthlyPlan(input.id);
      }),
    createPostFromPlan: approvedProcedure
      .input(z.object({
        planId: z.number(),
        dayIndex: z.number(),
        topic: z.string(),
        hook: z.string(),
        platform: z.string(),
        pillar: z.string(),
        contentType: z.string(),
        hashtags: z.array(z.string()),
        imagePrompt: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate full content from the plan item
        const generated = await trendScanner.autopilotGenerateFromTrend(
          { title: input.topic, platform: input.platform, pillar: input.pillar },
          input.contentType,
          input.platform
        );
        const postId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: input.contentType,
          content: generated.content,
          platforms: [input.platform],
          status: "pending",
          topic: input.topic,
          pillar: input.pillar,
          apiMetadata: { source: "monthly_plan", planId: input.planId, hook: input.hook, hashtags: input.hashtags },
        });
        // Update plan counter
        const plan = await db.getMonthlyPlan(input.planId);
        if (plan) {
          await db.updateMonthlyPlan(input.planId, { postsCreated: (plan.postsCreated || 0) + 1 });
        }
        return { postId, content: generated.content };
      }),
  }),

  // ─── Evergreen Recycling ───────────────────────────────────
  evergreen: router({
    add: approvedProcedure
      .input(z.object({
        originalPostId: z.number(),
        recycleAfterDays: z.number().default(30),
        maxRecycles: z.number().default(3),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const nextRecycleAt = new Date(Date.now() + input.recycleAfterDays * 24 * 60 * 60 * 1000);
        const id = await db.addEvergreenPost({
          originalPostId: input.originalPostId,
          recycleAfterDays: input.recycleAfterDays,
          maxRecycles: input.maxRecycles,
          notes: input.notes,
          nextRecycleAt,
          qualifyingScore: 0,
        });
        return { id };
      }),
    list: approvedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return db.getEvergreenPosts(input?.activeOnly !== false);
      }),
    due: approvedProcedure.query(async () => {
      return db.getEvergreenPostsDueForRecycle();
    }),
    candidates: approvedProcedure.query(async () => {
      return db.getEvergreenCandidates();
    }),
    recycle: approvedProcedure
      .input(z.object({ evergreenId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const egPosts = await db.getEvergreenPosts(true);
        const eg = egPosts.find(p => p.id === input.evergreenId);
        if (!eg) throw new TRPCError({ code: "NOT_FOUND" });
        if (eg.recycleCount >= eg.maxRecycles) {
          await db.updateEvergreenPost(eg.id, { isActive: false });
          throw new TRPCError({ code: "BAD_REQUEST", message: "Max Recycles erreicht" });
        }
        // Get original post
        const posts = await db.getContentPosts({ limit: 1 });
        // Create recycled copy
        const original = await db.getContentPosts({ limit: 999 });
        const origPost = original.find((p: any) => (p.post?.id || p.id) === eg.originalPostId);
        if (!origPost) throw new TRPCError({ code: "NOT_FOUND", message: "Original-Post nicht gefunden" });
        const postData = (origPost as any).post || origPost;
        const newPostId = await db.createContentPost({
          createdById: ctx.user.id,
          contentType: postData.contentType || "post",
          content: postData.content,
          platforms: postData.platforms || ["instagram"],
          status: "pending",
          topic: `♻️ Recycled: ${postData.topic || "Evergreen Post"}`,
          pillar: postData.pillar,
          mediaUrl: postData.mediaUrl,
          mediaType: postData.mediaType,
          apiMetadata: { source: "evergreen_recycle", originalPostId: eg.originalPostId, recycleNumber: eg.recycleCount + 1 },
        });
        // Update evergreen record
        const nextRecycle = new Date(Date.now() + eg.recycleAfterDays * 24 * 60 * 60 * 1000);
        await db.updateEvergreenPost(eg.id, {
          recycleCount: eg.recycleCount + 1,
          lastRecycledAt: new Date(),
          nextRecycleAt: nextRecycle,
          isActive: eg.recycleCount + 1 < eg.maxRecycles,
        });
        return { newPostId, recycleCount: eg.recycleCount + 1 };
      }),
    remove: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeEvergreenPost(input.id);
        return { success: true };
      }),
  }),

  // ─── Lifestyle Content Engine ──────────────────────────────
  lifestyle: router({
    categories: publicProcedure.query(() => {
      return Object.entries(lifestyleEngine.LIFESTYLE_CATEGORIES).map(([key, cat]) => ({
        key,
        name: cat.name,
        emoji: cat.emoji,
        description: cat.description,
        moods: cat.moods,
        keywords: cat.keywords,
        imagePromptCount: cat.imagePrompts.length,
        videoPromptCount: cat.videoPrompts.length,
      }));
    }),

    generate: approvedProcedure
      .input(z.object({
        category: z.string(),
        topic: z.string().optional(),
        platform: z.string().optional(),
        mood: z.string().optional(),
        includeImage: z.boolean().optional(),
        includeVideo: z.boolean().optional(),
        autoCreatePost: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await lifestyleEngine.generateLifestyleContent({
          category: input.category,
          topic: input.topic,
          platform: input.platform,
          mood: input.mood,
          includeImage: input.includeImage !== false,
          includeVideo: input.includeVideo,
        });

        let postId: number | null = null;
        let imageUrl: string | null = null;

        // Auto-create post if requested
        if (input.autoCreatePost !== false) {
          postId = await db.createContentPost({
            createdById: ctx.user.id,
            contentType: "post",
            content: result.text,
            platforms: [input.platform || "instagram"],
            status: "pending",
            topic: input.topic || `Lifestyle: ${lifestyleEngine.LIFESTYLE_CATEGORIES[input.category]?.name || input.category}`,
            pillar: "Lifestyle & Erfolg",
            apiMetadata: {
              source: "lifestyle_engine",
              category: input.category,
              mood: result.mood,
              hook: result.hook,
              hashtags: result.hashtags,
              imagePrompt: result.imagePrompt,
              videoPrompt: result.videoPrompt,
            },
          });

          // Generate image automatically
          if (input.includeImage !== false) {
            try {
              // Premium: Nano Banana Pro
              if (process.env.FAL_API_KEY) {
                const premiumResult = await api.generatePremiumImage({ prompt: result.imagePrompt, aspectRatio: "1:1" });
                imageUrl = premiumResult.imageUrl;
              } else {
                const { generateImage } = await import("./_core/imageGeneration");
                const fallbackResult = await generateImage({ prompt: result.imagePrompt });
                imageUrl = fallbackResult.url || null;
              }
              if (imageUrl) {
                await db.updateContentPost(postId, {
                  mediaUrl: imageUrl,
                  mediaType: "image",
                  imagePrompt: result.imagePrompt,
                } as any);
              }
            } catch (err) {
              console.error("[LifestyleEngine] Image generation failed:", err);
            }
          }

          // Generate video if requested
          if (input.includeVideo && result.videoPrompt) {
            try {
              const videoResult = await api.generateVideoWithFal({
                prompt: result.videoPrompt,
                imageUrl: imageUrl || undefined,
                model: "auto", // Automatisch: Veo 3.1 (<=8s) oder Kling 3.0 Pro (>8s)
                duration: "5",
                aspectRatio: "9:16",
                generateAudio: true,
              });
              if (videoResult.videoUrl) {
                await db.updateContentPost(postId, {
                  videoUrl: videoResult.videoUrl,
                  mediaType: imageUrl ? "image_and_video" : "video",
                  videoPrompt: result.videoPrompt,
                } as any);
              }
            } catch (err) {
              console.error("[LifestyleEngine] Video generation failed:", err);
            }
          }

          await db.createApprovalLog({
            contentPostId: postId,
            userId: ctx.user.id,
            action: "edited",
            comment: `Lifestyle-Engine: ${lifestyleEngine.LIFESTYLE_CATEGORIES[input.category]?.emoji || ""} ${lifestyleEngine.LIFESTYLE_CATEGORIES[input.category]?.name || input.category} Content generiert`,
            previousStatus: null,
            newStatus: "pending",
          });
        }

        return {
          ...result,
          postId,
          imageUrl,
        };
      }),

    generateBatch: approvedProcedure
      .input(z.object({
        count: z.number().min(1).max(20).default(5),
        categories: z.array(z.string()).optional(),
        platform: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const results = await lifestyleEngine.generateLifestyleBatch(
          input.count,
          input.categories,
          input.platform
        );

        const postIds: number[] = [];
        for (const result of results) {
          const postId = await db.createContentPost({
            createdById: ctx.user.id,
            contentType: "post",
            content: result.text,
            platforms: [input.platform || "instagram"],
            status: "pending",
            topic: `Lifestyle: ${lifestyleEngine.LIFESTYLE_CATEGORIES[result.category]?.name || result.category}`,
            pillar: "Lifestyle & Erfolg",
            apiMetadata: {
              source: "lifestyle_engine_batch",
              category: result.category,
              mood: result.mood,
              hook: result.hook,
              hashtags: result.hashtags,
            },
          });
          postIds.push(postId);

          // Generate image for each (Premium: Nano Banana Pro)
          try {
            let imgUrl: string | null = null;
            if (process.env.FAL_API_KEY) {
              const premiumResult = await api.generatePremiumImage({ prompt: result.imagePrompt, aspectRatio: "1:1" });
              imgUrl = premiumResult.imageUrl;
            } else {
              const { generateImage } = await import("./_core/imageGeneration");
              const fallbackResult = await generateImage({ prompt: result.imagePrompt });
              imgUrl = fallbackResult.url || null;
            }
            if (imgUrl) {
              await db.updateContentPost(postId, {
                mediaUrl: imgUrl,
                mediaType: "image",
                imagePrompt: result.imagePrompt,
              } as any);
            }
          } catch (err) {
            console.error("[LifestyleEngine Batch] Image failed:", err);
          }
        }

        return { count: results.length, postIds, results };
      }),

    customImagePrompt: approvedProcedure
      .input(z.object({
        text: z.string(),
        category: z.string(),
        mood: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const prompt = await lifestyleEngine.generateCustomImagePrompt(
          input.text,
          input.category,
          input.mood
        );
        return { prompt };
      }),
  }),

  // ─── Blotato Calendar (Scheduled Posts) ────────────────────
  calendar: router({
    // Alle geplanten Posts von Blotato abrufen
    list: approvedProcedure
      .input(z.object({ limit: z.number().optional(), cursor: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return api.getScheduledPosts(input?.limit || 100, input?.cursor);
      }),

    // Einzelnen geplanten Post abrufen
    get: approvedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const post = await api.getScheduledPost(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Geplanter Post nicht gefunden" });
        return post;
      }),

    // Geplanten Post aktualisieren (Text, Medien, Zeitpunkt)
    update: approvedProcedure
      .input(z.object({
        id: z.string(),
        scheduledTime: z.string().optional(),
        text: z.string().optional(),
        mediaUrls: z.array(z.string()).optional(),
        platform: z.string().optional(),
        accountId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const patch: any = {};
        if (input.scheduledTime) {
          patch.scheduledTime = input.scheduledTime;
        }
        if (input.text || input.mediaUrls || input.platform || input.accountId) {
          // Erst den aktuellen Post holen um fehlende Felder zu ergänzen
          const current = await api.getScheduledPost(input.id);
          if (!current) throw new TRPCError({ code: "NOT_FOUND" });
          patch.draft = {
            accountId: input.accountId || current.draft.accountId,
            content: {
              text: input.text || current.draft.content.text,
              mediaUrls: input.mediaUrls || current.draft.content.mediaUrls,
              platform: input.platform || current.draft.content.platform,
            },
            target: {
              targetType: input.platform || current.draft.target.targetType,
            },
          };
        }
        const success = await api.updateScheduledPost(input.id, patch);
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Update fehlgeschlagen" });
        return { success: true };
      }),

    // Geplanten Post verschieben (nur Zeitpunkt ändern)
    reschedule: approvedProcedure
      .input(z.object({ id: z.string(), newTime: z.string() }))
      .mutation(async ({ input }) => {
        const success = await api.reschedulePost(input.id, input.newTime);
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Verschieben fehlgeschlagen" });
        return { success: true };
      }),

    // Geplanten Post löschen
    delete: approvedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const success = await api.deleteScheduledPost(input.id);
        if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Löschen fehlgeschlagen" });
        return { success: true };
      }),

    // Kalender-Übersicht: Posts nach Datum gruppiert
    byDate: approvedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const result = await api.getScheduledPosts(input?.limit || 100);
        // Gruppiere nach Datum
        const byDate: Record<string, typeof result.items> = {};
        for (const item of result.items) {
          const date = item.scheduledAt.split("T")[0];
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(item);
        }
        return {
          dates: Object.entries(byDate).map(([date, posts]) => ({ date, posts, count: posts.length })),
          totalCount: result.items.length,
        };
      }),
  }),

  // ─── AI Content Intelligence ────────────────────────────────
  contentIntelligence: router({
    // Deep AI scoring of a post - uses LLM for nuanced analysis
    score: approvedProcedure
      .input(z.object({
        content: z.string(),
        platform: z.string().default("instagram"),
        contentType: z.string().default("post"),
        hasMedia: z.boolean().default(false),
        hasVideo: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Du bist ein Social Media Experte und Content-Analyst für das LR Lifestyle Team. Bewerte den folgenden Content auf einer Skala von 0-100 und gib detailliertes Feedback.

Bewertungskriterien:
- Hook-Qualität (0-20): Fesselt der Einstieg sofort?
- Emotionale Wirkung (0-20): Löst der Content Emotionen aus?
- CTA-Stärke (0-15): Gibt es einen klaren Call-to-Action?
- Plattform-Fit (0-15): Passt der Content zur Plattform ${input.platform}?
- Viral-Potenzial (0-15): Würden Leute das teilen/kommentieren?
- Brand-Alignment (0-15): Passt es zur LR Lifestyle Marke?

Gib die Bewertung als JSON zurück.`
            },
            {
              role: "user",
              content: `Bewerte diesen ${input.contentType} für ${input.platform}:\n\n"${input.content}"\n\nHat Bild: ${input.hasMedia ? "Ja" : "Nein"}\nHat Video: ${input.hasVideo ? "Ja" : "Nein"}`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "content_score",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  totalScore: { type: "integer", description: "Gesamtscore 0-100" },
                  hookScore: { type: "integer", description: "Hook-Qualität 0-20" },
                  emotionScore: { type: "integer", description: "Emotionale Wirkung 0-20" },
                  ctaScore: { type: "integer", description: "CTA-Stärke 0-15" },
                  platformFitScore: { type: "integer", description: "Plattform-Fit 0-15" },
                  viralScore: { type: "integer", description: "Viral-Potenzial 0-15" },
                  brandScore: { type: "integer", description: "Brand-Alignment 0-15" },
                  feedback: { type: "string", description: "Kurzes Feedback (max 2 Sätze)" },
                  improvements: { type: "array", items: { type: "string" }, description: "3 konkrete Verbesserungsvorschläge" },
                  predictedEngagement: { type: "string", description: "Geschätzte Engagement-Rate (z.B. 2.5%-4%)" },
                },
                required: ["totalScore", "hookScore", "emotionScore", "ctaScore", "platformFitScore", "viralScore", "brandScore", "feedback", "improvements", "predictedEngagement"],
                additionalProperties: false,
              },
            },
          },
        });

        const raw = llmResponse.choices?.[0]?.message?.content;
        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch {
            return { totalScore: 50, feedback: "Bewertung konnte nicht vollständig durchgeführt werden.", improvements: [], predictedEngagement: "k.A." };
          }
        }
        return { totalScore: 50, feedback: "Bewertung nicht verfügbar.", improvements: [], predictedEngagement: "k.A." };
      }),

    // Suggest improvements for a post
    improve: approvedProcedure
      .input(z.object({
        content: z.string(),
        platform: z.string().default("instagram"),
        focusArea: z.enum(["hook", "cta", "emotion", "viral", "all"]).default("all"),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const focusMap: Record<string, string> = {
          hook: "Verbessere den Hook/Einstieg - er muss in 2 Sekunden fesseln",
          cta: "Verbessere den Call-to-Action - er muss klar und unwiderstehlich sein",
          emotion: "Verstärke die emotionale Wirkung - der Content muss berühren",
          viral: "Mach den Content viral-tauglicher - er muss geteilt werden wollen",
          all: "Verbessere den gesamten Content in allen Bereichen",
        };

        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Du bist ein Top Social Media Copywriter für das LR Lifestyle Team. ${focusMap[input.focusArea]}. Gib den verbesserten Content zurück.`
            },
            {
              role: "user",
              content: `Verbessere diesen ${input.platform}-Post:\n\n"${input.content}"\n\nGib NUR den verbesserten Text zurück, keine Erklärungen.`
            }
          ],
        });

        const improved = typeof llmResponse.choices?.[0]?.message?.content === "string"
          ? llmResponse.choices[0].message.content
          : input.content;

        return { improvedContent: improved };
      }),
  }),

  // ─── AI Copilot (Inline-Assistent beim Schreiben) ─────────
  aiCopilot: router({
    // Inline-Vorschläge beim Schreiben
    suggest: approvedProcedure
      .input(z.object({
        text: z.string().min(1),
        platform: z.string().default("instagram"),
        contentType: z.string().default("post"),
        action: z.enum(["continue", "improve", "hook", "cta", "hashtags", "shorten", "lengthen", "emoji", "translate"]),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const actionPrompts: Record<string, string> = {
          continue: "Schreibe den Text weiter. Behalte den Stil bei und füge 2-3 weitere Sätze hinzu.",
          improve: "Verbessere den Text. Mach ihn fesselnder, emotionaler und professioneller.",
          hook: "Schreibe 3 alternative Hooks/Einstiege für diesen Content. Nummeriere sie 1-3.",
          cta: "Schreibe 3 starke Call-to-Actions die zum Text passen. Nummeriere sie 1-3.",
          hashtags: `Generiere 5 relevante Hashtags für ${input.platform}. Nur die Hashtags, einer pro Zeile.`,
          shorten: "Kürze den Text auf die Hälfte. Behalte die Kernaussage.",
          lengthen: "Erweitere den Text um das Doppelte. Füge Details, Emotionen und Storytelling hinzu.",
          emoji: "Füge passende Emojis an den richtigen Stellen ein. Nicht übertreiben, max 5-8 Emojis.",
          translate: "Übersetze den Text ins Englische. Behalte den Stil und die Emotionen bei.",
        };
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: `Du bist ein KI-Copilot für Social Media Content. Du hilfst beim Schreiben von ${input.platform}-Posts. Antworte NUR mit dem Ergebnis, keine Erklärungen.` },
            { role: "user", content: `${actionPrompts[input.action]}\n\nAktueller Text:\n"${input.text}"` },
          ],
        });
        const result = typeof llmResponse.choices?.[0]?.message?.content === "string"
          ? llmResponse.choices[0].message.content
          : "";
        return { suggestion: result, action: input.action };
      }),

    // Kompletten Content aus Stichworten generieren
    fromBullets: approvedProcedure
      .input(z.object({
        bullets: z.array(z.string()).min(1),
        platform: z.string().default("instagram"),
        contentType: z.string().default("post"),
        tone: z.enum(["professional", "casual", "motivational", "provocative", "storytelling"]).default("motivational"),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const toneMap: Record<string, string> = {
          professional: "professionell und seriös",
          casual: "locker und nahbar",
          motivational: "motivierend und inspirierend",
          provocative: "provokant und polarisierend",
          storytelling: "als persönliche Geschichte erzählt",
        };
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: `Du bist ein Top Social Media Copywriter für das LR Lifestyle Team. Erstelle aus Stichpunkten einen fertigen ${input.platform}-Post. Ton: ${toneMap[input.tone]}. Antworte NUR mit dem fertigen Post.` },
            { role: "user", content: `Erstelle einen ${input.contentType} für ${input.platform} aus diesen Stichpunkten:\n${input.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}` },
          ],
        });
        const result = typeof llmResponse.choices?.[0]?.message?.content === "string"
          ? llmResponse.choices[0].message.content
          : "";
        return { content: result };
      }),
  }),

  // ─── Karussell-Generator ───────────────────────────────────
  carousel: router({
    generate: approvedProcedure
      .input(z.object({
        topic: z.string(),
        pillar: z.string().optional(),
        platform: z.enum(["instagram", "linkedin"]).default("instagram"),
        slideCount: z.number().min(3).max(15).default(7),
        style: z.enum(["educational", "storytelling", "listicle", "before_after", "tips"]).default("educational"),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const styleMap: Record<string, string> = {
          educational: "Lehrreich: Slide 1 = Hook, Slides 2-N = Wissen, letzte Slide = CTA",
          storytelling: "Geschichte: Slide 1 = Aufhänger, Slides 2-N = Story-Verlauf, letzte Slide = Moral + CTA",
          listicle: "Liste: Slide 1 = Titel/Hook, Slides 2-N = je 1 Punkt, letzte Slide = Zusammenfassung + CTA",
          before_after: "Vorher/Nachher: Slide 1 = Problem, Slides 2-3 = Vorher, Slides 4-5 = Nachher, letzte Slide = CTA",
          tips: "Tipps: Slide 1 = Hook/Titel, Slides 2-N = je 1 Tipp mit Erklärung, letzte Slide = CTA",
        };
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: `Du bist ein Karussell-Content-Experte für ${input.platform}. Erstelle ein ${input.slideCount}-Slide Karussell. Format: ${styleMap[input.style]}. Für LR Health & Beauty / Lifestyle. Antworte als JSON.` },
            { role: "user", content: `Erstelle ein ${input.slideCount}-Slide Karussell zum Thema: "${input.topic}"${input.pillar ? ` (Pillar: ${input.pillar})` : ""}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "carousel_slides",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Karussell-Titel" },
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        slideNumber: { type: "integer" },
                        headline: { type: "string", description: "Slide-Überschrift (max 8 Wörter)" },
                        body: { type: "string", description: "Slide-Text (max 30 Wörter)" },
                        designHint: { type: "string", description: "Kurzer Design-Hinweis (Farbe, Icon, Bild-Idee)" },
                        emoji: { type: "string", description: "Passendes Emoji" },
                      },
                      required: ["slideNumber", "headline", "body", "designHint", "emoji"],
                      additionalProperties: false,
                    },
                  },
                  caption: { type: "string", description: "Post-Caption für unter dem Karussell" },
                  hashtags: { type: "array", items: { type: "string" }, description: "5 relevante Hashtags" },
                },
                required: ["title", "slides", "caption", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        });
        const raw = llmResponse.choices?.[0]?.message?.content;
        if (typeof raw === "string") {
          try { return JSON.parse(raw); } catch { /* fallthrough */ }
        }
        return { title: input.topic, slides: [], caption: "", hashtags: [] };
      }),
  }),

  // ─── Team Leaderboard & Gamification ───────────────────────
  leaderboard: router({
    // Team-Rangliste basierend auf Content-Aktivität
    rankings: approvedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      const { contentPosts, users } = await import("../drizzle/schema");
      const { sql, eq, desc, count, avg } = await import("drizzle-orm");

      // Get post counts and avg scores per user
      const stats = await dbConn.select({
        userId: contentPosts.createdById,
        userName: users.name,
        totalPosts: count(contentPosts.id),
        avgScore: avg(contentPosts.feedbackScore),
        publishedCount: sql<number>`SUM(CASE WHEN ${contentPosts.status} = 'published' THEN 1 ELSE 0 END)`,
        approvedCount: sql<number>`SUM(CASE WHEN ${contentPosts.status} = 'approved' THEN 1 ELSE 0 END)`,
        pendingCount: sql<number>`SUM(CASE WHEN ${contentPosts.status} = 'pending' THEN 1 ELSE 0 END)`,
      })
        .from(contentPosts)
        .leftJoin(users, eq(contentPosts.createdById, users.id))
        .groupBy(contentPosts.createdById, users.name)
        .orderBy(desc(count(contentPosts.id)));

      return stats.map((s, i) => ({
        rank: i + 1,
        userId: s.userId,
        userName: s.userName || "Unbekannt",
        totalPosts: Number(s.totalPosts),
        avgScore: s.avgScore ? Math.round(Number(s.avgScore)) : 0,
        publishedCount: Number(s.publishedCount || 0),
        approvedCount: Number(s.approvedCount || 0),
        pendingCount: Number(s.pendingCount || 0),
        // Gamification: Punkte berechnen
        points: Number(s.totalPosts) * 10 + Number(s.publishedCount || 0) * 25 + (s.avgScore ? Math.round(Number(s.avgScore)) : 0),
        badge: Number(s.totalPosts) >= 100 ? "diamond" : Number(s.totalPosts) >= 50 ? "gold" : Number(s.totalPosts) >= 20 ? "silver" : Number(s.totalPosts) >= 5 ? "bronze" : "starter",
        level: Math.floor(Math.log2(Number(s.totalPosts) + 1)) + 1,
      }));
    }),

    // Eigene Stats
    myStats: approvedProcedure.query(async ({ ctx }) => {
      const stats = await db.getContentStats(ctx.user.id) as Record<string, number>;
      const topPosts = await db.getTopPerformingPosts(5);
      const myTopPosts = topPosts.filter((p: any) => p.createdBy?.id === ctx.user.id);
      const total = stats.total || 0;
      const published = stats.published || 0;
      return {
        total,
        pending: stats.pending || 0,
        approved: stats.approved || 0,
        published,
        rejected: stats.rejected || 0,
        topPosts: myTopPosts.length,
        points: total * 10 + published * 25,
        badge: total >= 100 ? "diamond" : total >= 50 ? "gold" : total >= 20 ? "silver" : total >= 5 ? "bronze" : "starter",
        level: Math.floor(Math.log2(total + 1)) + 1,
      };
    }),
  }),

  // ─── Analytics Upgrade ─────────────────────────────────────
  analyticsPlus: router({
    // Content-Mix Analyse: Welche Pillars/Formate performen am besten
    contentMix: approvedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return { byPillar: [], byType: [], byPlatform: [] };
      const { contentPosts } = await import("../drizzle/schema");
      const { sql, count, avg } = await import("drizzle-orm");

      const byPillar = await dbConn.select({
        pillar: contentPosts.pillar,
        count: count(contentPosts.id),
        avgScore: avg(contentPosts.feedbackScore),
      }).from(contentPosts).groupBy(contentPosts.pillar);

      const byType = await dbConn.select({
        contentType: contentPosts.contentType,
        count: count(contentPosts.id),
        avgScore: avg(contentPosts.feedbackScore),
      }).from(contentPosts).groupBy(contentPosts.contentType);

      return {
        byPillar: byPillar.map(r => ({ name: r.pillar || "Ohne Pillar", count: Number(r.count), avgScore: r.avgScore ? Math.round(Number(r.avgScore)) : 0 })),
        byType: byType.map(r => ({ name: r.contentType || "post", count: Number(r.count), avgScore: r.avgScore ? Math.round(Number(r.avgScore)) : 0 })),
      };
    }),

    // Posting-Heatmap: Wann wird am meisten gepostet
    heatmap: approvedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      const { contentPosts } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");

      const data = await dbConn.execute(
        sql`SELECT DAYOFWEEK(${contentPosts.createdAt}) as dow, HOUR(${contentPosts.createdAt}) as hod, COUNT(*) as cnt FROM ${contentPosts} GROUP BY dow, hod`
      );

      const rows = (data as any)[0] || data;
      return (Array.isArray(rows) ? rows : []).map((d: any) => ({
        day: Number(d.dow) - 1,
        hour: Number(d.hod),
        count: Number(d.cnt),
      }));
    }),

    // Best Performing Content
    bestPerformers: approvedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTopPerformingPosts(input?.limit || 20);
      }),

    // Wöchentlicher Trend (Posts pro Woche)
    weeklyTrend: approvedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      const { contentPosts } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");

      const data = await dbConn.execute(
        sql`SELECT DATE_FORMAT(${contentPosts.createdAt}, '%Y-%u') as week_label, COUNT(*) as cnt, AVG(${contentPosts.feedbackScore}) as avg_score FROM ${contentPosts} GROUP BY week_label ORDER BY week_label`
      );

      const rows = (data as any)[0] || data;
      return (Array.isArray(rows) ? rows : []).map((d: any) => ({
        week: String(d.week_label || ''),
        count: Number(d.cnt || 0),
        avgScore: d.avg_score ? Math.round(Number(d.avg_score)) : 0,
      }));
    }),
  }),

  // ─── API Health ────────────────────────────────────────────
  apiHealth: router({
    goViralBitch: publicProcedure.query(async () => {
      const healthy = await api.goViralBitchHealthCheck();
      return { status: healthy ? "online" : "offline", url: "https://goviralbitch-deploy.onrender.com" };
    }),
    blotatoAccounts: approvedProcedure.query(async () => {
      try {
        const accounts = await api.getBlotatoAccounts();
        return { connected: accounts.length > 0, accounts, fallback: accounts.length === 0 };
      } catch {
        return { connected: false, accounts: api.LR_BLOTATO_ACCOUNTS, fallback: true };
      }
    }),
  }),

  // ─── Blotato Multi-Publish Vorschau ──────────────────────
  multiPublish: router({
    // Preview: Zeigt wie der Post auf jeder Plattform aussehen wird
    preview: approvedProcedure
      .input(z.object({
        contentPostId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.contentPostId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        const content = post.post.editedContent || post.post.content;
        const platforms = (post.post.platforms as string[]) || [];
        const mediaUrl = post.post.mediaUrl;
        const videoUrl = post.post.videoUrl;

        // Get user's Blotato accounts
        const creator = await db.getUserById(post.post.createdById);
        const blotatoKey = creator?.blotatoApiKey || process.env.BLOTATO_API_KEY;
        let accounts: api.BlotatoAccount[] = [];
        try {
          if (blotatoKey) accounts = await api.getBlotatoAccounts(blotatoKey);
          if (accounts.length === 0) accounts = api.LR_BLOTATO_ACCOUNTS;
        } catch {
          accounts = api.LR_BLOTATO_ACCOUNTS;
        }

        // Build preview for each platform
        const previews = platforms.map(platform => {
          const account = accounts.find(a => a.platform.toLowerCase() === platform.toLowerCase());
          const tone = api.LR_BRAND_VOICE.tonePerPlatform[platform.toLowerCase() as keyof typeof api.LR_BRAND_VOICE.tonePerPlatform];
          const charLimit = platform === "twitter" ? 280 : platform === "linkedin" ? 3000 : 2200;
          const truncated = content.length > charLimit;

          return {
            platform,
            accountName: account?.displayName || account?.username || `${platform}-Konto`,
            accountId: account?.id,
            hasAccount: !!account,
            content: truncated ? content.substring(0, charLimit) + "..." : content,
            charCount: content.length,
            charLimit,
            truncated,
            mediaUrl,
            videoUrl,
            tone: tone?.tone || "Standard",
            format: tone?.format || "Post",
            frequency: tone?.frequency || "1x täglich",
          };
        });

        return {
          post: {
            id: post.post.id,
            content,
            topic: post.post.topic,
            pillar: post.post.pillar,
            mediaUrl,
            videoUrl,
          },
          previews,
          totalPlatforms: platforms.length,
          connectedAccounts: accounts.length,
          hasBlotatoKey: !!blotatoKey,
        };
      }),

    // Publish to selected platforms
    publishSelected: approvedProcedure
      .input(z.object({
        contentPostId: z.number(),
        platforms: z.array(z.string()),
        scheduledDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.contentPostId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (post.post.status !== "approved") throw new TRPCError({ code: "BAD_REQUEST", message: "Post muss zuerst genehmigt werden" });

        const creator = await db.getUserById(post.post.createdById);
        const blotatoKey = creator?.blotatoApiKey || process.env.BLOTATO_API_KEY;
        if (!blotatoKey) throw new TRPCError({ code: "BAD_REQUEST", message: "Kein Blotato API Key vorhanden" });

        let accounts = await api.getBlotatoAccounts(blotatoKey);
        if (accounts.length === 0) accounts = api.LR_BLOTATO_ACCOUNTS;

        const contentToPublish = post.post.editedContent || post.post.content;
        const mediaUrls: string[] = [];
        if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
        if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);

        const postIds = await api.publishToAllPlatforms(
          contentToPublish, input.platforms, accounts,
          mediaUrls.length > 0 ? mediaUrls : undefined,
          input.scheduledDate, blotatoKey,
        );

        await db.setBlotatoPostIds(input.contentPostId, postIds);
        await db.updateContentPostStatus(input.contentPostId, "scheduled", ctx.user.id);

        await db.logTeamActivity({
          userId: ctx.user.id,
          actionType: "content_published",
          description: `Content auf ${input.platforms.join(", ")} veröffentlicht`,
          contentPostId: input.contentPostId,
          metadata: { platforms: input.platforms, postIds },
        });

        return { success: true, postIds, platformCount: input.platforms.length };
      }),
  }),

  // ─── Direct Post (ohne Blotato) ────────────────────────────
  directPost: router({
    // Get post content formatted for manual posting
    getForCopy: approvedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getContentPostById(input.contentPostId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        const content = post.post.editedContent || post.post.content;
        const platforms = (post.post.platforms as string[]) || [];

        // Build platform-specific deeplinks
        const deeplinks: Record<string, string> = {
          instagram: "instagram://library",
          tiktok: "snssdk1233://",
          facebook: "fb://publish",
          linkedin: "linkedin://shareArticle",
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.substring(0, 280))}`,
          threads: "barcelona://",
          youtube: "vnd.youtube://upload",
        };

        return {
          content,
          mediaUrl: post.post.mediaUrl,
          videoUrl: post.post.videoUrl,
          platforms: platforms.map(p => ({
            name: p,
            deeplink: deeplinks[p.toLowerCase()] || `https://${p}.com`,
            webUrl: p === "instagram" ? "https://www.instagram.com" :
                    p === "tiktok" ? "https://www.tiktok.com/upload" :
                    p === "facebook" ? "https://www.facebook.com" :
                    p === "linkedin" ? "https://www.linkedin.com/feed/" :
                    p === "twitter" ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.substring(0, 280))}` :
                    `https://${p}.com`,
          })),
          topic: post.post.topic,
          pillar: post.post.pillar,
        };
      }),

    // Mark post as manually published
    markPublished: approvedProcedure
      .input(z.object({
        contentPostId: z.number(),
        platform: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getContentPostById(input.contentPostId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.post.createdById !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        await db.updateContentPostStatus(input.contentPostId, "published", ctx.user.id);
        await db.createApprovalLog({
          contentPostId: input.contentPostId,
          userId: ctx.user.id,
          action: "published",
          comment: `Manuell gepostet auf ${input.platform}`,
          previousStatus: post.post.status,
          newStatus: "published",
        });

        await db.logTeamActivity({
          userId: ctx.user.id,
          actionType: "content_published",
          description: `Content manuell auf ${input.platform} gepostet`,
          contentPostId: input.contentPostId,
        });

        return { success: true };
      }),
  }),

  // ─── Team Activity Dashboard ───────────────────────────────
  teamActivity: router({
    // Get recent team activities
    list: approvedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTeamActivities(input?.limit || 50);
      }),

    // Get activities for a specific user
    byUser: approvedProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamActivitiesByUser(input.userId, input.limit || 20);
      }),
  }),

  // ─── Einladungs-Token System ───────────────────────────────
  inviteTokens: router({
    // Admin: Create a new invite token
    create: adminProcedure
      .input(z.object({
        name: z.string().optional(),
        partnerNumber: z.string().optional(),
        whatsappNumber: z.string().optional(),
        expiresInDays: z.number().optional().default(7),
      }))
      .mutation(async ({ ctx, input }) => {
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

        const id = await db.createInviteToken({
          token,
          name: input.name || null,
          partnerNumber: input.partnerNumber || null,
          whatsappNumber: input.whatsappNumber || null,
          expiresAt,
          createdById: ctx.user.id,
        });

        return { id, token, expiresAt: expiresAt.toISOString() };
      }),

    // Admin: List all tokens
    list: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listInviteTokens(input?.limit || 50);
      }),

    // Admin: Delete a token
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInviteToken(input.id);
        return { success: true };
      }),

    // Public: Verify a token (for the join page)
    verify: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const tokenData = await db.getInviteTokenByToken(input.token);
        if (!tokenData) return { valid: false, reason: "Token nicht gefunden" };
        if (tokenData.used) return { valid: false, reason: "Token wurde bereits verwendet" };
        if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
          return { valid: false, reason: "Token ist abgelaufen" };
        }
        return {
          valid: true,
          name: tokenData.name,
          partnerNumber: tokenData.partnerNumber,
        };
      }),
   }),

  // ─── Post-Status-Tracking (Blotato Polling) ───────────────
  postTracking: router({
    // Get live status of a post's Blotato schedules
    getStatus: approvedProcedure
      .input(z.object({ contentPostId: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getContentPostById(input.contentPostId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        const blotatoPostIds = (post.post.blotatoPostIds as string[]) || [];
        if (blotatoPostIds.length === 0) {
          return { tracked: false, schedules: [], message: "Kein Blotato-Post verknüpft" };
        }
        // Fetch each schedule from Blotato
        const schedules = await Promise.all(
          blotatoPostIds.map(async (scheduleId) => {
            try {
              const schedule = await api.getScheduledPost(scheduleId);
              if (!schedule) return { id: scheduleId, status: "not_found", platform: "unknown", accountName: "" };
              return {
                id: scheduleId,
                status: schedule.scheduledAt ? (new Date(schedule.scheduledAt) < new Date() ? "published" : "scheduled") : "draft",
                platform: schedule.draft?.content?.platform || "unknown",
                accountName: schedule.account?.name || schedule.account?.username || "",
                scheduledAt: schedule.scheduledAt,
                text: schedule.draft?.content?.text?.substring(0, 100),
                mediaUrls: schedule.draft?.content?.mediaUrls || [],
              };
            } catch {
              return { id: scheduleId, status: "error", platform: "unknown", accountName: "" };
            }
          })
        );
        return { tracked: true, schedules, total: schedules.length };
      }),

    // Bulk status check for multiple posts (dashboard overview)
    bulkStatus: approvedProcedure
      .input(z.object({ contentPostIds: z.array(z.number()).max(50) }))
      .query(async ({ input }) => {
        const results: Record<number, { total: number; published: number; scheduled: number; failed: number }> = {};
        for (const postId of input.contentPostIds) {
          const post = await db.getContentPostById(postId);
          if (!post) continue;
          const ids = (post.post.blotatoPostIds as string[]) || [];
          if (ids.length === 0) {
            results[postId] = { total: 0, published: 0, scheduled: 0, failed: 0 };
            continue;
          }
          let published = 0, scheduled = 0, failed = 0;
          for (const sid of ids) {
            try {
              const s = await api.getScheduledPost(sid);
              if (!s) { failed++; continue; }
              if (s.scheduledAt && new Date(s.scheduledAt) < new Date()) published++;
              else scheduled++;
            } catch { failed++; }
          }
          results[postId] = { total: ids.length, published, scheduled, failed };
        }
        return results;
      }),
  }),

  // ─── Benachrichtigungen ────────────────────────────────────
  notifications: router({
    // Manually send a notification (admin)
    send: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(5000),
      }))
      .mutation(async ({ input }) => {
        const success = await sendBrevoNotification({ title: input.title, content: input.content });
        return { success };
      }),

    // Test notification
    test: adminProcedure.mutation(async () => {
      const success = await sendBrevoNotification({
        title: "LR Content Hub - Test",
        content: "Benachrichtigungen funktionieren! Du wirst automatisch informiert bei Freigaben, Posts und wichtigen Ereignissen.",
      });
      return { success };
    }),
  }),

  // ─── Admin Nutzer-Übersicht ────────────────────────────────
  adminUsers: router({
    // Full user overview with stats
    overview: adminProcedure.query(async () => {
      const users = await db.getAllUsers();
      const userStats = await Promise.all(
        users.map(async (user) => {
          const posts = await db.getContentPosts({ createdById: user.id });
          const totalPosts = posts.length;
          const approvedPosts = posts.filter(p => ["approved", "scheduled", "published"].includes(p.post.status)).length;
          const pendingPosts = posts.filter(p => p.post.status === "pending").length;
          const avgScore = posts.reduce((sum, p) => sum + (p.post.qualityScore || 0), 0) / (totalPosts || 1);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            partnerNumber: user.partnerNumber,
            phoneNumber: user.phoneNumber,
            isApproved: user.isApproved,
            hasBlotatoKey: !!user.blotatoApiKey,
            autoPostEnabled: user.autoPostEnabled,
            lastSignedIn: user.lastSignedIn,
            createdAt: user.createdAt,
            stats: {
              totalPosts,
              approvedPosts,
              pendingPosts,
              avgQualityScore: Math.round(avgScore),
            },
          };
        })
      );
      return userStats;
    }),
  }),
});
export type AppRouter = typeof appRouter;
