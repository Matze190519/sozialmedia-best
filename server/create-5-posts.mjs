/**
 * 5 echte Instagram-Posts generieren und an Blotato senden
 * Nutzt die gleichen Funktionen wie das Dashboard
 * Bilder werden auf S3 gespeichert (permanente URLs)
 */

// Load env
import { config } from 'dotenv';
config({ path: '.env' });

const FAL_API_KEY = process.env.FAL_API_KEY;
const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BLOTATO_BASE = "https://backend.blotato.com/v2";

// 5 verschiedene Post-Konzepte für Instagram
const POSTS = [
  {
    theme: "Finanzielle Freiheit",
    text: `Stell dir vor, du entscheidest selbst wann du aufstehst.\n\nKein Wecker. Kein Chef. Keine Grenzen.\n\nGenau das ist möglich, wenn du aufhörst zu träumen und anfängst zu handeln.\n\nIch habe vor 3 Jahren eine Entscheidung getroffen, die alles verändert hat. Heute arbeite ich von überall auf der Welt.\n\nDie Frage ist nicht ob es funktioniert. Die Frage ist ob du bereit bist.\n\n#FinanzielleFreiheit #Selbstständig #Lifestyle #NetworkMarketing #Erfolg`,
    imagePrompt: "Luxury lifestyle, young successful entrepreneur man sitting on rooftop terrace of modern penthouse, golden hour sunset, city skyline in background, relaxed confident pose, wearing casual elegant clothes, warm cinematic lighting, photorealistic, high-end fashion photography style. Absolutely no text, no words, no letters, no watermarks.",
    aspectRatio: "1:1",
  },
  {
    theme: "Traumauto",
    text: `Dieses Auto war mein Traum seit ich 16 war.\n\nJeder hat gesagt: "Das kannst du dir nie leisten."\n\nHeute parkt es in meiner Garage.\n\nDer Unterschied zwischen Träumern und Machern? Macher suchen einen Weg. Träumer suchen Ausreden.\n\nWelches Auto ist dein Traum? Schreib es in die Kommentare.\n\n#Traumauto #Motivation #Erfolg #Mindset #LuxusCars`,
    imagePrompt: "Sleek black Mercedes AMG GT parked in front of modern glass building, dramatic lighting, wet road reflections, luxury car photography, cinematic composition, golden hour, ultra realistic, professional automotive photography. Absolutely no text, no words, no letters, no watermarks.",
    aspectRatio: "1:1",
  },
  {
    theme: "Gesundheit & Energie",
    text: `Dein Körper ist dein wichtigstes Werkzeug.\n\nOhne Energie kein Business. Ohne Gesundheit kein Erfolg.\n\nIch habe gelernt: Wenn du in dich investierst, kommt alles andere von allein.\n\nMein Morgenritual:\n→ 7 Uhr aufstehen\n→ Wasser mit Aloe Vera\n→ 30 Min Bewegung\n→ Gesundes Frühstück\n\nWas ist dein Morgenritual?\n\n#Gesundheit #Energie #Morgenritual #Wellness #LRHealth`,
    imagePrompt: "Healthy lifestyle flat lay, fresh green smoothie bowl with fruits, yoga mat, running shoes, bright morning sunlight through window, clean minimalist aesthetic, overhead shot, warm natural colors, lifestyle photography. Absolutely no text, no words, no letters, no watermarks.",
    aspectRatio: "1:1",
  },
  {
    theme: "Team & Community",
    text: `Alleine bist du schnell. Zusammen kommst du weit.\n\nDas Beste an meinem Business? Die Menschen die ich kennengelernt habe.\n\nEin Team das zusammenhält. Das sich gegenseitig pusht. Das gemeinsam feiert.\n\nDu suchst genau das? Dann lass uns reden.\n\nSchreib mir eine DM mit dem Wort TEAM.\n\n#Teamwork #Community #Zusammenhalt #NetworkMarketing #Erfolg`,
    imagePrompt: "Group of diverse young professionals celebrating success together, modern coworking space, high-fiving, genuine smiles and laughter, bright natural lighting, team spirit, candid moment, lifestyle photography, warm atmosphere. Absolutely no text, no words, no letters, no watermarks.",
    aspectRatio: "1:1",
  },
  {
    theme: "Reisen & Freiheit",
    text: `Montag Morgen. Alle fahren ins Büro.\n\nIch sitze am Pool in Bali und plane meinen nächsten Monat.\n\nDas ist kein Zufall. Das ist das Ergebnis von harter Arbeit und der richtigen Entscheidung.\n\nDu willst wissen wie? Link in Bio.\n\n#Reisen #DigitalNomad #Freiheit #Bali #Lifestyle`,
    imagePrompt: "Infinity pool overlooking tropical ocean in Bali, palm trees, crystal clear turquoise water, luxury villa, morning golden light, paradise vacation, travel lifestyle photography, cinematic wide angle, dreamy atmosphere. Absolutely no text, no words, no letters, no watermarks.",
    aspectRatio: "1:1",
  },
];

