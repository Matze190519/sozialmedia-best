/**
 * 5 Instagram-Posts an Blotato senden mit korrektem API-Format
 * 3 Bilder sind bereits auf S3, 2 müssen noch generiert werden
 */

import { config } from 'dotenv';
config({ path: '.env' });

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BLOTATO_BASE = "https://backend.blotato.com/v2";
const FAL_API_KEY = process.env.FAL_API_KEY;
const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

const INSTAGRAM_ACCOUNT_ID = 5345; // lr_lifestyleteam

const POSTS = [
  {
    theme: "Finanzielle Freiheit",
    text: `Stell dir vor, du entscheidest selbst wann du aufstehst.\n\nKein Wecker. Kein Chef. Keine Grenzen.\n\nGenau das ist möglich, wenn du aufhörst zu träumen und anfängst zu handeln.\n\nIch habe vor 3 Jahren eine Entscheidung getroffen, die alles verändert hat. Heute arbeite ich von überall auf der Welt.\n\nDie Frage ist nicht ob es funktioniert. Die Frage ist ob du bereit bist.\n\n#FinanzielleFreiheit #Selbstständig #Lifestyle #NetworkMarketing #Erfolg`,
    imagePrompt: "Luxury lifestyle, young successful entrepreneur man sitting on rooftop terrace of modern penthouse, golden hour sunset, city skyline in background, relaxed confident pose, wearing casual elegant clothes, warm cinematic lighting, photorealistic. Absolutely no text, no words, no letters, no watermarks.",
    imageUrl: null, // Muss noch generiert werden
  },
  {
    theme: "Traumauto",
    text: `Dieses Auto war mein Traum seit ich 16 war.\n\nJeder hat gesagt: "Das kannst du dir nie leisten."\n\nHeute parkt es in meiner Garage.\n\nDer Unterschied zwischen Träumern und Machern? Macher suchen einen Weg. Träumer suchen Ausreden.\n\nWelches Auto ist dein Traum? Schreib es in die Kommentare.\n\n#Traumauto #Motivation #Erfolg #Mindset #LuxusCars`,
    imagePrompt: "Sleek black Mercedes AMG GT parked in front of modern glass building, dramatic lighting, wet road reflections, luxury car photography, cinematic composition, golden hour, ultra realistic. Absolutely no text, no words, no letters, no watermarks.",
    imageUrl: null, // Muss noch generiert werden
  },
  {
    theme: "Gesundheit & Energie",
    text: `Dein Körper ist dein wichtigstes Werkzeug.\n\nOhne Energie kein Business. Ohne Gesundheit kein Erfolg.\n\nIch habe gelernt: Wenn du in dich investierst, kommt alles andere von allein.\n\nMein Morgenritual:\n→ 7 Uhr aufstehen\n→ Wasser mit Aloe Vera\n→ 30 Min Bewegung\n→ Gesundes Frühstück\n\nWas ist dein Morgenritual?\n\n#Gesundheit #Energie #Morgenritual #Wellness #LRHealth`,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/generated-images/1774648359521-usqwu7.png",
  },
  {
    theme: "Team & Community",
    text: `Alleine bist du schnell. Zusammen kommst du weit.\n\nDas Beste an meinem Business? Die Menschen die ich kennengelernt habe.\n\nEin Team das zusammenhält. Das sich gegenseitig pusht. Das gemeinsam feiert.\n\nDu suchst genau das? Dann lass uns reden.\n\nSchreib mir eine DM mit dem Wort TEAM.\n\n#Teamwork #Community #Zusammenhalt #NetworkMarketing #Erfolg`,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/generated-images/1774648471449-6glhz2.png",
  },
  {
    theme: "Reisen & Freiheit",
    text: `Montag Morgen. Alle fahren ins Büro.\n\nIch sitze am Pool in Bali und plane meinen nächsten Monat.\n\nDas ist kein Zufall. Das ist das Ergebnis von harter Arbeit und der richtigen Entscheidung.\n\nDu willst wissen wie? Link in Bio.\n\n#Reisen #DigitalNomad #Freiheit #Bali #Lifestyle`,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/generated-images/1774648593713-xj7ecz.png",
  },
];

async function generateAndUploadImage(prompt) {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: FAL_API_KEY });
  
  console.log(`  📸 Generiere Bild...`);
  const result = await fal.subscribe("fal-ai/nano-banana-pro", {
    input: { prompt, num_images: 1, aspect_ratio: "1:1", resolution: "2K", output_format: "png" },
  });
  
  const tempUrl = result.data?.images?.[0]?.url;
  if (!tempUrl) throw new Error("Kein Bild generiert");
  
  console.log(`  ☁️ Speichere auf S3...`);
  const imgRes = await fetch(tempUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  
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
  
  if (!uploadRes.ok) throw new Error("S3 Upload fehlgeschlagen");
  const { url } = await uploadRes.json();
  console.log(`  ✅ S3: ${url}`);
  return url;
}

async function postToBlotato(text, imageUrl, scheduledTime) {
  // Korrektes Blotato API Format!
  const body = {
    post: {
      accountId: String(INSTAGRAM_ACCOUNT_ID),
      content: {
        text,
        mediaUrls: imageUrl ? [imageUrl] : [],
        platform: "instagram",
      },
      target: {
        targetType: "instagram",
      },
    },
    scheduledTime: scheduledTime.toISOString(),
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
    return true;
  } else {
    console.log(`  ❌ Blotato Fehler (${res.status}): ${JSON.stringify(data)}`);
    return false;
  }
}

async function main() {
  console.log("🚀 5 Instagram-Posts an Blotato senden\n");
  
  let success = 0;
  // Posts in 3-Minuten-Abständen ab jetzt + 3 Min
  const baseTime = new Date(Date.now() + 3 * 60 * 1000);
  
  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const scheduleTime = new Date(baseTime.getTime() + i * 3 * 60 * 1000);
    
    console.log(`\n📝 Post ${i + 1}/5: ${post.theme}`);
    console.log(`   Geplant für: ${scheduleTime.toLocaleTimeString("de-DE")}`);
    
    try {
      // Bild generieren falls nötig
      let imageUrl = post.imageUrl;
      if (!imageUrl && post.imagePrompt) {
        imageUrl = await generateAndUploadImage(post.imagePrompt);
      }
      
      // An Blotato senden
      const ok = await postToBlotato(post.text, imageUrl, scheduleTime);
      if (ok) success++;
      
    } catch (err) {
      console.log(`  ❌ Fehler: ${err.message}`);
    }
    
    if (i < POSTS.length - 1) await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`📊 ERGEBNIS: ${success}/5 erfolgreich`);
  
  // Verifizieren
  const schedRes = await fetch(`${BLOTATO_BASE}/schedules?limit=10`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  const schedData = await schedRes.json();
  console.log(`\n📋 Geplante Posts bei Blotato: ${schedData?.items?.length || 0}`);
  for (const item of (schedData?.items || [])) {
    const text = item.draft?.content?.text?.substring(0, 60) || "?";
    console.log(`  ✅ ID: ${item.id} | ${item.scheduledAt} | ${text}...`);
  }
}

main().catch(console.error);
