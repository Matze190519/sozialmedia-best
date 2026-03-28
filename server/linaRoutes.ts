/**
 * Lina REST API Routes für Botpress Integration
 * 
 * Öffentliche REST-Endpoints die Botpress direkt aufrufen kann.
 * Kein Auth nötig - die Endpoints liefern nur freigegebene Inhalte.
 * 
 * Endpoints:
 * GET /api/lina/content   - Freigegebene Posts abrufen
 * GET /api/lina/library   - Bibliothek-Inhalte abrufen
 * GET /api/lina/products  - LR-Produkte abrufen
 * GET /api/lina/status    - System-Status prüfen
 */

import { Express, Request, Response } from "express";
import * as db from "./db";

export function registerLinaRoutes(app: Express) {
  // ─── Freigegebene Posts ───────────────────────────────────
  app.get("/api/lina/content", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const platform = req.query.platform as string | undefined;
      const pillar = req.query.pillar as string | undefined;

      const posts = await db.getContentPosts({
        status: "approved",
        limit,
      });

      // Filter by platform/pillar if specified
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

  // ─── Bibliothek-Inhalte ───────────────────────────────────
  app.get("/api/lina/library", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;

      const items = await db.getContentLibrary({
        category,
        limit,
      });

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

  // ─── LR-Produkte ─────────────────────────────────────────
  app.get("/api/lina/products", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const products = await db.getLRProducts({
        category,
        search,
        limit,
      });

      res.json({ success: true, count: products.length, products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ─── System-Status ────────────────────────────────────────
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

  console.log("[Lina API] REST-Endpoints registriert: /api/lina/content, /api/lina/library, /api/lina/products, /api/lina/status");
}
