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

      const posts = await db.getContentPosts({ status: "approved", limit });

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

      const result = filtered.map(p => ({
        id: p.post.id,
        text: p.post.editedContent || p.post.content,
        type: p.post.contentType,
        platform: p.post.platforms,
        imageUrl: p.post.mediaUrl,
        videoUrl: p.post.videoUrl,
        topic: p.post.topic,
        pillar: p.post.pillar,
        createdAt: p.post.createdAt,
      }));

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
      const result = items.map(i => ({
        id: i.item.id,
        title: i.item.title,
        category: i.item.category,
        text: i.item.textContent,
        imageUrl: i.item.imageUrl,
        videoUrl: i.item.videoUrl,
        platforms: i.item.platforms,
        tags: i.item.tags,
      }));
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

      res.json({
        success: true,
        message: `Post "${post.post.topic || "Ohne Titel"}" wurde freigegeben und ist bereit zum Posten!`,
        postId: Number(postId),
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

  console.log("[Lina API] Endpoints: content, library, products, status, invite, login-link, magic-auth, notify, partner-stats, self-approve, pending");
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
