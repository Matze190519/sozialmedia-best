/**
 * Direkter Blotato Post-Test - sendet einen echten Post an Instagram
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
if (!BLOTATO_API_KEY) { console.error("BLOTATO_API_KEY fehlt!"); process.exit(1); }

const BASE = "https://backend.blotato.com/v2";

async function main() {
  // Instagram Account ID: 5345 (lr_lifestyleteam)
  const postData = {
    post: {
      accountId: "5345",
      content: {
        text: "Test vom LR Content Hub - wird gleich gelöscht",
        mediaUrls: [],
        platform: "instagram",
      },
      target: {
        targetType: "instagram",
      },
    },
    useNextFreeSlot: true,
  };
  
  console.log("Sende Post an Blotato...");
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
  console.log(`Response Headers:`, Object.fromEntries(res.headers.entries()));
  
  const text = await res.text();
  console.log(`\nResponse Body:`);
  try { 
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
    
    if (json.id || json.schedule?.id) {
      const scheduleId = json.id || json.schedule?.id;
      console.log(`\n✅ Post erfolgreich geplant! Schedule ID: ${scheduleId}`);
      
      // Sofort löschen (Test-Post)
      console.log("\nLösche Test-Post...");
      const delRes = await fetch(`${BASE}/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: { "blotato-api-key": BLOTATO_API_KEY },
      });
      console.log(`Delete Status: ${delRes.status}`);
    } else {
      console.log("\n❌ Post NICHT geplant - prüfe Response");
    }
  } catch { 
    console.log(text); 
  }
}

main().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
