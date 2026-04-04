/**
 * Fix Instagram posts - trim text to 2200 chars (Instagram limit) and repost
 */
import { getDb } from "../server/db.js";
import { contentPosts } from "../drizzle/schema.js";
import { gte, eq } from "drizzle-orm";
import { getBlotatoAccounts, scheduleOnBlotato } from "../server/externalApis.js";

async function main() {
  const db = await getDb();
  if (!db) { console.error("DB nicht verfügbar"); process.exit(1); }

  const posts = await db.select().from(contentPosts).where(gte(contentPosts.id, 930001));
  console.log(`📋 ${posts.length} Posts\n`);

  // Check text lengths
  for (const p of posts) {
    const text = p.content || "";
    const hashtags = (text.match(/#\w+/g) || []).length;
    console.log(`Post #${p.id} "${p.topic}": ${text.length} Zeichen, ${hashtags} Hashtags`);
  }

  // Instagram limit is 2200 chars
  console.log("\n🔧 Texte kürzen auf max 2200 Zeichen, max 5 Hashtags...\n");

  const accounts = await getBlotatoAccounts();
  const igAccount = accounts.find((a: any) => a.platform.toLowerCase() === "instagram");
  if (!igAccount) { console.error("Kein Instagram Account!"); process.exit(1); }
  console.log(`Instagram: ${(igAccount as any).displayName} (ID: ${(igAccount as any).id})\n`);

  // Failed post IDs from the log (422 errors)
  const failedIds = [930001, 930002, 930003, 930004, 930007, 930009, 930010];

  let posted = 0;
  let failed = 0;

  for (const postId of failedIds) {
    const post = posts.find(p => p.id === postId);
    if (!post) continue;

    let text = post.content || "";
    const mediaUrl = post.videoUrl || post.mediaUrl;
    if (!mediaUrl) { console.log(`⚠️ #${postId} - kein Media`); continue; }

    // Extract hashtags and main text
    const hashtagMatch = text.match(/(#\w+[\s]*){1,}/g);
    const allHashtags = text.match(/#\w+/g) || [];
    
    // Remove all hashtags from text first
    let cleanText = text;
    for (const h of allHashtags) {
      cleanText = cleanText.replace(h, "");
    }
    cleanText = cleanText.replace(/\n{3,}/g, "\n\n").trim();

    // Keep only 5 hashtags
    const topHashtags = allHashtags.slice(0, 5);

    // Rebuild text: main content + 5 hashtags, max 2200 chars
    let finalText = cleanText + "\n\n" + topHashtags.join(" ");
    if (finalText.length > 2200) {
      // Truncate main text to fit
      const maxMainLength = 2200 - topHashtags.join(" ").length - 10;
      cleanText = cleanText.slice(0, maxMainLength) + "...";
      finalText = cleanText + "\n\n" + topHashtags.join(" ");
    }

    console.log(`━━━ #${postId}: ${post.topic} (${finalText.length} Z., ${topHashtags.length} Tags) ━━━`);

    try {
      const result = await scheduleOnBlotato(
        (igAccount as any).id,
        finalText,
        "instagram",
        [mediaUrl],
      );
      console.log(`  ✅ Instagram: ${result.scheduleId || result.postSubmissionId || "queued"}`);
      posted++;
    } catch (err: any) {
      console.log(`  ❌ Instagram: ${err.message?.slice(0, 80)}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n═══ ERGEBNIS ═══`);
  console.log(`Instagram gepostet: ${posted} | Fehlgeschlagen: ${failed}`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
