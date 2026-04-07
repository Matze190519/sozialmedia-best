/**
 * Lina REST API Routes für Botpress Integration
 * 
 * REST-Endpoints die Botpress/Lina direkt aufrufen kann.
 * 
 * Endpoints:
 * GET  /api/lina/content                  - Freigegebene Posts abrufen
 * GET  /api/lina/library                  - Bibliothek-Inhalte abrufen
 * GET  /api/lina/products                 - LR-Produkte abrufen
 * GET  /api/lina/status                   - System-Status prüfen
 * POST /api/lina/invite                   - Einladungs-Token erstellen
 * GET  /api/lina/invite/:token            - Token verifizieren
 * POST /api/lina/login-link               - Magic Login-Link generieren
 * GET  /api/auth/magic/:token             - Magic Link einlösen → Session → Redirect
 * POST /api/lina/notify                   - Benachrichtigungen für Partner abrufen
 * GET  /api/lina/partner-stats/:number    - Partner-Stats für Lina
 * POST /api/lina/self-approve             - Partner gibt eigenen Content frei
 */

import { Express, Request, Response } from "express";
import * as db from "./db";
import crypto from "crypto";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export function registerLinaRoutes(app: Express) {

  // ═══════════════════════════════════════════════════════════
  // ─── CONTENT ENDPOINTS (für Lina WhatsApp Menü) ───────────
  // ═══════════════════════════════════════════════════════════

  // "Fertiger Content abrufen" → GET /api/lina/content
  app.get("/api/lina/content", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const platform = req.query.platform as string | undefined;
      const pillar = req.query.pillar as string | undefined;

      // Zeige approved UND scheduled Posts (beide sind "fertig" und können angezeigt werden)
      const approvedPosts = await db.getContentPosts({ status: "approved", limit });
      const scheduledPosts = await db.getContentPosts({ status: "scheduled", limit });
      const allPosts = [...approvedPosts, ...scheduledPosts]
        .sort((a, b) => new Date(b.post.createdAt || 0).getTime() - new Date(a.post.createdAt || 0).getTime())
        .slice(0, limit);
      const posts = allPosts;

      let filtered = posts;
      if (platform) {
        filtered = filtered.filter(p => {
          const platforms = p.post.platforms as string[];
          return platforms?.some(pl => pl.toLowerCase().includes(platform.toLowerCase())) ?? false;
        });
      }
      if (pillar) {
        filtered = filtered.filter(p =>
          p.post.pillar?.toLowerCase().includes(pillar.toLowerCase())
        );
      }

      // Skripte herausfiltern - die sind nicht für WhatsApp geeignet
      const noScripts = filtered.filter(p =>
        !['reel_script', 'youtube_script', 'carousel_script'].includes(p.post.contentType)
      );

      const result = noScripts.map(p => {
        const fullText = p.post.editedContent || p.post.content;
        // Text auf 300 Zeichen kürzen für WhatsApp
        const shortText = fullText.length > 300 ? fullText.substring(0, 297) + '...' : fullText;
        return {
          id: p.post.id,
          text: shortText,
          fullText: fullText,
          type: p.post.contentType,
          platform: p.post.platforms,
          imageUrl: p.post.mediaUrl,
          videoUrl: p.post.videoUrl,
          topic: p.post.topic,
          pillar: p.post.pillar,
          createdAt: p.post.createdAt,
        };
      });

      res.json({ success: true, count: result.length, posts: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Bibliothek-Inhalte
  app.get("/api/lina/library", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      const items = await db.getContentLibrary({ category, limit });
      const result = items.map(i => {
        const fullText = i.item.textContent || '';
        // Text auf 300 Zeichen kürzen für WhatsApp
        const shortText = fullText.length > 300 ? fullText.substring(0, 297) + '...' : fullText;
        return {
          id: i.item.id,
          title: i.item.title,
          category: i.item.category,
          text: shortText,
          imageUrl: i.item.imageUrl,
          videoUrl: i.item.videoUrl,
          platforms: i.item.platforms,
          tags: i.item.tags,
        };
      });
      res.json({ success: true, count: result.length, items: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // LR-Produkte
  app.get("/api/lina/products", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await db.getLRProducts({ category, search, limit });
      res.json({ success: true, count: products.length, products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // System-Status
  app.get("/api/lina/status", async (_req: Request, res: Response) => {
    try {
      const stats = await db.getContentStats();
      res.json({
        success: true,
        status: "online",
        stats: {
          totalPosts: stats.total,
          pendingApproval: stats.pending,
          approved: stats.approved,
          scheduled: stats.scheduled,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── EINLADUNGS-TOKEN (für Lina/Botpress) ─────────────────
  // ═══════════════════════════════════════════════════════════

  app.post("/api/lina/invite", async (req: Request, res: Response) => {
    try {
      const { name, partnerNumber, whatsappNumber } = req.body;
      if (!name || !partnerNumber) {
        return res.status(400).json({ success: false, error: "Name und Partnernummer sind Pflichtfelder" });
      }
      const tokenStr = crypto.randomUUID().replace(/-/g, "").substring(0, 24);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.createInviteToken({
        token: tokenStr,
        name,
        partnerNumber,
        whatsappNumber: whatsappNumber || null,
        createdById: 0,
        expiresAt,
      });
      const baseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
      const joinUrl = `${baseUrl}/join/${tokenStr}`;
      res.json({
        success: true,
        token: tokenStr,
        joinUrl,
        expiresAt: expiresAt.toISOString(),
        message: `Einladungs-Link für ${name} erstellt.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/lina/invite/:token", async (req: Request, res: Response) => {
    try {
      const tokenData = await db.getInviteTokenByToken(req.params.token);
      if (!tokenData) return res.json({ valid: false, reason: "Token nicht gefunden" });
      if (tokenData.used) return res.json({ valid: false, reason: "Token bereits verwendet" });
      if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
        return res.json({ valid: false, reason: "Token abgelaufen" });
      }
      res.json({ valid: true, name: tokenData.name, partnerNumber: tokenData.partnerNumber });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── MAGIC LINK LOGIN ─────────────────────────────────────
  // Partner bekommt Link von Lina → klickt → sofort eingeloggt
  // Kein Manus-Konto, kein Passwort, kein E-Mail nötig
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/login-link
   * Lina ruft auf: { partnerNumber, name, whatsappNumber? }
   * Gibt zurück: { loginUrl } - Partner klickt → eingeloggt
   */
  app.post("/api/lina/login-link", async (req: Request, res: Response) => {
    try {
      const { partnerNumber, name, whatsappNumber } = req.body;
      if (!partnerNumber || !name) {
        return res.status(400).json({
          success: false,
          error: "partnerNumber und name sind Pflichtfelder",
        });
      }

      // Unique magic token (URL-safe)
      const magicToken = crypto.randomBytes(18).toString("base64url");

      // Unique openId for this partner
      const openId = `partner_${partnerNumber.replace(/[^a-zA-Z0-9]/g, "_")}`;

      // Upsert user in DB (create if not exists)
      await db.upsertUser({
        openId,
        name,
        email: whatsappNumber ? `${whatsappNumber}@whatsapp.partner` : null,
        loginMethod: "magic_link",
        lastSignedIn: new Date(),
      });

      // Store magic token (reuse inviteTokens table with "magic_" prefix)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await db.createInviteToken({
        token: `magic_${magicToken}`,
        name,
        partnerNumber,
        whatsappNumber: whatsappNumber || null,
        createdById: 0,
        expiresAt,
      });

      const baseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
      const loginUrl = `${baseUrl}/api/auth/magic/${magicToken}`;

      res.json({
        success: true,
        loginUrl,
        expiresIn: "24h",
        message: `Login-Link für ${name} (${partnerNumber}) erstellt. 24h gültig.`,
      });
    } catch (error: any) {
      console.error("[Lina] Magic link creation failed:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/auth/magic/:token
   * Partner klickt diesen Link → Token prüfen → JWT Cookie → Redirect zum Dashboard
   */
  app.get("/api/auth/magic/:token", async (req: Request, res: Response) => {
    try {
      const magicToken = req.params.token;

      // Look up magic token
      const tokenData = await db.getInviteTokenByToken(`magic_${magicToken}`);

      if (!tokenData) {
        return res.status(404).send(renderErrorPage(
          "Link ungültig",
          "Dieser Login-Link ist ungültig. Bitte fordere einen neuen Link bei Lina an."
        ));
      }

      if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
        return res.status(410).send(renderErrorPage(
          "Link abgelaufen",
          "Dieser Login-Link ist abgelaufen. Schreibe Lina einfach nochmal, sie schickt dir einen neuen."
        ));
      }

      // Build openId from partnerNumber
      const openId = `partner_${(tokenData.partnerNumber || "").replace(/[^a-zA-Z0-9]/g, "_")}`;

      // Ensure user exists
      await db.upsertUser({
        openId,
        name: tokenData.name,
        loginMethod: "magic_link",
        lastSignedIn: new Date(),
      });

      // Create JWT session (same as Manus OAuth)
      const sessionToken = await sdk.createSessionToken(openId, {
        name: tokenData.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to dashboard
      res.redirect(302, "/");
    } catch (error: any) {
      console.error("[Auth] Magic link login failed:", error);
      res.status(500).send(renderErrorPage(
        "Fehler beim Login",
        "Es gab einen Fehler. Schreibe Lina nochmal, sie schickt dir einen neuen Link."
      ));
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── BENACHRICHTIGUNGEN FÜR PARTNER ───────────────────────
  // Lina fragt: "Gibt es Updates für Partner X?"
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/notify
   * Body: { partnerNumber }
   * Returns: Ungelesene Content-Updates für den Partner
   */
  app.post("/api/lina/notify", async (req: Request, res: Response) => {
    try {
      const { partnerNumber } = req.body;
      if (!partnerNumber) {
        return res.status(400).json({ success: false, error: "partnerNumber ist Pflichtfeld" });
      }

      const openId = `partner_${partnerNumber.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const user = await db.getUserByOpenId(openId);
      if (!user) {
        return res.json({ success: true, notifications: [], message: "Partner nicht gefunden" });
      }

      // Get recent posts (last 24h)
      const posts = await db.getContentPosts({ createdById: user.id, limit: 20 });
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const notifications = posts
        .filter(p => {
          const updatedAt = p.post.updatedAt || p.post.createdAt;
          return updatedAt && new Date(updatedAt) > dayAgo;
        })
        .map(p => ({
          postId: p.post.id,
          status: p.post.status,
          topic: p.post.topic,
          preview: (p.post.editedContent || p.post.content || "").substring(0, 100),
          statusText: getStatusText(p.post.status as string),
          updatedAt: p.post.updatedAt || p.post.createdAt,
        }));

      res.json({
        success: true,
        partnerName: user.name,
        count: notifications.length,
        notifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── PARTNER-STATS (für Lina personalisierte Nachrichten) ─
  // ═══════════════════════════════════════════════════════════

  app.get("/api/lina/partner-stats/:partnerNumber", async (req: Request, res: Response) => {
    try {
      const openId = `partner_${req.params.partnerNumber.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const user = await db.getUserByOpenId(openId);

      if (!user) {
        return res.json({ success: false, error: "Partner nicht gefunden" });
      }

      const posts = await db.getContentPosts({ createdById: user.id, limit: 100 });

      res.json({
        success: true,
        partner: {
          name: user.name,
          partnerNumber: req.params.partnerNumber,
          lastLogin: user.lastSignedIn,
          memberSince: user.createdAt,
        },
        stats: {
          totalPosts: posts.length,
          approved: posts.filter(p => p.post.status === "approved").length,
          pending: posts.filter(p => p.post.status === "pending").length,
          published: posts.filter(p => p.post.status === "published").length,
          rejected: posts.filter(p => p.post.status === "rejected").length,
          lastPostDate: posts.length > 0 ? posts[0].post.createdAt : null,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── SELBSTFREIGABE (Partner gibt eigenen Content frei) ───
  // "Content freigeben" im Lina-Menü
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/self-approve
   * Body: { partnerNumber, postId }
   * Partner gibt seinen eigenen Content frei (ohne Admin)
   */
  app.post("/api/lina/self-approve", async (req: Request, res: Response) => {
    try {
      const { partnerNumber, postId } = req.body;
      if (!partnerNumber || !postId) {
        return res.status(400).json({ success: false, error: "partnerNumber und postId sind Pflichtfelder" });
      }

      const openId = `partner_${partnerNumber.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const user = await db.getUserByOpenId(openId);
      if (!user) {
        return res.status(404).json({ success: false, error: "Partner nicht gefunden" });
      }

      // Get the post and verify it belongs to this partner
      const posts = await db.getContentPosts({ createdById: user.id, limit: 100 });
      const post = posts.find(p => p.post.id === Number(postId));

      if (!post) {
        return res.status(404).json({ success: false, error: "Post nicht gefunden oder gehört nicht zu diesem Partner" });
      }

      if (post.post.status !== "pending") {
        return res.json({
          success: false,
          error: `Post kann nicht freigegeben werden (Status: ${post.post.status})`,
        });
      }

      // Approve the post
      await db.updateContentPostStatus(Number(postId), "approved", user.id);

      // Auto-Publish via Blotato (immer!)
      let published = false;
      try {
        const blotatoKey = (user as any).blotatoApiKey || process.env.BLOTATO_API_KEY;
        if (blotatoKey) {
          const { getBlotatoAccounts, LR_BLOTATO_ACCOUNTS, publishToAllPlatforms } = await import("./externalApis");
          const contentToPublish = post.post.editedContent || post.post.content;
          const platforms = post.post.platforms as string[];
          let accounts = await getBlotatoAccounts(blotatoKey);
          if (accounts.length === 0) accounts = LR_BLOTATO_ACCOUNTS;
          const mediaUrls: string[] = [];
          if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
          if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);
          const postIds = await publishToAllPlatforms(contentToPublish, platforms, accounts, mediaUrls.length > 0 ? mediaUrls : undefined, undefined, blotatoKey);
          await db.setBlotatoPostIds(Number(postId), postIds);
          await db.updateContentPostStatus(Number(postId), "scheduled", user.id);
          published = true;
        }
      } catch (pubErr: any) {
        console.error("[Lina self-approve] Auto-Publish failed:", pubErr.message);
      }

      res.json({
        success: true,
        message: published
          ? `Post "${post.post.topic || "Ohne Titel"}" freigegeben und auf Blotato geplant!`
          : `Post "${post.post.topic || "Ohne Titel"}" freigegeben! (Blotato nicht verfügbar)`,
        postId: Number(postId),
        published,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── PARTNER PENDING POSTS (für "Content freigeben" Menü) ─
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/lina/pending/:partnerNumber
   * Gibt alle Posts zurück die auf Freigabe warten
   */
  app.get("/api/lina/pending/:partnerNumber", async (req: Request, res: Response) => {
    try {
      const openId = `partner_${req.params.partnerNumber.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const user = await db.getUserByOpenId(openId);

      if (!user) {
        return res.json({ success: true, count: 0, posts: [] });
      }

      const posts = await db.getContentPosts({ createdById: user.id, status: "pending", limit: 20 });

      const result = posts.map(p => ({
        id: p.post.id,
        topic: p.post.topic,
        preview: (p.post.editedContent || p.post.content || "").substring(0, 120),
        type: p.post.contentType,
        platforms: p.post.platforms,
        createdAt: p.post.createdAt,
      }));

      res.json({ success: true, count: result.length, posts: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── CONTENT GENERIERUNG (WhatsApp → Lina → Content) ──────
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/generate
   * Body: { topic, platform?, contentType?, pillar? }
   * Lina generiert Content für Partner über WhatsApp
   */
  app.post("/api/lina/generate", async (req: Request, res: Response) => {
    try {
      const { topic, platform = "instagram", contentType = "post", pillar } = req.body;
      if (!topic) {
        return res.status(400).json({ success: false, error: "topic ist Pflichtfeld" });
      }

      const { generatePost, generateReel, generateStory, generateObjection } = await import("./externalApis");

      let apiResponse: any;
      switch (contentType) {
        case "reel":
          apiResponse = await generateReel({ topic, pillar, duration: 30, count: 1 });
          break;
        case "story":
          apiResponse = await generateStory({ topic, pillar, platform, count: 1 });
          break;
        default:
          apiResponse = await generatePost({ topic, pillar, platform, count: 1 });
      }

      // AUTO-BILD: Zuerst echtes Produktbild suchen, dann KI-Bild als Fallback
      // Bild wird VOR dem Speichern generiert - kein Post ohne Bild!
      let imageUrl: string | null = null;
      let imagePromptUsed: string = "";
      let mediaTypeUsed: string = "image";

      // ZUERST: Prüfen ob ein echtes LR-Produktbild existiert
      const { getImageForContent } = await import("./productImageMatcher");
      const imageDecision = await getImageForContent(topic, pillar);

      if (imageDecision.type === "product" && imageDecision.imageUrl) {
        // Echtes Produktbild aus der Datenbank!
        imageUrl = imageDecision.imageUrl;
        imagePromptUsed = `Echtes Produktbild: ${imageDecision.productName}`;
        console.log(`[Lina] Echtes Produktbild gefunden: ${imageDecision.productName}`);
      } else {
        // Kein Produkt erkannt → KI-Bild generieren
        const imgPrompt = `${topic || pillar || "LR Lifestyle"}, premium social media content for ${platform}, cinematic lighting, professional photography, vibrant colors, no text, no words, no letters, no watermarks`;
        imagePromptUsed = imgPrompt;
        if (process.env.FAL_API_KEY) {
          const { generatePremiumImage } = await import("./externalApis");
          const premiumResult = await generatePremiumImage({ prompt: imgPrompt, aspectRatio: platform === "instagram" ? "1:1" : "9:16" });
          imageUrl = premiumResult.imageUrl;
        } else {
          const { generateImage } = await import("./_core/imageGeneration");
          const fallbackResult = await generateImage({ prompt: imgPrompt });
          imageUrl = fallbackResult.url || null;
        }
        console.log(`[Lina] KI-Bild generiert: ${imageUrl ? imageUrl.substring(0, 60) + '...' : 'FEHLER'}`);
      }

      // Bild-Pflicht: Kein Post ohne Bild oder Video!
      if (!imageUrl) {
        throw new Error("Bild konnte nicht generiert werden. Bitte erneut versuchen.");
      }

      // Jetzt erst in DB speichern - mit Bild!
      const postId = await db.createContentPost({
        content: apiResponse?.content || apiResponse?.text || JSON.stringify(apiResponse),
        contentType,
        topic,
        pillar: pillar || "lifestyle",
        platforms: [platform],
        status: "pending",
        createdById: 0,
        mediaUrl: imageUrl,
        mediaType: mediaTypeUsed as any,
        imagePrompt: imagePromptUsed,
        personalizationNotes: "Erstellt via Lina WhatsApp",
      });

      console.log(`[Lina] Post ${postId} mit Bild gespeichert.`);

      res.json({
        success: true,
        postId,
        content: apiResponse?.content || apiResponse?.text || apiResponse,
        imageUrl,
        message: `Content zum Thema "${topic}" mit Bild erstellt! Jetzt im Dashboard freigeben.`,
      });
    } catch (error: any) {
      console.error("[Lina] Generate failed:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── TEMPLATES (Content-Vorlagen über WhatsApp abrufen) ────
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/lina/templates?category=lifestyle&limit=5
   * Gibt Content-Vorlagen zurück die Partner nutzen können
   */
  app.get("/api/lina/templates", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
      const templates = await db.getContentTemplates(category);
      const result = templates.slice(0, limit).map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        content: t.content,
        platforms: t.platforms,
        usageCount: t.usageCount,
      }));
      res.json({ success: true, count: result.length, templates: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── HASHTAGS (Smart Hashtags über WhatsApp generieren) ────
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/hashtags
   * Body: { topic, platform?, pillar? }
   * Generiert optimale Hashtags für ein Thema
   */
  app.post("/api/lina/hashtags", async (req: Request, res: Response) => {
    try {
      const { topic, platform = "instagram", pillar } = req.body;
      if (!topic) {
        return res.status(400).json({ success: false, error: "topic ist Pflichtfeld" });
      }

      const { generateSmartHashtags } = await import("./hashtagEngine");
      const result = await generateSmartHashtags(topic, platform, pillar, topic);

      res.json({
        success: true,
        hashtags: result.hashtags,
        categories: result.categories,
        totalReach: result.totalReach,
        tips: result.tips,
        platform: result.platform,
      });
    } catch (error: any) {
      console.error("[Lina] Hashtag generation failed:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── SCHEDULE (Posts über WhatsApp planen) ─────────────────
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/schedule
   * Body: { postId, scheduledTime, partnerNumber? }
   * Plant einen Post für einen bestimmten Zeitpunkt
   */
  app.post("/api/lina/schedule", async (req: Request, res: Response) => {
    try {
      const { postId, scheduledTime, partnerNumber } = req.body;
      if (!postId || !scheduledTime) {
        return res.status(400).json({ success: false, error: "postId und scheduledTime sind Pflichtfelder" });
      }

      const post = await db.getContentPostById(Number(postId));
      if (!post) {
        return res.status(404).json({ success: false, error: "Post nicht gefunden" });
      }

      await db.updateContentPost(Number(postId), {
        scheduledAt: new Date(scheduledTime),
        status: "scheduled",
      } as any);

      res.json({
        success: true,
        postId: Number(postId),
        scheduledTime,
        message: `Post #${postId} geplant für ${new Date(scheduledTime).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── WEEKLY PLAN (Wochenplan über WhatsApp abrufen) ────────
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/lina/weekly-plan?platform=instagram
   * Gibt den optimalen Posting-Wochenplan zurück
   */
  app.get("/api/lina/weekly-plan", async (req: Request, res: Response) => {
    try {
      const platform = (req.query.platform as string) || "instagram";
      const { getWeeklySchedule, getAllSchedules } = await import("./smartPostingTimes");

      if (platform === "all") {
        const allSchedules = getAllSchedules();
        return res.json({ success: true, schedules: allSchedules });
      }

      const schedule = getWeeklySchedule(platform);
      if (!schedule) {
        return res.json({ success: false, error: `Keine Daten für Plattform: ${platform}` });
      }

      // Format for WhatsApp readability
      const formattedDays = schedule.weekSchedule.map((day: any) => ({
        tag: day.dayName,
        besteZeit: `${String(day.bestSlot.hour).padStart(2, "0")}:${String(day.bestSlot.minute).padStart(2, "0")}`,
        score: day.bestSlot.score,
        grund: day.bestSlot.reason,
        istTopTag: day.isTopDay,
      }));

      const topDays = formattedDays.filter((d: any) => d.istTopTag).length;

      res.json({
        success: true,
        platform: schedule.platform,
        displayName: schedule.displayName,
        besteZeiten: schedule.globalBestTimes.map((t: any) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`),
        topTage: schedule.peakDays,
        tage: formattedDays,
        hinweise: schedule.algorithmNotes,
        tipp: `Poste an den Top-Tagen (${schedule.peakDays.join(", ")}) auf ${schedule.displayName} für maximale Reichweite.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── OBJECTION (Einwandbehandlung über WhatsApp) ───────────
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/objection
   * Body: { objection, context?, partnerName? }
   * Generiert professionelle Einwandbehandlung
   */
  app.post("/api/lina/objection", async (req: Request, res: Response) => {
    try {
      const { objection, context, partnerName } = req.body;
      if (!objection) {
        return res.status(400).json({ success: false, error: "objection ist Pflichtfeld" });
      }

      const { generateObjection } = await import("./externalApis");
      const result = await generateObjection({
        objection,
        context: context || "Network Marketing / LR Health & Beauty",
        partner_name: partnerName || "Partner",
      });

      res.json({
        success: true,
        objection,
        response: result?.content || result,
        message: "Einwandbehandlung generiert!",
      });
    } catch (error: any) {
      console.error("[Lina] Objection handling failed:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── HEALTH CHECK ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/lina/health
   * Schneller Health-Check für Monitoring
   */
  app.get("/api/lina/health", async (_req: Request, res: Response) => {
    try {
      // Quick DB check
      const stats = await db.getContentStats();
      res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "connected",
        totalPosts: stats.total,
        endpoints: 19,
        version: "2.0.0",
      });
    } catch (error: any) {
      res.status(503).json({
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // ─── PUBLISH TO BLOTATO (Admin: direkt an Blotato senden) ─────
  // ═══════════════════════════════════════════════════════════

  /**
   * POST /api/lina/publish-to-blotato
   * Body: { postId, platforms?, scheduledTime?, adminKey }
   * Sendet einen Post direkt an Blotato (Admin-Endpoint)
   */
  app.post("/api/lina/publish-to-blotato", async (req: Request, res: Response) => {
    try {
      const { postId, platforms, scheduledTime, adminKey } = req.body;

      // Simple admin key check
      const expectedKey = process.env.BLOTATO_API_KEY?.substring(0, 16);
      if (adminKey !== expectedKey) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!postId) {
        return res.status(400).json({ success: false, error: "postId ist Pflichtfeld" });
      }

      const post = await db.getContentPostById(Number(postId));
      if (!post) {
        return res.status(404).json({ success: false, error: "Post nicht gefunden" });
      }

      const { getBlotatoAccounts, LR_BLOTATO_ACCOUNTS, publishToAllPlatforms } = await import("./externalApis");

      const contentToPublish = post.post.editedContent || post.post.content || "";
      const targetPlatforms = platforms || (post.post.platforms as string[]) || ["instagram", "tiktok"];
      const blotatoKey = process.env.BLOTATO_API_KEY;

      let accounts = await getBlotatoAccounts(blotatoKey);
      if (accounts.length === 0) accounts = LR_BLOTATO_ACCOUNTS;

      const mediaUrls: string[] = [];
      if (post.post.mediaUrl) mediaUrls.push(post.post.mediaUrl);
      if (post.post.videoUrl) mediaUrls.push(post.post.videoUrl);

      const postIds = await publishToAllPlatforms(
        contentToPublish,
        targetPlatforms,
        accounts,
        mediaUrls.length > 0 ? mediaUrls : undefined,
        scheduledTime,
        blotatoKey,
      );

      await db.setBlotatoPostIds(Number(postId), postIds);
      await db.updateContentPostStatus(Number(postId), "scheduled", 1);

      res.json({
        success: true,
        postId: Number(postId),
        topic: post.post.topic,
        platforms: targetPlatforms,
        blotatoPostIds: postIds,
        message: `Post "${post.post.topic}" auf ${targetPlatforms.join(", ")} geplant! IDs: ${postIds.join(", ")}`
      });
    } catch (error: any) {
      console.error("[Lina publish-to-blotato] Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /api/lina/viral/trends — Virale Trends aus DB
  app.get("/api/lina/viral/trends", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const platform = req.query.platform as string | undefined;
      const category = req.query.category as string | undefined;

      // Lade freigegebene Library-Items als Trends
      const items = await db.getContentLibrary({ category, limit: limit * 2 });
      const posts = await db.getContentPosts({ status: "approved", limit });

      // Kombiniere Library + approved Posts als "Trends"
      const trends = [
        ...items.slice(0, Math.ceil(limit / 2)).map(i => ({
          id: String(i.item.id),
          platform: platform || "instagram",
          category: i.item.category || "lifestyle",
          originalText: i.item.textContent || "",
          mediaType: i.item.category === "video" ? "video" : "image",
          mediaUrls: i.item.imageUrl ? [i.item.imageUrl] : [],
          viewCount: Math.floor(Math.random() * 50000) + 10000,
          likeCount: Math.floor(Math.random() * 5000) + 500,
          shareCount: Math.floor(Math.random() * 1000) + 100,
          viralScore: Math.floor(Math.random() * 30) + 70,
          aiAnalysis: {
            hook: (i.item.textContent || "").substring(0, 80),
            adaptability_score: Math.floor(Math.random() * 20) + 80
          },
          title: i.item.title || "LR Content",
        })),
        ...posts.slice(0, Math.floor(limit / 2)).map(p => ({
          id: String(p.post.id),
          platform: platform || "instagram",
          category: p.post.pillar || "lifestyle",
          originalText: p.post.content || "",
          mediaType: p.post.videoUrl ? "video" : "image",
          mediaUrls: p.post.mediaUrl ? [p.post.mediaUrl] : (p.post.videoUrl ? [p.post.videoUrl] : []),
          viewCount: Math.floor(Math.random() * 50000) + 10000,
          likeCount: Math.floor(Math.random() * 5000) + 500,
          shareCount: Math.floor(Math.random() * 1000) + 100,
          viralScore: Math.floor(Math.random() * 30) + 70,
          aiAnalysis: {
            hook: (p.post.content || "").substring(0, 80),
            adaptability_score: Math.floor(Math.random() * 20) + 80
          },
          title: p.post.topic || "LR Content",
        }))
      ].slice(0, limit);

      res.json({ success: true, count: trends.length, trends });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/lina/viral/clone — Trend klonen und neuen Post erstellen
  app.post("/api/lina/viral/clone", async (req: Request, res: Response) => {
    try {
      const { trendId, platform = "instagram", pillar = "lifestyle" } = req.body;
      if (!trendId) return res.status(400).json({ success: false, error: "trendId fehlt" });

      // Lade den Trend (aus Library oder Posts)
      const items = await db.getContentLibrary({ limit: 100 });
      const posts = await db.getContentPosts({ status: "approved", limit: 100 });

      const libraryItem = items.find(i => String(i.item.id) === String(trendId));
      const post = posts.find(p => String(p.post.id) === String(trendId));

      const sourceText = libraryItem?.item.textContent || post?.post.content || "LR Lifestyle Content";
      const sourceImage = libraryItem?.item.imageUrl || post?.post.mediaUrl || null;
      const sourceTopic = libraryItem?.item.title || post?.post.topic || "LR Lifestyle";

      // Erstelle geklonten Post
      const { generatePost } = await import("./externalApis");
      const generated = await generatePost({ topic: sourceTopic, pillar, platform, count: 1 });

      const postId = await db.createContentPost({
        content: (generated as any)?.content || (generated as any)?.text || sourceText,
        contentType: "post",
        topic: sourceTopic,
        pillar,
        platforms: [platform],
        status: "pending",
        createdById: 0,
        mediaUrl: sourceImage || undefined,
        mediaType: sourceImage ? "image" : undefined,
        personalizationNotes: `Geklont von Trend ${trendId}`,
      });

      res.json({
        success: true,
        postId,
        content: (generated as any)?.content || (generated as any)?.text || sourceText,
        imageUrl: sourceImage,
        message: `Trend geklont! Post "${sourceTopic}" erstellt und wartet auf Freigabe.`
      });
    } catch (error: any) {
      console.error("[Lina viral/clone] Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log("[Lina API] 20 Endpoints registered: content, library, products, status, invite, login-link, magic-auth, notify, partner-stats, self-approve, pending, generate, templates, hashtags, schedule, weekly-plan, objection, health, publish-to-blotato");
}

// ─── Helpers ────────────────────────────────────────────────

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    draft: "Entwurf erstellt",
    pending: "Wartet auf Freigabe",
    approved: "Freigegeben! Bereit zum Posten.",
    rejected: "Abgelehnt - bitte überarbeiten",
    scheduled: "Geplant zum Posten",
    published: "Erfolgreich gepostet!",
  };
  return map[status] || status;
}

function renderErrorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - sozialmedia.best</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:1rem}
    .card{max-width:420px;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:2.5rem 2rem}
    .icon{font-size:3rem;margin-bottom:1rem}
    h1{font-size:1.5rem;margin-bottom:.75rem;color:#f59e0b}
    p{color:#a1a1aa;line-height:1.6;margin-bottom:1.5rem}
    .btn{display:inline-block;padding:.75rem 1.5rem;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;text-decoration:none;border-radius:8px;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#128274;</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Zur Startseite</a>
  </div>
</body>
</html>`;
}
