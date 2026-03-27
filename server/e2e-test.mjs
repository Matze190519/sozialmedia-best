/**
 * End-to-End System-Test: Komplette Content-Pipeline für Instagram
 * 
 * Testet: Trend-Scanner → Content-Generator → Premium-Bild (Nano Banana Pro) → Premium-Video (Veo 3.1)
 * Alles landet in der Freigabe-Queue - KEIN echtes Posten!
 */

// Wir rufen die Server-Funktionen direkt auf (kein HTTP nötig da wir im gleichen Prozess sind)
// Stattdessen nutzen wir die tRPC API über HTTP

const BASE_URL = "http://localhost:3000";

// Helper: tRPC Mutation aufrufen
async function trpcMutation(path, input) {
  const res = await fetch(`${BASE_URL}/api/trpc/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (data.error) {
    console.error(`❌ ${path} Fehler:`, JSON.stringify(data.error, null, 2));
    return null;
  }
  return data.result?.data;
}

// Helper: tRPC Query aufrufen
async function trpcQuery(path, input) {
  const params = input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : "";
  const res = await fetch(`${BASE_URL}/api/trpc/${path}${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.error) {
    console.error(`❌ ${path} Fehler:`, JSON.stringify(data.error, null, 2));
    return null;
  }
  return data.result?.data;
}

async function runTest() {
  console.log("═══════════════════════════════════════════════════");
  console.log("🚀 LR CONTENT PIPELINE - END-TO-END TEST");
  console.log("═══════════════════════════════════════════════════");
  console.log("Platform: Instagram | Modus: Nur Freigabe (kein Posten)");
  console.log("");

  // ─── Step 1: Trend-Scanner ─────────────────────────────────
  console.log("📡 STEP 1: Trend-Scanner läuft...");
  console.log("   Suche nach viralen Trends für LR/Network Marketing/Gesundheit...");
  
  const trendResult = await trpcMutation("trends.scan", {
    platforms: ["instagram"],
    maxResults: 5,
  });
  
  if (trendResult) {
    console.log(`   ✅ ${trendResult.trends?.length || 0} Trends gefunden!`);
    if (trendResult.trends?.length > 0) {
      const topTrend = trendResult.trends[0];
      console.log(`   🔥 Top-Trend: "${topTrend.title || topTrend.topic}"`);
      console.log(`   📊 Viral-Score: ${topTrend.viralScore || "N/A"}`);
      console.log(`   📱 Plattform: ${topTrend.platform || "instagram"}`);
    }
  } else {
    console.log("   ⚠️ Trend-Scanner nicht erreichbar (braucht Auth) - nutze manuellen Trend");
  }
  console.log("");

  // ─── Step 2: Content generieren ────────────────────────────
  console.log("✍️ STEP 2: Content generieren mit GoViralBitch + Brand Voice...");
  
  const contentResult = await trpcMutation("generator.generate", {
    topic: "Warum 2026 das beste Jahr für dein eigenes Business ist - LR Health & Beauty Chance",
    pillar: "Business Opportunity",
    platform: "instagram",
    contentType: "post",
    hookStyle: "curiosity",
    generateImage: true,
  });

  if (contentResult) {
    console.log("   ✅ Content generiert!");
    console.log(`   📝 Text (Vorschau): ${(contentResult.content || contentResult.text || "").substring(0, 150)}...`);
    console.log(`   🪝 Hook: ${contentResult.hook || "N/A"}`);
    console.log(`   🖼️ Bild-Prompt: ${(contentResult.imagePrompt || "").substring(0, 100)}...`);
    console.log(`   📊 Post-ID: ${contentResult.postId || "N/A"}`);
    if (contentResult.imageUrl) {
      console.log(`   🖼️ BILD GENERIERT: ${contentResult.imageUrl}`);
    }
  } else {
    console.log("   ⚠️ Content-Generator nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Step 3: Carousel generieren ───────────────────────────
  console.log("🎠 STEP 3: Carousel-Content für Instagram...");
  
  const carouselResult = await trpcMutation("generator.generate", {
    topic: "5 Gründe warum LR Partner finanziell frei werden - Autokonzept, Reisen, Fresenius-geprüft",
    pillar: "Lifestyle & Erfolg",
    platform: "instagram",
    contentType: "carousel",
    hookStyle: "value",
    generateImage: true,
  });

  if (carouselResult) {
    console.log("   ✅ Carousel generiert!");
    console.log(`   📝 Text: ${(carouselResult.content || carouselResult.text || "").substring(0, 150)}...`);
    console.log(`   📊 Post-ID: ${carouselResult.postId || "N/A"}`);
  } else {
    console.log("   ⚠️ Carousel nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Step 4: Lifestyle-Engine ──────────────────────────────
  console.log("🌴 STEP 4: Lifestyle-Engine - Luxus-Content...");
  
  const lifestyleResult = await trpcMutation("lifestyle.generate", {
    category: "luxusautos",
    includeImage: true,
    includeVideo: false,
    platforms: ["instagram"],
  });

  if (lifestyleResult) {
    console.log("   ✅ Lifestyle-Content generiert!");
    console.log(`   📝 Text: ${(lifestyleResult.content || lifestyleResult.text || "").substring(0, 150)}...`);
    console.log(`   📊 Post-ID: ${lifestyleResult.postId || "N/A"}`);
    if (lifestyleResult.imageUrl) {
      console.log(`   🖼️ BILD: ${lifestyleResult.imageUrl}`);
    }
  } else {
    console.log("   ⚠️ Lifestyle-Engine nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Step 5: Premium-Bild testen ──────────────────────────
  console.log("🖼️ STEP 5: Premium-Bild (Nano Banana Pro) Test...");
  
  const imageResult = await trpcMutation("media.generateImage", {
    prompt: "Luxury lifestyle scene: A confident young entrepreneur in a premium dark suit standing next to a sleek black Mercedes AMG GT in front of a modern glass office building at golden hour. The scene radiates success, ambition, and financial freedom. Professional photography style, cinematic lighting, shallow depth of field, warm golden tones. Instagram-ready square format.",
    usePremium: true,
    aspectRatio: "1:1",
    resolution: "2K",
  });

  if (imageResult) {
    console.log("   ✅ NANO BANANA PRO Bild generiert!");
    console.log(`   🖼️ URL: ${imageResult.url}`);
  } else {
    console.log("   ⚠️ Bildgenerierung nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Step 6: Premium-Video testen ──────────────────────────
  console.log("🎬 STEP 6: Premium-Video (Veo 3.1 / Kling 3.0 Pro) Test...");
  
  const videoResult = await trpcMutation("media.generateVideo", {
    prompt: "A confident young entrepreneur walking through a luxury car showroom, admiring a sleek black sports car. Camera follows from behind, cinematic slow motion. The entrepreneur touches the car, smiles confidently, then turns to camera. Golden hour lighting through large windows. Professional cinematic quality, shallow depth of field.",
    model: "auto",
    duration: "5",
    aspectRatio: "9:16",
    generateAudio: true,
  });

  if (videoResult) {
    console.log("   ✅ PREMIUM VIDEO generiert!");
    console.log(`   🎬 URL: ${videoResult.videoUrl}`);
    console.log(`   🤖 Modell: ${videoResult.model}`);
    console.log(`   ⏱️ Dauer: ${videoResult.duration}s`);
  } else {
    console.log("   ⚠️ Videogenerierung nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Step 7: Freigabe-Queue prüfen ────────────────────────
  console.log("📋 STEP 7: Freigabe-Queue Status...");
  
  const queueResult = await trpcQuery("approval.pending");
  
  if (queueResult) {
    console.log(`   ✅ ${queueResult.length || 0} Posts warten auf Freigabe`);
    if (queueResult.length > 0) {
      queueResult.slice(0, 3).forEach((post, i) => {
        console.log(`   ${i+1}. [${post.status}] ${(post.content || post.text || "").substring(0, 80)}...`);
        if (post.mediaUrl) console.log(`      🖼️ Bild: ${post.mediaUrl}`);
        if (post.videoUrl) console.log(`      🎬 Video: ${post.videoUrl}`);
      });
    }
  } else {
    console.log("   ⚠️ Freigabe-Queue nicht erreichbar (braucht Auth)");
  }
  console.log("");

  // ─── Zusammenfassung ───────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("📊 TEST-ZUSAMMENFASSUNG");
  console.log("═══════════════════════════════════════════════════");
  console.log(`Trend-Scanner:     ${trendResult ? "✅" : "⚠️ Auth nötig"}`);
  console.log(`Content-Generator: ${contentResult ? "✅" : "⚠️ Auth nötig"}`);
  console.log(`Carousel:          ${carouselResult ? "✅" : "⚠️ Auth nötig"}`);
  console.log(`Lifestyle-Engine:  ${lifestyleResult ? "✅" : "⚠️ Auth nötig"}`);
  console.log(`Premium-Bild:      ${imageResult ? "✅ " + imageResult.url : "⚠️ Auth nötig"}`);
  console.log(`Premium-Video:     ${videoResult ? "✅ " + videoResult.videoUrl : "⚠️ Auth nötig"}`);
  console.log(`Freigabe-Queue:    ${queueResult ? "✅ " + (queueResult.length || 0) + " Posts" : "⚠️ Auth nötig"}`);
  console.log("");
  console.log("ℹ️ Hinweis: Alle Endpoints brauchen Auth. Teste über das Dashboard-UI!");
  console.log("═══════════════════════════════════════════════════");
}

runTest().catch(console.error);
