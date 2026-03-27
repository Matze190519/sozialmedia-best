/**
 * End-to-End Test: Echten Post mit Bild an Blotato/Instagram senden
 * Nutzt den gefixten scheduleOnBlotato Code (konkreter Zeitpunkt)
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const FAL_API_KEY = process.env.FAL_API_KEY;
if (!BLOTATO_API_KEY) { console.error("BLOTATO_API_KEY fehlt!"); process.exit(1); }
if (!FAL_API_KEY) { console.error("FAL_API_KEY fehlt!"); process.exit(1); }

const BASE = "https://backend.blotato.com/v2";

async function generateImage() {
  console.log("📸 Generiere Premium-Bild mit Nano Banana Pro...");
  
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: FAL_API_KEY });
  
  const result = await fal.subscribe("fal-ai/nano-banana-pro", {
    input: {
      prompt: "Successful young entrepreneur standing on luxury yacht deck, Mediterranean sea, golden hour sunset, wearing casual elegant white linen shirt, confident relaxed pose, cinematic photography, ultra realistic, no text, no words, no letters, no watermark",
      image_size: { width: 1080, height: 1080 },
      num_images: 1,
      output_format: "png",
    },
  });
  
  const imageUrl = result.data?.images?.[0]?.url;
  console.log(`✅ Bild generiert: ${imageUrl}`);
  return imageUrl;
}

async function postToBlotato(text, mediaUrls) {
  // 2 Stunden in der Zukunft (damit genug Zeit zum Prüfen/Löschen ist)
  const scheduledTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  
  const postData = {
    post: {
      accountId: "5345", // lr_lifestyleteam Instagram
      content: {
        text,
        mediaUrls: mediaUrls || [],
        platform: "instagram",
      },
      target: {
        targetType: "instagram",
      },
    },
    useNextFreeSlot: false,
    scheduledTime,
  };
  
  console.log(`\n📤 Sende Post an Blotato (geplant für ${scheduledTime})...`);
  
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: { 
      "blotato-api-key": BLOTATO_API_KEY, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(postData),
  });
  
  console.log(`Response Status: ${res.status}`);
  const data = await res.json();
  console.log(`Response:`, JSON.stringify(data, null, 2));
  
  if (res.status === 201) {
    console.log(`\n✅ POST ERFOLGREICH AN BLOTATO GESENDET!`);
    console.log(`postSubmissionId: ${data.postSubmissionId}`);
    
    // Schedule-ID holen
    await new Promise(r => setTimeout(r, 3000));
    const schRes = await fetch(`${BASE}/schedules?limit=3`, {
      headers: { "blotato-api-key": BLOTATO_API_KEY },
    });
    const schData = await schRes.json();
    const match = schData.items?.find(i => 
      i.draft?.content?.text?.substring(0, 40) === text.substring(0, 40)
    );
    if (match) {
      console.log(`Schedule ID: ${match.id}`);
      console.log(`Geplant für: ${match.scheduledAt}`);
      console.log(`Account: ${match.account?.username}`);
      console.log(`\n⚠️ Post ist GEPLANT und wird in 2 Stunden gepostet!`);
      console.log(`Du kannst ihn in Blotato sehen und dort löschen falls nötig.`);
      return match.id;
    }
  } else {
    console.log(`\n❌ FEHLER: ${JSON.stringify(data)}`);
  }
  return null;
}

async function main() {
  try {
    // 1. Bild generieren
    const imageUrl = await generateImage();
    if (!imageUrl) { console.error("Bild-Generierung fehlgeschlagen!"); return; }
    
    // 2. Post-Text (deutsch, max 5 Hashtags)
    const text = `Stell dir vor, du wachst morgens auf und entscheidest selbst, wie dein Tag aussieht.\n\nKein Wecker. Kein Chef. Keine Grenzen.\n\nDas ist kein Traum – das ist die Realität von Menschen, die sich für einen anderen Weg entschieden haben.\n\nMit LR Health & Beauty hast du die Chance, dir genau dieses Leben aufzubauen. Schritt für Schritt. In deinem Tempo.\n\n#FinanzielleFreiheit #LRLifestyle #Nebeneinkommen #Erfolg #Freiheit`;
    
    // 3. An Blotato senden
    const scheduleId = await postToBlotato(text, [imageUrl]);
    
    if (scheduleId) {
      console.log(`\n🎉 END-TO-END TEST ERFOLGREICH!`);
      console.log(`Post mit Bild wurde an Blotato gesendet und ist geplant.`);
      console.log(`Schedule ID: ${scheduleId}`);
    }
  } catch (err) {
    console.error("Fehler:", err);
  }
}

main();
