/**
 * Erstellt Premium Instagram-Posts mit Nano Banana Pro Bildern + Veo 3.1 Video
 * Fixes: Deutsche Texte, max 5 Hashtags, kein Text in Bildern, Video-Generierung
 */
import { fal } from "@fal-ai/client";
import mysql from "mysql2/promise";

const FAL_API_KEY = process.env.FAL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!FAL_API_KEY) { console.error("FAL_API_KEY fehlt!"); process.exit(1); }
if (!DATABASE_URL) { console.error("DATABASE_URL fehlt!"); process.exit(1); }

fal.config({ credentials: FAL_API_KEY });

// Posts mit max 5 Hashtags, deutsche Texte, Bild-Prompts ohne Text-Anweisungen
const posts = [
  {
    content: `Stell dir vor, du wachst morgens auf und entscheidest selbst, wie dein Tag aussieht.

Kein Wecker. Kein Chef. Kein "ich muss".

Genau das ist mein Alltag seit ich mit LR gestartet habe. Vor 3 Jahren saß ich noch im Büro und habe davon geträumt.

Der Unterschied? Ich habe aufgehört zu träumen und angefangen zu handeln.

Mit nur 99 Euro Startinvestition habe ich mir ein Business aufgebaut, das mir heute finanzielle Freiheit gibt.

Schreib mir "START" und ich zeige dir wie.

#FinanzielleFreiheit #LRPartner #NetworkMarketing #Lifestyle #Erfolg`,
    contentType: "post",
    pillar: "Business Opportunity",
    topic: "Finanzielle Freiheit durch LR",
    imagePrompt: "Successful young entrepreneur man in casual luxury clothes standing on a rooftop terrace overlooking a modern city skyline at golden hour, confident smile, arms crossed, wearing a premium watch, warm sunset lighting, photorealistic, Instagram lifestyle photography, 4K quality. No text, no words, no letters, no watermarks, no logos, no writing on the image.",
    aspectRatio: "1:1",
    generateVideo: false,
  },
  {
    content: `Die meisten Menschen arbeiten 40 Jahre für den Traum von jemand anderem.

Ich habe mich vor 3 Jahren entschieden: Ich baue meinen eigenen Traum auf.

Heute fahre ich den Firmenwagen meiner Wahl - bezahlt von LR.

Das Autokonzept von LR ist einzigartig: Du wählst dein Traumauto und LR zahlt bis zu 2.000 Euro monatlich dazu. Mercedes, BMW, Porsche - du entscheidest.

Und das Beste? Du brauchst kein Startkapital von 100.000 Euro. Du brauchst 99 Euro und den Willen, etwas zu verändern.

Schreib mir "AUTO" für alle Details.

#Autokonzept #LRPartner #Firmenwagen #Traumauto #Erfolg`,
    contentType: "reel",
    pillar: "Autokonzept",
    topic: "LR Autokonzept - Firmenwagen deiner Wahl",
    imagePrompt: "Luxury black Mercedes AMG coupe parked in front of a modern glass skyscraper, dramatic golden hour lighting, reflections on the glossy car paint, cinematic wide angle photography, ultra realistic, high end automotive photography, 4K. No text, no words, no letters, no watermarks, no logos, no writing on the image.",
    aspectRatio: "9:16",
    generateVideo: true,
    videoPrompt: "Cinematic slow motion shot of a luxury black Mercedes AMG driving through a modern city at golden hour, camera tracking alongside the car, reflections of skyscrapers on the glossy paint, warm sunset lighting, premium automotive commercial feel",
  },
  {
    content: `"Das ist doch Abzocke!" - Höre ich oft.

Lass mich dir mal die Fakten zeigen:

LR Health und Beauty: 40 Jahre am Markt, in 32 Ländern aktiv, Produkte Fresenius-geprüft und Dermatest-zertifiziert, Einstieg für nur 99 Euro.

Vergleich das mal mit einer Franchise: McDonald's braucht 500.000 Euro Startkapital, Starbucks 300.000 Euro. LR braucht 99 Euro.

Die Wahrheit ist: Die meisten Menschen haben Angst vor Veränderung. Und das ist okay. Aber lass dich nicht von Angst aufhalten.

Fragen? Schreib mir - ich erkläre dir alles transparent.

#Fakten #LRPartner #NetworkMarketing #Business #Entrepreneurship`,
    contentType: "post",
    pillar: "Einwandbehandlung",
    topic: "Einwand: Das ist Abzocke - Fakten vs. Vorurteile",
    imagePrompt: "Confident young businessman in a modern minimalist office, sitting at a clean desk with a laptop showing charts, natural window light, plants in background, warm and inviting atmosphere, professional but approachable, photorealistic portrait photography, 4K. No text, no words, no letters, no watermarks, no logos, no writing on the image.",
    aspectRatio: "1:1",
    generateVideo: false,
  },
];

