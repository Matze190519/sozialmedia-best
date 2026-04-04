/**
 * 1) Insert 7 already-posted videos into content_posts + content_library
 * 2) Generate remaining 3 videos (Mind Master, Events, Transformation)
 * 3) Post them on Instagram, TikTok, YouTube
 * 4) Insert them into content_posts + content_library too
 */
import { drizzle } from "drizzle-orm/mysql2";
import { contentPosts, contentLibrary } from "../drizzle/schema";
import { fal } from "@fal-ai/client";

// Load env
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

fal.config({ credentials: process.env.FAL_API_KEY! });

const BLOTATO_KEY = process.env.BLOTATO_API_KEY!;
const DB_URL = process.env.DATABASE_URL!;

const db = drizzle(DB_URL);

// Admin user ID = 1 (Mathias)
const ADMIN_ID = 1;

// Already posted videos
const existingPosts = [
  {
    topic: "Autokonzept",
    pillar: "Business & Karriere",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775308782892-z37958.mp4",
    content: `Ich hab's gehasst, wenn mir Leute gesagt haben: "Du kannst dir das nicht leisten!" 😤

Aber weißt du was? Sie hatten recht – bis ich meine Strategie geändert hab.

Stell dir vor, du könntest dir nicht nur ein Traumauto leisten, sondern auch die Freiheit, es zu genießen. Kein Risiko, keine versteckten Kosten – nur eine Chance, die dein Leben verändern kann. ✨

Schreib mir eine DM mit 'FREIHEIT' 🚀

#LRPartner #DreamCar #Autokonzept #Luxusauto #Erfolg`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Finanzielle Freiheit",
    pillar: "Business & Karriere",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775308839386-pg4owk.mp4",
    content: `Fühlst du dich manchmal, als stündest du vor einer unüberwindbaren Mauer? 🧱

Jeder große Erfolg beginnt mit einem kleinen Durchbruch. Es braucht Mut, Disziplin und den unbedingten Willen, nicht aufzugeben.

Dein Mindset ist dein stärkstes Werkzeug. 💪

Schreib mir eine DM, wenn du bereit bist! 🚀

#Mindset #Erfolg #Durchbruch #Motivation #Business`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Aloe Vera Produkte",
    pillar: "Beauty & Pflege",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775308904824-8inkih.mp4",
    content: `Wusstest du, dass 90% der Aloe Vera Produkte im Supermarkt fast keine echte Aloe Vera enthalten? 🌿

LR verwendet bis zu 90% reines Aloe Vera Gel. Fresenius-geprüft. Dermatest-zertifiziert.

Seit über 40 Jahren setzt LR auf Qualität statt Marketing-Versprechen.

Schreib mir eine DM für eine kostenlose Beratung 🌱

#AloeVera #LRHealthBeauty #Naturkosmetik #Gesundheit #Qualität`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "KI Lina",
    pillar: "Business & Karriere",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775309031773-vf6q0l.mp4",
    content: `Stell dir vor: Du hast eine KI-Assistentin, die 24/7 für dich arbeitet. 🤖

Lina erstellt Content, beantwortet Fragen, plant Posts und kennt alle 226 LR-Produkte auswendig.

Kein anderes Network Marketing Team hat sowas. Das ist die Zukunft.

Willst du Lina kennenlernen? DM mit 'LINA' 🚀

#KI #Innovation #NetworkMarketing #LRPartner #Zukunft`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Teamwork",
    pillar: "Business & Karriere",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775309112295-enl155.mp4",
    content: `Dieser Moment, wenn harte Arbeit sich auszahlt! 🏆✨

Es geht nicht nur um Zahlen, sondern um persönliche Entwicklung und die Möglichkeit, anderen zu helfen, ihre eigenen Träume zu verwirklichen.

Wir bauen hier nicht nur ein Business auf, sondern eine Zukunft.

DM für mehr Infos 🚀

#Erfolg #Business #Karriere #Wachstum #Team`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Mallorca Lifestyle",
    pillar: "Lifestyle & Fashion",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775309187086-e18k9i.mp4",
    content: `Stell dir vor: Du wachst auf, umgeben von majestätischen Gipfeln, der Duft von frischem Kaffee in der Luft. 🏔️☕

Wir glauben daran, dass das Leben eine Aneinanderreihung unvergesslicher Erlebnisse sein sollte.

Sende mir eine DM mit 'REISE' 🌍

#Lifestyle #Reisen #Luxus #Freiheit #LRPartner`,
    platforms: ["tiktok", "youtube"],
  },
  {
    topic: "Nebeneinkommen",
    pillar: "Business & Karriere",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775309246839-224u74.mp4",
    content: `Stell dir vor, du stehst hier. Die Sonne geht unter und du spürst diese unendliche Weite. 🌅

Das Gefühl von absoluter Freiheit und Unabhängigkeit. Nicht mehr an feste Arbeitszeiten gebunden.

Es ist mehr als nur ein Job – es ist eine Lebensphilosophie.

DM mit 'START' für mehr Infos 🚀

#Freiheit #Nebeneinkommen #Lifestyle #Business #LR`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
];

// Remaining 3 posts to generate
const remainingPosts = [
  {
    topic: "Mind Master",
    pillar: "Gesundheit & Fitness",
    videoPrompt: "Cinematic close-up of a person taking Mind Master supplement drops, golden liquid dropping into a glass of water, morning light streaming through window, healthy lifestyle, premium product photography feel, 4K quality",
    content: `Stress, Müdigkeit, Konzentrationsprobleme? 🧠

Mind Master ist die Antwort. Anti-Stress-Getränk mit Aloe Vera, Traubenkernextrakt und grünem Tee.

Wissenschaftlich entwickelt, um deinen Körper in Stresssituationen zu unterstützen.

Probier es selbst – DM für mehr Infos 💪

#MindMaster #AntiStress #Gesundheit #LR #Energie`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Events & Community",
    pillar: "Business & Karriere",
    videoPrompt: "Energetic business event atmosphere, crowd of motivated young professionals cheering on stage, confetti falling, spotlights, motivational speaker on stage, luxury event venue, cinematic 4K, dynamic camera movement",
    content: `Die Energie auf unseren Events ist unbeschreiblich! 🔥

Hunderte motivierte Menschen, die alle das gleiche Ziel haben: Mehr aus ihrem Leben machen.

18. April – Business Day Düsseldorf. Bist du dabei?

DM mit 'EVENT' für Tickets 🎫

#BusinessDay #Event #Motivation #Community #LR`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    topic: "Transformation",
    pillar: "Gesundheit & Fitness",
    videoPrompt: "Split screen transformation video, left side: tired stressed person in grey office, right side: same person energetic outdoors in nature, vibrant colors, healthy glowing skin, before and after lifestyle change, cinematic 4K",
    content: `Vorher: Müde, gestresst, unzufrieden. Nachher: Energiegeladen, frei, erfolgreich. 💫

Die Transformation beginnt mit einer Entscheidung. Unsere Produkte und unser System helfen dir dabei.

Tausende haben es schon geschafft – du bist als Nächstes dran.

DM mit 'CHANGE' 🚀

#Transformation #Vorher #Nachher #Gesundheit #LR`,
    platforms: ["instagram", "tiktok", "youtube"],
  },
];

// Blotato account IDs
const ACCOUNTS: Record<string, number> = {
  instagram: 5345,
  tiktok: 6683,
  youtube: 4089,
};

async function postToBlotato(content: string, videoUrl: string, platforms: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const platform of platforms) {
    const accountId = ACCOUNTS[platform];
    if (!accountId) continue;
    
    let target: any = { targetType: platform };
    if (platform === "youtube") {
      const title = content.split("\n")[0].replace(/[^\w\sÄÖÜäöüß!?.,]/g, "").trim().substring(0, 80);
      target = { targetType: "youtube", title, privacyStatus: "public", shouldNotifySubscribers: true };
    } else if (platform === "tiktok") {
      target = {
        targetType: "tiktok",
        privacyLevel: "PUBLIC_TO_EVERYONE",
        disabledComments: false,
        disabledDuet: false,
        disabledStitch: false,
        isBrandedContent: false,
        isYourBrand: false,
        isAiGenerated: true,
      };
    }
    
    const body = {
      post: {
        account: accountId,
        target,
        content,
        mediaUrls: [videoUrl],
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 60000).toISOString(), // 1 min from now
      },
    };
    
    try {
      const resp = await fetch("https://api.blotato.com/v2/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BLOTATO_KEY}`,
        },
        body: JSON.stringify(body),
      });
      
      if (resp.ok) {
        const data = await resp.json() as any;
        results[platform] = data.id || "ok";
        console.log(`   ✅ ${platform}: gepostet`);
      } else {
        const err = await resp.text();
        console.log(`   ❌ ${platform}: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${platform}: ${e.message}`);
    }
  }
  return results;
}

