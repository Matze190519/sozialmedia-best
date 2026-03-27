/**
 * DIREKTER TEST - Premium KI-Modelle
 * Ruft die fal.ai API direkt auf (ohne tRPC Auth)
 * 
 * Test 1: Nano Banana Pro (Bild)
 * Test 2: Veo 3.1 Fast (Video)
 * Test 3: Content-Generator (GoViralBitch + Brand Voice)
 */

import { fal } from "@fal-ai/client";

const FAL_API_KEY = process.env.FAL_API_KEY || "";

if (!FAL_API_KEY) {
  console.error("❌ FAL_API_KEY nicht gesetzt! Bitte in den Settings hinterlegen.");
  process.exit(1);
}

fal.config({ credentials: FAL_API_KEY });

console.log("═══════════════════════════════════════════════════");
console.log("🚀 PREMIUM KI-MODELLE - DIREKTER TEST");
console.log("═══════════════════════════════════════════════════");
console.log(`FAL_API_KEY: ${FAL_API_KEY.substring(0, 8)}...${FAL_API_KEY.substring(FAL_API_KEY.length - 4)}`);
console.log("");

// ─── TEST 1: Nano Banana Pro (Premium Bild) ─────────────────
async function testNanoBananaPro() {
  console.log("🖼️ TEST 1: Nano Banana Pro (Premium Bildgenerierung)");
  console.log("   Prompt: Luxury lifestyle - Entrepreneur mit Mercedes AMG...");
  console.log("   Modell: fal-ai/nano-banana-pro");
  console.log("   Auflösung: 2K, Format: 1:1 (Instagram)");
  console.log("   ⏳ Generiere...");

  const startTime = Date.now();
  
  try {
    const input = {
      prompt: "Professional Instagram photo: A confident young entrepreneur in a tailored dark navy suit standing next to a sleek black Mercedes-AMG GT 63 S in front of a modern glass skyscraper. Golden hour sunset lighting creates warm cinematic tones. The scene radiates success, ambition, and financial freedom. Shallow depth of field, bokeh lights in background. Ultra-realistic photography, 8K quality, magazine cover style.",
      num_images: 1,
      aspect_ratio: "1:1",
      resolution: "2K",
      output_format: "png",
    };

    const result = await fal.subscribe("fal-ai/nano-banana-pro", { input });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    const imageUrl = result.data?.images?.[0]?.url || "";
    const description = result.data?.description || "";
    
    if (imageUrl) {
      console.log(`   ✅ ERFOLG! (${elapsed}s)`);
      console.log(`   🖼️ Bild-URL: ${imageUrl}`);
      if (description) console.log(`   📝 Beschreibung: ${description.substring(0, 200)}`);
      return imageUrl;
    } else {
      console.log(`   ❌ Kein Bild generiert. Response:`, JSON.stringify(result.data).substring(0, 300));
      return null;
    }
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ FEHLER nach ${elapsed}s: ${err.message}`);
    return null;
  }
}

// ─── TEST 2: Veo 3.1 Fast (Premium Video) ───────────────────
async function testVeo31(imageUrl) {
  console.log("");
  console.log("🎬 TEST 2: Veo 3.1 Fast (Premium Videogenerierung)");
  console.log("   Prompt: Entrepreneur im Luxus-Autohaus...");
  console.log("   Modell: fal-ai/veo3.1 (Text-to-Video)");
  console.log("   Dauer: 5s, Format: 9:16 (Reels), Audio: Ja");
  console.log("   ⏳ Generiere (kann 30-120s dauern)...");

  const startTime = Date.now();
  
  try {
    const input = {
      prompt: "A confident young entrepreneur in a dark suit walks through a premium luxury car showroom. Camera follows smoothly from behind as he admires a sleek black sports car. He runs his hand along the car's body, then turns to camera with a confident smile. Golden hour sunlight streams through floor-to-ceiling windows. Cinematic slow motion, professional lighting, shallow depth of field. High-end commercial quality.",
      duration: "5s",
      aspect_ratio: "9:16",
      resolution: "1080p",
      generate_audio: true,
    };

    const result = await fal.subscribe("fal-ai/veo3.1", { input });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    const videoUrl = result.data?.video?.url || "";
    
    if (videoUrl) {
      console.log(`   ✅ ERFOLG! (${elapsed}s)`);
      console.log(`   🎬 Video-URL: ${videoUrl}`);
      return videoUrl;
    } else {
      console.log(`   ❌ Kein Video generiert. Response:`, JSON.stringify(result.data).substring(0, 300));
      return null;
    }
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ FEHLER nach ${elapsed}s: ${err.message}`);
    console.log(`   💡 Tipp: Veo 3.1 braucht manchmal etwas länger. Versuche es nochmal.`);
    return null;
  }
}

