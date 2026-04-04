/**
 * Post all 10 new posts to Blotato (Instagram + TikTok)
 * Uses correct publishToAllPlatforms signature with BlotatoAccount[]
 */
import { getDb } from "../server/db.js";
import { contentPosts } from "../drizzle/schema.js";
import { gte } from "drizzle-orm";
import { getBlotatoAccounts, scheduleOnBlotato } from "../server/externalApis.js";

async function main() {
  const db = await getDb();
  if (!db) { console.error("DB nicht verfügbar"); process.exit(1); }

  // Get all new posts (930001+)
  const posts = await db.select().from(contentPosts).where(gte(contentPosts.id, 930001));
  console.log(`📋 ${posts.length} Posts zum Posten gefunden\n`);

  // Get Blotato accounts
  console.log("🔗 Blotato Accounts laden...");
  const accounts = await getBlotatoAccounts();
  console.log(`  ${accounts.length} Accounts:`);
  accounts.forEach((a: any) => console.log(`    - ${a.platform}: ${a.displayName || a.username} (ID: ${a.id})`));

  const igAccount = accounts.find((a: any) => a.platform.toLowerCase() === "instagram");
  const tkAccount = accounts.find((a: any) => a.platform.toLowerCase() === "tiktok");
  const ytAccount = accounts.find((a: any) => a.platform.toLowerCase() === "youtube");

  if (!igAccount) console.log("  ⚠️ Kein Instagram Account!");
  if (!tkAccount) console.log("  ⚠️ Kein TikTok Account!");

  let posted = 0;
  let failed = 0;

  for (const post of posts) {
    const mediaUrl = post.videoUrl || post.mediaUrl;
    if (!mediaUrl) {
      console.log(`⚠️ Post #${post.id} "${post.topic}" - kein Media, übersprungen`);
      continue;
    }

    console.log(`\n━━━ Post #${post.id}: ${post.topic} ━━━`);
    const mediaUrls = [mediaUrl];
    const text = post.content || "";

    // Instagram
    if (igAccount) {
      try {
        const result = await scheduleOnBlotato(
          (igAccount as any).id,
          text,
          "instagram",
          mediaUrls,
        );
        console.log(`  ✅ Instagram: ${result.scheduleId || result.postSubmissionId || "queued"}`);
        posted++;
      } catch (err: any) {
        console.log(`  ❌ Instagram: ${err.message?.slice(0, 60)}`);
        failed++;
      }
    }

    // TikTok
    if (tkAccount) {
      try {
        const result = await scheduleOnBlotato(
          (tkAccount as any).id,
          text,
          "tiktok",
          mediaUrls,
        );
        console.log(`  ✅ TikTok: ${result.scheduleId || result.postSubmissionId || "queued"}`);
        posted++;
      } catch (err: any) {
        console.log(`  ❌ TikTok: ${err.message?.slice(0, 60)}`);
        failed++;
      }
    }

    // Small delay between posts
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n═══ ERGEBNIS ═══`);
  console.log(`Gepostet: ${posted} | Fehlgeschlagen: ${failed}`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
