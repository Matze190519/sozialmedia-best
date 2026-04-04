/**
 * Upload 3 remaining videos to S3 via storagePut and post to Blotato
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);
dotenv.config({ path: path.resolve(__dirname2, "../.env") });

import { storagePut } from "../server/storage";

const BLOTATO_KEY = process.env.BLOTATO_API_KEY!;

const ACCOUNTS: Record<string, number> = {
  instagram: 5345,
  tiktok: 6683,
  youtube: 4089,
};

const posts = [
  {
    topic: "Mind Master",
    falUrl: "https://v3b.fal.media/files/b/0a94e860/OgqVzAgoogM8Po4_2q-bC_05f30b6cebe24055afeec95be722ad95.mp4",
    content: `Stress, Müdigkeit, Konzentrationsprobleme? 🧠

Mind Master ist die Antwort. Anti-Stress-Getränk mit Aloe Vera, Traubenkernextrakt und grünem Tee.

Wissenschaftlich entwickelt, um deinen Körper zu unterstützen.

Probier es selbst – DM für mehr Infos 💪

#MindMaster #AntiStress #Gesundheit #LR #Energie`,
  },
  {
    topic: "Events & Community",
    falUrl: "https://v3b.fal.media/files/b/0a94e864/b9bUjA5VkzJ-Q11vhaYkT_8ac9d1dfe2b344c1be5523b13094d471.mp4",
    content: `Die Energie auf unseren Events ist unbeschreiblich! 🔥

Hunderte motivierte Menschen mit dem gleichen Ziel: Mehr aus ihrem Leben machen.

18. April Business Day Düsseldorf. Bist du dabei?

DM mit 'EVENT' für Tickets 🎫

#BusinessDay #Event #Motivation #Community #LR`,
  },
  {
    topic: "Transformation",
    falUrl: "https://v3b.fal.media/files/b/0a94e869/WCnk_EAabB4iVBIDSLMFr_c6d9284d329b4455af84f2ce7e5b5710.mp4",
    content: `Vorher: Müde, gestresst, unzufrieden. Nachher: Energiegeladen, frei, erfolgreich. 💫

Die Transformation beginnt mit einer Entscheidung. Unsere Produkte und unser System helfen dir.

Tausende haben es geschafft. Du bist als Nächstes dran.

DM mit 'CHANGE' 🚀

#Transformation #Vorher #Nachher #Gesundheit #LR`,
  },
];

async function uploadToS3(falUrl: string, topic: string): Promise<string> {
  console.log("   📥 Download von fal.ai...");
  const resp = await fetch(falUrl);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  console.log(`   📦 ${(buffer.length / 1024 / 1024).toFixed(1)} MB heruntergeladen`);
  
  const key = `reference-videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
  console.log("   📤 Upload auf S3...");
  const { url } = await storagePut(key, buffer, "video/mp4");
  return url;
}

async function postToBlotato(content: string, videoUrl: string) {
  const platforms = ["instagram", "tiktok", "youtube"];
  
  for (const platform of platforms) {
    const accountId = ACCOUNTS[platform];
    
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
        scheduledAt: new Date(Date.now() + 60000).toISOString(),
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
        console.log(`   ✅ ${platform}: gepostet`);
      } else {
        const err = await resp.text();
        console.log(`   ❌ ${platform}: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${platform}: ${e.message}`);
    }
  }
}

async function main() {
  console.log("🔄 Lade 3 Videos auf S3 hoch und poste auf Blotato...\n");
  
  for (const post of posts) {
    console.log(`═══ ${post.topic} ═══`);
    const s3Url = await uploadToS3(post.falUrl, post.topic);
    console.log(`   ✅ S3: ${s3Url}`);
    await postToBlotato(post.content, s3Url);
    console.log();
  }
  
  console.log("🎉 FERTIG!");
  process.exit(0);
}

main().catch(console.error);