async function generateImage(prompt, aspectRatio) {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: FAL_API_KEY });
  
  console.log(`  📸 Generiere Bild mit Nano Banana Pro...`);
  const result = await fal.subscribe("fal-ai/nano-banana-pro", {
    input: {
      prompt,
      num_images: 1,
      aspect_ratio: aspectRatio,
      resolution: "2K",
      output_format: "png",
    },
  });
  
  const tempUrl = result.data?.images?.[0]?.url;
  if (!tempUrl) throw new Error("Kein Bild generiert");
  
  // Auf S3 speichern für permanente URL
  console.log(`  ☁️ Speichere auf S3...`);
  const imgRes = await fetch(tempUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  
  const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
  const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  
  const suffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `generated-images/${Date.now()}-${suffix}.png`;
  
  const uploadUrl = new URL("v1/storage/upload", FORGE_URL + "/");
  uploadUrl.searchParams.set("path", fileKey);
  
  const form = new FormData();
  form.append("file", new Blob([imgBuffer], { type: "image/png" }), `${suffix}.png`);
  
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${FORGE_KEY}` },
    body: form,
  });
  
  if (!uploadRes.ok) {
    console.warn(`  ⚠️ S3 Upload fehlgeschlagen, nutze temporäre URL`);
    return tempUrl;
  }
  
  const { url: permanentUrl } = await uploadRes.json();
  console.log(`  ✅ S3 URL: ${permanentUrl}`);
  return permanentUrl;
}

async function postToBlotato(text, imageUrl, scheduledTime) {
  const body = {
    text,
    platforms: ["instagram"],
    accounts: [5345], // lr_lifestyleteam
    scheduledTime: scheduledTime.toISOString(),
    media: imageUrl ? [{ url: imageUrl, type: "image" }] : [],
  };
  
  console.log(`  📤 Sende an Blotato (${scheduledTime.toLocaleTimeString("de-DE")})...`);
  
  const res = await fetch(`${BLOTATO_BASE}/posts`, {
    method: "POST",
    headers: {
      "blotato-api-key": BLOTATO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  
  if (res.status === 201) {
    console.log(`  ✅ Blotato akzeptiert! Submission: ${data.postSubmissionId}`);
    return { success: true, submissionId: data.postSubmissionId };
  } else {
    console.log(`  ❌ Blotato Fehler (${res.status}): ${JSON.stringify(data)}`);
    return { success: false, error: data };
  }
}

async function main() {
  console.log("🚀 Starte 5 Instagram-Posts Generierung\n");
  console.log("═══════════════════════════════════════════\n");
  
  const results = [];
  
  // Posts werden in 3-Minuten-Abständen geplant (ab jetzt + 3 Min)
  const baseTime = new Date(Date.now() + 3 * 60 * 1000);
  
  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const scheduleTime = new Date(baseTime.getTime() + i * 3 * 60 * 1000);
    
    console.log(`\n📝 Post ${i + 1}/5: ${post.theme}`);
    console.log(`   Geplant für: ${scheduleTime.toLocaleTimeString("de-DE")}`);
    console.log("───────────────────────────────────────");
    
    try {
      // 1. Bild generieren
      const imageUrl = await generateImage(post.imagePrompt, post.aspectRatio);
      
      // 2. An Blotato senden
      const result = await postToBlotato(post.text, imageUrl, scheduleTime);
      
      results.push({
        theme: post.theme,
        imageUrl,
        scheduledFor: scheduleTime.toISOString(),
        ...result,
      });
      
    } catch (err) {
      console.log(`  ❌ Fehler: ${err.message}`);
      results.push({ theme: post.theme, success: false, error: err.message });
    }
    
    // Kurze Pause zwischen Posts
    if (i < POSTS.length - 1) {
      console.log(`  ⏳ Warte 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log("\n═══════════════════════════════════════════");
  console.log("📊 ERGEBNIS:");
  console.log("═══════════════════════════════════════════\n");
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Erfolgreich: ${successful.length}/5`);
  console.log(`❌ Fehlgeschlagen: ${failed.length}/5\n`);
  
  for (const r of results) {
    const status = r.success ? "✅" : "❌";
    console.log(`${status} ${r.theme}: ${r.success ? `Geplant für ${r.scheduledFor}` : r.error}`);
    if (r.imageUrl) console.log(`   🖼️ ${r.imageUrl}`);
  }
  
  // Verifizieren bei Blotato
  console.log("\n📋 Verifizierung bei Blotato:");
  const schedRes = await fetch(`${BLOTATO_BASE}/schedules?limit=10`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  const schedData = await schedRes.json();
  console.log(`Geplante Posts: ${schedData?.count || schedData?.items?.length || 0}`);
  for (const item of (schedData?.items || []).slice(0, 5)) {
    console.log(`  ID: ${item.id} | ${item.draft?.content?.platform} | ${item.scheduledAt}`);
  }
}

main().catch(console.error);