async function generateVideo(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/veo3.1", {
    input: { prompt, duration: "4s", aspect_ratio: "9:16", generate_audio: true },
  }) as any;
  return result.data?.video?.url || result.video?.url || "";
}

async function main() {
  console.log("📦 Trage 7 bestehende Posts ins Dashboard + Bibliothek ein...\n");
  
  for (const post of existingPosts) {
    // Insert into content_posts as published
    const [inserted] = await db.insert(contentPosts).values({
      createdById: ADMIN_ID,
      contentType: "video",
      content: post.content,
      platforms: post.platforms,
      status: "published",
      publishedAt: new Date(),
      videoUrl: post.videoUrl,
      mediaType: "video",
      topic: post.topic,
      pillar: post.pillar,
      sharedToLibrary: true,
      qualityScore: 85,
    }).$returningId();
    
    // Insert into content_library
    await db.insert(contentLibrary).values({
      title: post.topic,
      category: "video",
      pillar: post.pillar,
      textContent: post.content,
      videoUrl: post.videoUrl,
      platforms: post.platforms,
      tags: [post.pillar, post.topic, "referenz", "veo3.1"],
      createdById: ADMIN_ID,
      sourcePostId: inserted.id,
    });
    
    console.log(`✅ ${post.topic} → Dashboard + Bibliothek (ID: ${inserted.id})`);
  }
  
  console.log("\n🎬 Generiere 3 fehlende Videos mit Veo 3.1...\n");
  
  for (const post of remainingPosts) {
    console.log(`═══ ${post.topic} ═══`);
    try {
      console.log("   🎬 Video generieren...");
      const videoUrl = await generateVideo(post.videoPrompt);
      if (!videoUrl) {
        console.log("   ❌ Kein Video-URL zurück");
        continue;
      }
      console.log(`   ✅ Video: ${videoUrl}`);
      
      // Post to Blotato
      const blotatoIds = await postToBlotato(post.content, videoUrl, post.platforms);
      
      // Insert into content_posts
      const [inserted] = await db.insert(contentPosts).values({
        createdById: ADMIN_ID,
        contentType: "video",
        content: post.content,
        platforms: post.platforms,
        status: "published",
        publishedAt: new Date(),
        videoUrl: videoUrl,
        mediaType: "video",
        topic: post.topic,
        pillar: post.pillar,
        sharedToLibrary: true,
        qualityScore: 85,
        blotatoPostIds: Object.values(blotatoIds),
      }).$returningId();
      
      // Insert into content_library
      await db.insert(contentLibrary).values({
        title: post.topic,
        category: "video",
        pillar: post.pillar,
        textContent: post.content,
        videoUrl: videoUrl,
        platforms: post.platforms,
        tags: [post.pillar, post.topic, "referenz", "veo3.1"],
        createdById: ADMIN_ID,
        sourcePostId: inserted.id,
      });
      
      console.log(`   ✅ ${post.topic} → Dashboard + Bibliothek (ID: ${inserted.id})\n`);
    } catch (e: any) {
      console.log(`   ❌ Fehler: ${e.message}\n`);
    }
  }
  
  console.log("\n🎉 FERTIG! Alle Posts sind im Dashboard und in der Bibliothek sichtbar.");
  process.exit(0);
}

main().catch(console.error);