// ─── TEST 3: Nano Banana Pro - Instagram Story (9:16) ────────
async function testNanaBananaStory() {
  console.log("");
  console.log("🖼️ TEST 3: Nano Banana Pro - Instagram Story (9:16)");
  console.log("   Prompt: Motivations-Quote mit Lifestyle-Hintergrund...");
  console.log("   ⏳ Generiere...");

  const startTime = Date.now();
  
  try {
    const input = {
      prompt: "Stunning Instagram story design: Motivational quote overlay on luxury lifestyle background. Text reads 'Dein Erfolg beginnt JETZT' in elegant white typography with subtle gold accents. Background shows a dreamy sunset over infinity pool at luxury villa, palm trees silhouetted. Warm golden and coral tones, professional graphic design quality, clean modern typography, Instagram story format.",
      num_images: 1,
      aspect_ratio: "9:16",
      resolution: "2K",
      output_format: "png",
    };

    const result = await fal.subscribe("fal-ai/nano-banana-pro", { input });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    const imageUrl = result.data?.images?.[0]?.url || "";
    
    if (imageUrl) {
      console.log(`   ✅ ERFOLG! (${elapsed}s)`);
      console.log(`   🖼️ Story-URL: ${imageUrl}`);
      return imageUrl;
    } else {
      console.log(`   ❌ Kein Bild generiert.`);
      return null;
    }
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ FEHLER nach ${elapsed}s: ${err.message}`);
    return null;
  }
}

// ─── TEST 4: Content-Generator (GoViralBitch) ───────────────
async function testContentGenerator() {
  console.log("");
  console.log("✍️ TEST 4: Content-Generator (GoViralBitch API)");
  
  const GOVIRALBITCH_URL = process.env.GOVIRALBITCH_API_URL || "https://goviralbitch-deploy.onrender.com";
  console.log(`   API: ${GOVIRALBITCH_URL}`);
  console.log("   ⏳ Generiere Instagram-Post...");

  const startTime = Date.now();
  
  try {
    const res = await fetch(`${GOVIRALBITCH_URL}/generate/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Warum 2026 das beste Jahr für dein eigenes Business ist - LR Health & Beauty Chance nutzen",
        pillar: "Business Opportunity",
        platform: "instagram",
        count: 1,
      }),
    });

    if (!res.ok) {
      console.log(`   ❌ API Fehler: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`   ✅ ERFOLG! (${elapsed}s)`);
    
    const post = data.posts?.[0] || data;
    const text = post.content || post.text || post.caption || JSON.stringify(post).substring(0, 300);
    console.log(`   📝 Text: ${text.substring(0, 200)}...`);
    
    if (post.hashtags) console.log(`   #️⃣ Hashtags: ${Array.isArray(post.hashtags) ? post.hashtags.join(" ") : post.hashtags}`);
    if (post.hook) console.log(`   🪝 Hook: ${post.hook}`);
    
    return post;
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ FEHLER nach ${elapsed}s: ${err.message}`);
    return null;
  }
}

// ─── ALLE TESTS AUSFÜHREN ────────────────────────────────────
async function runAllTests() {
  const results = {};
  
  // Test 1: Premium Bild
  results.image = await testNanoBananaPro();
  
  // Test 2: Premium Video  
  results.video = await testVeo31(results.image);
  
  // Test 3: Story Bild
  results.story = await testNanaBananaStory();
  
  // Test 4: Content Generator
  results.content = await testContentGenerator();

  // ─── ZUSAMMENFASSUNG ───────────────────────────────────────
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("📊 TEST-ERGEBNISSE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`Nano Banana Pro (1:1):  ${results.image ? "✅ " + results.image : "❌ Fehlgeschlagen"}`);
  console.log(`Veo 3.1 Fast (Video):  ${results.video ? "✅ " + results.video : "❌ Fehlgeschlagen"}`);
  console.log(`Nano Banana Pro (9:16): ${results.story ? "✅ " + results.story : "❌ Fehlgeschlagen"}`);
  console.log(`Content-Generator:      ${results.content ? "✅ Text generiert" : "❌ Fehlgeschlagen"}`);
  console.log("═══════════════════════════════════════════════════");
  
  if (results.image || results.video || results.story) {
    console.log("");
    console.log("🎉 Premium KI-Modelle funktionieren!");
    console.log("   Öffne die URLs oben im Browser um die Ergebnisse zu sehen.");
  }
}

runAllTests().catch(console.error);
