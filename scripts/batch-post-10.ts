/**
 * 10 Referenz-Posts mit Veo 3.1 Videos erstellen und sofort live posten
 * auf Instagram, Facebook, TikTok, YouTube
 */

import { fal } from "@fal-ai/client";
import { storagePut } from "../server/storage";

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY || "";
const FAL_API_KEY = process.env.FAL_API_KEY || "";
const BLOTATO_BASE = "https://backend.blotato.com/v2";

fal.config({ credentials: FAL_API_KEY });

// 10 Top-Themen für LR Lifestyle
const POSTS = [
  {
    topic: "Autokonzept",
    text: `Der Moment, wenn dein Firmenwagen vor der Tür steht. 🚗✨

Nicht irgendein Auto. Dein Traumauto. Bezahlt von LR.

Mercedes, BMW, Porsche — als Bonus für deine Leistung. Kein Leasing, kein Kredit. Einfach verdient.

Vor 2 Jahren dachte ich, das wäre unerreichbar. Heute fahre ich damit zur Arbeit. Jeden Tag.

Das Autokonzept von LR ist real. Und es wartet auf dich.

Kommentiere STARTEN für mehr Infos 🔥

#LRHealthBeauty #Autokonzept #Firmenwagen #NetworkMarketing #Erfolg`,
    videoPrompt: "Cinematic slow-motion shot of a sleek black Mercedes-AMG driving along a scenic coastal road at golden hour, sun reflecting off the car's polished surface, palm trees in background, luxury lifestyle atmosphere, 4K quality, no text no watermarks",
  },
  {
    topic: "Finanzielle Freiheit",
    text: `Was würdest du tun, wenn Geld keine Rolle mehr spielt? 💰

Nicht irgendwann. Jetzt.

Morgens aufwachen ohne Wecker. Arbeiten von wo du willst. Reisen wann du willst.

Das ist keine Fantasie. Das ist mein Alltag seit ich mit LR gestartet bin.

99 Euro. Das war mein Investment. Heute verdiene ich damit mein Einkommen.

40 Jahre am Markt. 32 Länder. Fresenius-geprüft.

DM mir INFO für die Details 💬

#FinanzielleFreiheit #Nebeneinkommen #LR #PassivesEinkommen #Business`,
    videoPrompt: "Aerial drone shot of a luxurious infinity pool overlooking the Mediterranean sea at sunset, person relaxing on a sun lounger with laptop, golden light, luxury villa in background, freedom and success atmosphere, cinematic 4K, no text no watermarks",
  },
  {
    topic: "Aloe Vera Produkte",
    text: `Wusstest du, dass 90% der Aloe Vera Produkte im Supermarkt fast keine echte Aloe Vera enthalten? 🌿

LR verwendet bis zu 90% reines Aloe Vera Gel. Fresenius-geprüft. Dermatest-zertifiziert.

Der Unterschied? Du spürst ihn sofort.

Seit über 40 Jahren setzt LR auf Qualität statt Marketing-Versprechen. Deswegen vertrauen Millionen Menschen weltweit auf unsere Produkte.

Schreib mir eine DM für eine kostenlose Beratung 🌱

#AloeVera #LRHealthBeauty #Fresenius #Naturkosmetik #Gesundheit`,
    videoPrompt: "Close-up macro shot of fresh aloe vera plant being cut open, revealing the pure gel inside, water droplets on green leaves, then transition to elegant beauty products on white marble surface, natural lighting, spa atmosphere, premium product photography style, 4K, no text no watermarks",
  },
  {
    topic: "KI Lina",
    text: `Mein Team hat eine eigene KI-Assistentin. Sie heißt Lina. 🤖

Was Lina für uns macht:
→ Social Media Content erstellen
→ Posts auf 9 Plattformen gleichzeitig posten
→ Leads automatisch ansprechen
→ Einwände professionell beantworten
→ Content-Kalender planen

Während andere stundenlang an einem Post sitzen, erstellt Lina in 30 Sekunden Text + Bild + Hashtags.

Kein anderes Network Marketing Team hat das. Wir schon.

Kommentiere LINA für mehr Infos 🚀

#KI #ArtificialIntelligence #NetworkMarketing #LR #Automatisierung`,
    videoPrompt: "Futuristic holographic AI assistant interface floating in a modern minimalist office, blue and cyan glowing particles, person interacting with holographic screens showing social media analytics and content, sci-fi meets real world, cinematic lighting, 4K, no text no watermarks",
  },
  {
    topic: "Teamwork",
    text: `Alleine bist du schnell. Zusammen sind wir unschlagbar. 💪

Unser LR Lifestyle Team wächst jeden Monat. Nicht weil wir die besten Verkäufer sind. Sondern weil wir die beste Unterstützung bieten.

→ Starterwebinare jeden Dienstag
→ Produktschulungen jeden Donnerstag
→ KI-Assistentin Lina für jeden Partner
→ Persönliches Mentoring
→ Automatisierte Lead-Generierung

Du musst das Rad nicht neu erfinden. Du musst nur starten.

Link in Bio für alle Details 🔗

#Teamwork #LRLifestyle #Erfolg #Zusammenhalt #NetworkMarketing`,
    videoPrompt: "Group of diverse happy professionals celebrating success together in a modern bright co-working space, high-fiving, laughing, team spirit, confetti falling, warm golden lighting, motivational atmosphere, cinematic 4K, no text no watermarks",
  },
  {
    topic: "Mallorca Lifestyle",
    text: `Montag, 10 Uhr. Ich sitze auf meiner Terrasse auf Mallorca. ☀️

Laptop auf, Kaffee in der Hand, Meerblick vor mir.

Kein Büro. Kein Chef. Kein Stau.

Vor 3 Jahren lebte ich noch in Deutschland und träumte davon. Heute ist es mein Alltag.

LR hat mir die Freiheit gegeben, von überall zu arbeiten. Mit Lina und unserem System läuft alles automatisiert.

Willst du wissen wie? DM mir FREIHEIT 🌴

#Mallorca #DigitalNomad #Freiheit #LR #Lifestyle #Ortsunabhängig`,
    videoPrompt: "Person sitting on a beautiful Mediterranean terrace with laptop, overlooking turquoise sea in Mallorca, morning coffee, palm trees, white architecture, bougainvillea flowers, peaceful productive morning routine, warm sunlight, cinematic 4K drone pullback shot, no text no watermarks",
  },
  {
    topic: "Nebeneinkommen",
    text: `500 Euro extra im Monat. Was würde das für dich ändern? 💶

→ Endlich den Urlaub buchen
→ Die Rechnungen ohne Stress bezahlen
→ Etwas zur Seite legen
→ Dir und deiner Familie etwas gönnen

Mit LR kannst du dir neben deinem Job ein zweites Standbein aufbauen. 30 Minuten am Tag reichen.

Der Start kostet 99 Euro. Früher waren es 1.200 Euro.

Kein Risiko. Kein Druck. Nur eine Chance.

Kommentiere CHANCE und ich schicke dir alle Infos 📩

#Nebeneinkommen #Zusatzverdienst #LR #Business #Chance`,
    videoPrompt: "Split screen style cinematic shot: left side shows person stressed at office desk with bills, right side transforms into same person happy and relaxed at home with family, warm lighting, life transformation concept, emotional storytelling, 4K quality, no text no watermarks",
  },
  {
    topic: "Mind Master",
    text: `Stress, Müdigkeit, keine Energie? Kenne ich. 😴

Bis ich Mind Master entdeckt habe.

Das Nahrungsergänzungsmittel von LR mit Aloe Vera, Traubenkernextrakt und wichtigen Vitaminen. Fresenius-geprüft.

Seit 3 Monaten nehme ich es täglich. Der Unterschied?
→ Mehr Fokus
→ Mehr Energie
→ Besserer Schlaf

Keine Wunderpille. Aber ein echtes Upgrade für deinen Alltag.

Link in Bio für alle Details 🧠

#MindMaster #LR #Gesundheit #Energie #Fokus #AloeVera`,
    videoPrompt: "Elegant product showcase: green health drink being poured into a glass in slow motion, fresh fruits and aloe vera plants around it, morning sunlight streaming through window, healthy lifestyle kitchen setting, premium commercial quality, 4K, no text no watermarks",
  },
  {
    topic: "Events & Community",
    text: `18. April. Business Day Düsseldorf. 🎤

Tausende Unternehmer. Ein Ziel. Gemeinsam wachsen.

Das ist kein normales Event. Das ist der Moment wo du Menschen triffst, die genauso denken wie du.

→ Top-Speaker auf der Bühne
→ Erfolgsgeschichten live
→ Networking mit den Besten
→ Motivation für den Rest des Jahres

Wer dabei ist, weiß warum. Wer nicht dabei war, bereut es.

Dieses Mal gibt es KEINE Aufzeichnung. Nur live.

Hol dir deine Karte! DM mir EVENT 🎟️

#BusinessDay #LR #Düsseldorf #Event #Networking #Erfolg`,
    videoPrompt: "Energetic business conference atmosphere, large modern venue with dramatic stage lighting, crowd of motivated entrepreneurs applauding, speaker on stage with big screens, confetti moment, professional event photography style, dynamic camera movements, cinematic 4K, no text no watermarks",
  },
  {
    topic: "Transformation",
    text: `Vor 3 Jahren: Dachdecker aus Schwerin. Heute: Unternehmer auf Mallorca. 🏗️→🌴

Mein Weg:
Schwerin → Hannover → Mallorca

Kein reicher Papa. Kein Studium. Keine Connections.

Nur eine Entscheidung: Ich will mehr vom Leben.

99 Euro in LR investiert. Den Rest hat harte Arbeit gemacht. Und ein System das funktioniert.

Heute habe ich ein Team, eine KI-Assistentin und die Freiheit zu leben wo ich will.

Deine Transformation beginnt mit einer Entscheidung.

Kommentiere STARTEN 🔥

#Transformation #VorherNachher #LR #Erfolgsgeschichte #Motivation`,
    videoPrompt: "Cinematic transformation montage: starting with grey industrial rooftop work scene, dramatic transition through clouds to reveal beautiful Mediterranean villa with pool, person walking confidently towards camera in business casual outfit, golden hour lighting, inspiring life change narrative, 4K quality, no text no watermarks",
  },
];

