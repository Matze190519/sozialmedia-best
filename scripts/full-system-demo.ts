/**
 * FULL SYSTEM DEMO - 10 Mix-Posts über ALLE System-Tools
 */
import { getDb } from "../server/db.js";
import { contentPosts, contentLibrary, lrProducts, approvalLogs } from "../drizzle/schema.js";
import { eq, like, sql, desc } from "drizzle-orm";
import * as api from "../server/externalApis.js";
import { generateSmartHashtags } from "../server/hashtagEngine.js";
import { runFullTrendScan } from "../server/trendScanner.js";
import { invokeLLM } from "../server/_core/llm.js";

const ADMIN_USER_ID = 1;

async function main() {
  const db = await getDb();
  if (!db) { console.error("DB nicht verfügbar"); process.exit(1); }

  console.log("═══ FULL SYSTEM DEMO - 10 Mix-Posts ═══\n");

  // STEP 1: Echte LR-Produktbilder
  console.log("📦 Produktbilder laden...");
  const allProducts = await db.select().from(lrProducts).limit(100);
  const withImages = allProducts.filter((p: any) => p.imageUrl);
  console.log(`  ${withImages.length} Produkte mit Bildern`);

  const find = (kw: string) => withImages.find((p: any) => p.name?.toLowerCase().includes(kw.toLowerCase()));
  const mindMaster = find("mind master");
  const aloeVera = find("aloe vera drink") || find("aloe vera");
  const proBalance = find("pro balance") || find("probalance");
  const collagen = find("collagen");
  const superOmega = find("omega");
  const lr5in1 = find("5 in 1") || withImages[10];

  // STEP 2: Hashtags
  console.log("\n#️⃣ Hashtags generieren...");
  const hashSets: Record<string, string[]> = {};
  for (const topic of ["LR Health Beauty", "Network Marketing", "Gesundheit", "Aloe Vera", "Nebeneinkommen"]) {
    try {
      const r = await generateSmartHashtags(topic, "instagram", undefined, topic);
      hashSets[topic] = r.hashtags?.slice(0, 5) || [];
      console.log(`  ✅ ${topic}: ${hashSets[topic].length} Hashtags`);
    } catch {
      hashSets[topic] = ["#LRHealthBeauty", "#NetworkMarketing", "#Gesundheit", "#Lifestyle", "#Erfolg"];
      console.log(`  ⚠️ ${topic}: Fallback`);
    }
  }

  // STEP 3: Trends
  console.log("\n🔍 Trends scannen...");
  let trends: string[] = [];
  try {
    const t = await runFullTrendScan();
    trends = (t as any[]).slice(0, 5).map((x: any) => x.title || "");
    console.log(`  ✅ ${trends.length} Trends`);
  } catch (err: any) {
    console.log(`  ⚠️ ${err.message?.slice(0, 50)}`);
    trends = ["Passives Einkommen 2026", "Gesundheit Trend"];
  }

  // STEP 4: 10 Posts
  console.log("\n✨ 10 Mix-Posts erstellen...\n");

  const posts = [
    { title: "Mind Master - Mentale Klarheit", fmt: "image", type: "product", product: mindMaster,
      prompt: "Instagram-Post über Mind Master von LR. Anti-Stress, mentale Klarheit. KEINE PREISE. Authentisch. Max 1500 Zeichen.", hk: "LR Health Beauty" },
    { title: "Aloe Vera Drinking Gel", fmt: "image", type: "product", product: aloeVera,
      prompt: "Instagram-Post über Aloe Vera Drinking Gel. Verdauung, Immunsystem. KEINE PREISE. Persönlich. Max 1500 Zeichen.", hk: "Aloe Vera" },
    { title: "Morgenroutine für Energie", fmt: "video", type: "lifestyle",
      vidPrompt: "Bright morning kitchen, person preparing healthy green drink, sunlight, fresh fruits, healthy lifestyle, warm colors, cinematic 9:16",
      prompt: "Instagram-Reel über gesunde Morgenroutine mit LR-Produkten. KEINE PREISE. Max 1200 Zeichen.", hk: "Gesundheit" },
    { title: "Von der Idee zum Business", fmt: "image", type: "lifestyle",
      imgPrompt: "Professional woman working on laptop in modern bright cafe, coffee, natural light, successful entrepreneur, premium photography, 1:1 square",
      prompt: "Instagram-Post über den Weg ins eigene Business mit LR. KEINE PREISE, KEINE Zahlen. Inspirierend. Max 1500 Zeichen.", hk: "Network Marketing" },
    { title: "Team-Event Energie", fmt: "video", type: "lifestyle",
      vidPrompt: "Energetic business event, diverse crowd cheering, confetti, stage lights, professional networking, cinematic 9:16",
      prompt: "Instagram-Reel über LR Team-Events. Energie, Gemeinschaft. KEINE PREISE. Max 1200 Zeichen.", hk: "Network Marketing" },
    { title: proBalance?.name || "Pro Balance", fmt: "image", type: "product", product: proBalance || withImages[5],
      prompt: `Instagram-Post über ${proBalance?.name || "LR Pro Balance"}. Säure-Basen-Haushalt, Made in Germany. KEINE PREISE. Max 1500 Zeichen.`, hk: "Gesundheit" },
    { title: "Nebeneinkommen 2026", fmt: "video", type: "trend",
      vidPrompt: "Young professional on rooftop terrace golden hour, city skyline, confident, freedom, warm golden light, cinematic 9:16",
      prompt: "Instagram-Reel über Nebeneinkommen-Trend und Network Marketing mit LR. KEINE PREISE, KEINE Zahlen. Modern. Max 1200 Zeichen.", hk: "Nebeneinkommen" },
    { title: "Gemeinsam stärker - Team", fmt: "image", type: "lifestyle",
      imgPrompt: "Group of diverse happy professionals at networking event, modern venue, laughing, team spirit, warm lighting, premium photography, 1:1",
      prompt: "Instagram-Post über Teamwork im Network Marketing. Zusammenhalt, Spaß. KEINE PREISE. Max 1500 Zeichen.", hk: "Network Marketing" },
    { title: collagen?.name || superOmega?.name || "LR Qualität", fmt: "image", type: "product", product: collagen || superOmega || withImages[8],
      prompt: `Instagram-Post über ${collagen?.name || superOmega?.name || "LR Produktqualität"}. Wissenschaft, Qualität. KEINE PREISE. Max 1500 Zeichen.`, hk: "LR Health Beauty" },
    { title: "Dein Lifestyle, deine Wahl", fmt: "video", type: "lifestyle",
      vidPrompt: "Person walking on beach at sunset, barefoot, relaxed, freedom, ocean waves, golden hour, dreamy, cinematic 9:16",
      prompt: "Instagram-Reel über Lifestyle-Freiheit durch eigenes Business. Reisen, Flexibilität. KEINE PREISE. Max 1200 Zeichen.", hk: "Gesundheit" },
  ];

  const results: any[] = [];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    console.log(`━━━ ${i+1}/10: ${p.title} [${p.fmt.toUpperCase()}/${p.type}] ━━━`);

    try {
      // Text
      const llm = await invokeLLM({
        messages: [
          { role: "system", content: "Du bist Social Media Experte für LR Health & Beauty. Authentisch, emotional. NIEMALS Preise (kein €, kein Euro). Max 5-8 Emojis. CTA am Ende. Deutsch." },
          { role: "user", content: p.prompt },
        ],
      });
      let text = llm.choices?.[0]?.message?.content || "";
      text = text.replace(/\d+[\.,]?\d*\s*€/g, "").replace(/\d+[\.,]?\d*\s*Euro/gi, "");
      const tags = hashSets[p.hk] || ["#LRHealthBeauty", "#Erfolg"];
      const fullText = text + "\n\n" + tags.slice(0, 5).join(" ");
      console.log(`  Text ✅ (${text.length} Z.)`);

      // Media
      let mediaUrl: string | null = null;
      let videoUrl: string | null = null;
      let mediaType = "none";

      if (p.type === "product" && (p as any).product?.imageUrl) {
        mediaUrl = (p as any).product.imageUrl;
        mediaType = "image";
        console.log(`  📦 Echtes Produktbild: ${(p as any).product.name}`);
      } else if (p.fmt === "image" && (p as any).imgPrompt) {
        try {
          const img = await api.generatePremiumImage({ prompt: (p as any).imgPrompt, aspectRatio: "1:1" });
          mediaUrl = img.imageUrl;
          mediaType = "image";
          console.log(`  🖼️ KI-Bild ✅`);
        } catch (err: any) {
          console.log(`  🖼️ KI-Bild Fehler: ${err.message?.slice(0, 40)}`);
          try {
            const { generateImage } = await import("../server/_core/imageGeneration.js");
            const fb = await generateImage({ prompt: (p as any).imgPrompt });
            mediaUrl = fb.url || null;
            mediaType = mediaUrl ? "image" : "none";
            if (mediaUrl) console.log(`  🖼️ Fallback-Bild ✅`);
          } catch { console.log(`  🖼️ Fallback auch fehlgeschlagen`); }
        }
      }

      if (p.fmt === "video") {
        try {
          const vid = await api.generateVideoWithFal({
            prompt: (p as any).vidPrompt,
            imageUrl: mediaUrl || undefined,
            model: "auto", duration: "5", aspectRatio: "9:16", generateAudio: true,
          });
          videoUrl = vid.videoUrl || null;
          if (videoUrl) { mediaUrl = videoUrl; mediaType = "video"; console.log(`  🎬 Video ✅`); }
        } catch (err: any) {
          console.log(`  🎬 Video Fehler: ${err.message?.slice(0, 40)}`);
        }
      }

      // DB Insert - contentPosts
      const [inserted] = await db.insert(contentPosts).values({
        createdById: ADMIN_USER_ID,
        contentType: p.fmt === "video" ? "reel" : "post",
        content: fullText,
        platforms: ["instagram", "tiktok"],
        status: "approved",
        topic: p.title,
        pillar: p.type === "product" ? "Business & Produkte" : "Lifestyle & Erfolg",
        mediaUrl,
        videoUrl,
        mediaType,
        qualityScore: 90,
        apiMetadata: { source: "full_system_demo", type: p.type, format: p.fmt },
      });
      const postId = (inserted as any).insertId;
      console.log(`  📝 Post #${postId} in DB ✅`);

      // DB Insert - contentLibrary
      await db.insert(contentLibrary).values({
        title: p.title,
        category: p.fmt === "video" ? "reel_script" : "image",
        pillar: p.type === "product" ? "Business & Produkte" : "Lifestyle & Erfolg",
        textContent: fullText,
        imageUrl: mediaType === "image" ? mediaUrl : null,
        videoUrl,
        platforms: ["instagram", "tiktok"],
        tags: tags.slice(0, 5),
        copyCount: 0,
        createdById: ADMIN_USER_ID,
      });
      console.log(`  📚 Bibliothek ✅`);

      // Blotato
      if (mediaUrl) {
        try {
          const blot = await api.publishToAllPlatforms(
            fullText, ["instagram", "tiktok"], mediaUrl,
            videoUrl ? "video" : "image", p.title
          );
          const ok = blot.results?.filter((r: any) => r.status === "success")?.length || 0;
          const fail = blot.results?.filter((r: any) => r.status !== "success")?.length || 0;
          console.log(`  📤 Blotato: ${ok} OK, ${fail} Fehler`);
        } catch (err: any) {
          console.log(`  📤 Blotato Fehler: ${err.message?.slice(0, 40)}`);
        }
      }

      results.push({ id: postId, title: p.title, fmt: p.fmt, type: p.type, mediaUrl, videoUrl, ok: true });
      console.log(`  ✅ FERTIG\n`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err: any) {
      console.log(`  ❌ FEHLER: ${err.message?.slice(0, 80)}\n`);
      results.push({ title: p.title, fmt: p.fmt, type: p.type, ok: false, err: err.message?.slice(0, 60) });
    }
  }

  // Zusammenfassung
  console.log("\n═══ ZUSAMMENFASSUNG ═══");
  const ok = results.filter(r => r.ok);
  const fail = results.filter(r => !r.ok);
  console.log(`Erfolgreich: ${ok.length}/10 | Fehlgeschlagen: ${fail.length}/10`);
  console.log(`Produktbilder: ${ok.filter(r => r.type === "product").length}`);
  console.log(`KI-Bilder: ${ok.filter(r => r.type === "lifestyle" && r.fmt === "image").length}`);
  console.log(`Videos: ${ok.filter(r => r.fmt === "video").length}`);
  results.forEach((r, i) => {
    const s = r.ok ? "✅" : "❌";
    const m = r.videoUrl ? "🎬" : r.mediaUrl ? "🖼️" : "⚠️";
    const src = r.type === "product" ? "📦" : r.type === "trend" ? "📈" : "🤖";
    console.log(`  ${s} ${i+1}. ${r.title} ${m} ${src}`);
  });
  console.log("\n✅ Alle Posts im Dashboard + Bibliothek!");
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
