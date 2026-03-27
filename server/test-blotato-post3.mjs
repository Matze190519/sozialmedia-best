/**
 * Blotato Post-Test mit konkretem Zeitpunkt (nicht useNextFreeSlot)
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
if (!BLOTATO_API_KEY) { console.error("BLOTATO_API_KEY fehlt!"); process.exit(1); }

const BASE = "https://backend.blotato.com/v2";

async function main() {
  // Zeitpunkt: 5 Minuten in der Zukunft
  const scheduledTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 Stunde
  
  const postData = {
    post: {
      accountId: "5345",
      content: {
        text: "🔥 Test vom LR Content Hub - wird sofort gelöscht!\n\n#test #lrlifestyle #delete",
        mediaUrls: [],
        platform: "instagram",
      },
      target: {
        targetType: "instagram",
      },
    },
    useNextFreeSlot: false,
    scheduledTime: scheduledTime,
  };
  
  console.log(`Sende Post an Blotato mit Zeitpunkt: ${scheduledTime}`);
  console.log("Post-Daten:", JSON.stringify(postData, null, 2));
  
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: { 
      "blotato-api-key": BLOTATO_API_KEY, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(postData),
  });
  
  console.log(`\nResponse Status: ${res.status}`);
  const text = await res.text();
  console.log(`Response Body:`);
  try { 
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
    
    // Suche nach der Schedule-ID in der Response
    const scheduleId = json.id || json.schedule?.id || json.scheduleId;
    if (scheduleId) {
      console.log(`\n✅ Post erfolgreich geplant! Schedule ID: ${scheduleId}`);
      
      // Sofort löschen
      console.log("\nLösche Test-Post...");
      const delRes = await fetch(`${BASE}/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: { "blotato-api-key": BLOTATO_API_KEY },
      });
      console.log(`Delete Status: ${delRes.status}`);
      if (delRes.ok) {
        console.log("✅ Test-Post gelöscht!");
      }
    } else {
      console.log("\n❌ Keine Schedule-ID in Response gefunden");
      
      // Prüfe ob der Post trotzdem in den Schedules ist
      console.log("\nPrüfe Schedules...");
      const schRes = await fetch(`${BASE}/schedules?limit=3`, {
        headers: { "blotato-api-key": BLOTATO_API_KEY },
      });
      const schData = await schRes.json();
      const testPost = schData.items?.find(i => i.draft?.content?.text?.includes("Test vom LR Content Hub"));
      if (testPost) {
        console.log(`✅ Post gefunden in Schedules! ID: ${testPost.id}`);
        // Löschen
        const delRes = await fetch(`${BASE}/schedules/${testPost.id}`, {
          method: "DELETE",
          headers: { "blotato-api-key": BLOTATO_API_KEY },
        });
        console.log(`Delete Status: ${delRes.status}`);
      }
    }
  } catch { 
    console.log(text); 
  }
}

main().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