async function generateAndInsert() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n═══ Post ${i + 1}/${posts.length}: ${post.pillar} ═══`);
    
    // 1. Premium-Bild mit Nano Banana Pro
    console.log(`  Generiere Bild mit Nano Banana Pro...`);
    let imageUrl = null;
    try {
      const imgResult = await fal.subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: post.imagePrompt,
          num_images: 1,
          aspect_ratio: post.aspectRatio,
          resolution: "2K",
          output_format: "png",
        },
      });
      imageUrl = imgResult.data?.images?.[0]?.url || null;
      if (imageUrl) {
        console.log(`  Bild OK: ${imageUrl}`);
      } else {
        console.log(`  WARNUNG: Kein Bild`);
      }
    } catch (err) {
      console.error(`  Bild-Fehler: ${err.message}`);
    }
    
    // 2. Video mit Veo 3.1 (nur für Posts mit generateVideo: true)
    let videoUrl = null;
    if (post.generateVideo && imageUrl) {
      console.log(`  Generiere Video mit Veo 3.1 (Image-to-Video)...`);
      try {
        const vidResult = await fal.subscribe("fal-ai/veo3.1/image-to-video", {
          input: {
            prompt: post.videoPrompt,
            image_url: imageUrl,
            duration: "4s",
            aspect_ratio: post.aspectRatio === "9:16" ? "9:16" : "16:9",
          },
        });
        videoUrl = vidResult.data?.video?.url || null;
        if (videoUrl) {
          console.log(`  Video OK: ${videoUrl}`);
        } else {
          console.log(`  WARNUNG: Kein Video`);
          // Fallback: Kling 3.0 Pro
          console.log(`  Fallback: Kling 3.0 Pro...`);
          try {
            const klingResult = await fal.subscribe("fal-ai/kling-video/v3/pro/image-to-video", {
              input: {
                prompt: post.videoPrompt,
                image_url: imageUrl,
                duration: "5",
                aspect_ratio: post.aspectRatio === "9:16" ? "9:16" : "16:9",
              },
            });
            videoUrl = klingResult.data?.video?.url || null;
            if (videoUrl) console.log(`  Kling Video OK: ${videoUrl}`);
          } catch (klingErr) {
            console.error(`  Kling-Fehler: ${klingErr.message}`);
          }
        }
      } catch (err) {
        console.error(`  Veo-Fehler: ${err.message}`);
        // Fallback: Kling 3.0 Pro
        console.log(`  Fallback: Kling 3.0 Pro...`);
        try {
          const klingResult = await fal.subscribe("fal-ai/kling-video/v3/pro/image-to-video", {
            input: {
              prompt: post.videoPrompt,
              image_url: imageUrl,
              duration: "5",
              aspect_ratio: post.aspectRatio === "9:16" ? "9:16" : "16:9",
            },
          });
          videoUrl = klingResult.data?.video?.url || null;
          if (videoUrl) console.log(`  Kling Video OK: ${videoUrl}`);
        } catch (klingErr) {
          console.error(`  Kling-Fehler: ${klingErr.message}`);
        }
      }
    }
    
    // 3. In DB einfügen als "pending"
    console.log(`  Speichere in Freigabe-Queue...`);
    const [result] = await conn.execute(
      `INSERT INTO content_posts (createdById, contentType, content, platforms, status, mediaUrl, mediaType, videoUrl, topic, pillar, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        1,
        post.contentType,
        post.content,
        JSON.stringify(["instagram"]),
        imageUrl,
        imageUrl ? "image" : "none",
        videoUrl,
        post.topic,
        post.pillar,
      ]
    );
    console.log(`  Post #${result.insertId} in Freigabe-Queue`);
  }
  
  await conn.end();
  console.log(`\n${posts.length} Premium-Posts erstellt und warten auf Freigabe!`);
}

generateAndInsert().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