// Plattformen auf denen gepostet wird
const TARGET_PLATFORMS = ["instagram", "tiktok", "youtube", "facebook"];

async function generateVideo(prompt: string, index: number): Promise<string> {
  console.log(`\n[${index + 1}/10] 🎬 Generiere Veo 3.1 Video...`);
  
  const input: any = {
    prompt,
    duration: "4s",
    aspect_ratio: "9:16",
    generate_audio: true,
  };
  
  const result = await fal.subscribe("fal-ai/veo3.1", { input }) as { data: { video: { url: string } } };
  const tempUrl = result.data?.video?.url || "";
  
  if (!tempUrl) {
    throw new Error("Veo 3.1 hat kein Video generiert");
  }
  
  // Auf S3 speichern
  const vidRes = await fetch(tempUrl);
  const vidBuffer = Buffer.from(await vidRes.arrayBuffer());
  const suffix = Math.random().toString(36).substring(2, 8);
  const { url: permanentUrl } = await storagePut(
    `reference-videos/${Date.now()}-${suffix}.mp4`,
    vidBuffer,
    "video/mp4"
  );
  
  console.log(`[${index + 1}/10] ✅ Video gespeichert: ${permanentUrl}`);
  return permanentUrl;
}

function buildPlatformTarget(platform: string, text: string): Record<string, any> {
  switch (platform) {
    case "youtube":
      return {
        targetType: "youtube",
        title: text.substring(0, 100).split("\n")[0] || "Neues Video",
        privacyStatus: "public",
        shouldNotifySubscribers: true,
        containsSyntheticMedia: true,
      };
    case "tiktok":
      return {
        targetType: "tiktok",
        privacyLevel: "PUBLIC_TO_EVERYONE",
        disabledComments: false,
        disabledDuet: false,
        disabledStitch: false,
        isBrandedContent: false,
        isYourBrand: false,
        isAiGenerated: true,
      };
    case "facebook":
      return { targetType: "facebook" };
    case "instagram":
      return { targetType: "instagram" };
    default:
      return { targetType: platform };
  }
}

async function callBlotato(endpoint: string, method: string = "GET", body?: unknown) {
  const headers: Record<string, string> = {
    "blotato-api-key": BLOTATO_API_KEY,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BLOTATO_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Blotato ${res.status}: ${errText}`);
  }
  return res.json();
}

async function postToBlotato(text: string, platform: string, accountId: number, videoUrl: string) {
  // Sofort posten = 2 Minuten in der Zukunft
  const now = new Date(Date.now() + 2 * 60 * 1000);
  const scheduledTime = now.toISOString();
  
  const target = buildPlatformTarget(platform, text);
  
  const postData = {
    post: {
      accountId: String(accountId),
      content: {
        text,
        mediaUrls: [videoUrl],
        platform,
      },
      target,
    },
    useNextFreeSlot: false,
    scheduledTime,
  };
  
  const result = await callBlotato("/posts", "POST", postData);
  return (result as any)?.postSubmissionId || "unknown";
}

async function main() {
  console.log("🚀 Starte 10 Referenz-Posts mit Veo 3.1 Videos...\n");
  console.log(`Blotato API Key: ${BLOTATO_API_KEY ? "✅ vorhanden" : "❌ FEHLT"}`);
  console.log(`FAL API Key: ${FAL_API_KEY ? "✅ vorhanden" : "❌ FEHLT"}\n`);
  
  // Blotato Accounts holen
  const accountsData = await callBlotato("/users/me/accounts");
  const accounts = (accountsData as any)?.items || [];
  console.log(`📱 ${accounts.length} Blotato Accounts gefunden:`);
  for (const a of accounts) {
    console.log(`   - ${a.platform}: ${a.username || a.fullname} (ID: ${a.id})`);
  }
  console.log("");
  
  const results: { topic: string; videoUrl: string; platforms: string[]; success: boolean }[] = [];
  
  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    console.log(`\n${"═".repeat(60)}`);
    console.log(`📝 Post ${i + 1}/10: ${post.topic}`);
    console.log(`${"═".repeat(60)}`);
    
    try {
      // 1. Video generieren
      const videoUrl = await generateVideo(post.videoPrompt, i);
      
      // 2. Auf allen Plattformen posten
      const postedPlatforms: string[] = [];
      for (const platform of TARGET_PLATFORMS) {
        const account = accounts.find((a: any) => a.platform.toLowerCase() === platform.toLowerCase());
        if (!account) {
          console.log(`   ⚠️ Kein ${platform} Account gefunden, überspringe...`);
          continue;
        }
        
        try {
          const postId = await postToBlotato(post.text, platform, account.id, videoUrl);
          console.log(`   ✅ ${platform}: gepostet (ID: ${postId})`);
          postedPlatforms.push(platform);
          // Kurze Pause zwischen Posts
          await new Promise(r => setTimeout(r, 1000));
        } catch (err: any) {
          console.error(`   ❌ ${platform}: ${err.message}`);
        }
      }
      
      results.push({ topic: post.topic, videoUrl, platforms: postedPlatforms, success: true });
    } catch (err: any) {
      console.error(`   ❌ Video-Generierung fehlgeschlagen: ${err.message}`);
      results.push({ topic: post.topic, videoUrl: "", platforms: [], success: false });
    }
  }
  
  // Zusammenfassung
  console.log(`\n\n${"═".repeat(60)}`);
  console.log("📊 ZUSAMMENFASSUNG");
  console.log(`${"═".repeat(60)}`);
  const successful = results.filter(r => r.success);
  console.log(`✅ Erfolgreich: ${successful.length}/10`);
  console.log(`❌ Fehlgeschlagen: ${results.length - successful.length}/10\n`);
  
  for (const r of results) {
    const status = r.success ? "✅" : "❌";
    console.log(`${status} ${r.topic}: ${r.platforms.join(", ") || "keine Plattform"}`);
    if (r.videoUrl) console.log(`   Video: ${r.videoUrl}`);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
