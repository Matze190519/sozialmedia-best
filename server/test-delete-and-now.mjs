/**
 * 1. Test-Post löschen
 * 2. Prüfen ob Blotato "sofort posten" kann (scheduledTime = jetzt)
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BASE = "https://backend.blotato.com/v2";

async function callBlotato(endpoint, method = "GET", body = null) {
  const opts = {
    method,
    headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${endpoint}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; } 
  catch { return { status: res.status, data: text }; }
}

async function main() {
  // 1. Test-Post 605993 löschen
  console.log("🗑️ Lösche Test-Post 605993...");
  const del = await callBlotato("/schedules/605993", "DELETE");
  console.log(`Delete Status: ${del.status}`);
  if (del.status === 204) console.log("✅ Gelöscht!");
  
  // 2. Alle 30 alten geplanten Posts auflisten
  console.log("\n📋 Alle geplanten Posts:");
  const schedules = await callBlotato("/schedules?limit=50");
  const items = schedules.data?.items || [];
  console.log(`Anzahl: ${schedules.data?.count || items.length}`);
  
  // Die 5 Posts die der User freigegeben hat suchen
  for (const item of items.slice(0, 10)) {
    console.log(`  ID: ${item.id} | ${item.draft?.content?.platform} | ${item.scheduledAt} | ${item.draft?.content?.text?.substring(0, 60)}...`);
  }
  
  // 3. Testen ob "sofort posten" geht (scheduledTime = 1 Minute in der Zukunft)
  console.log("\n🧪 Test: Sofort-Post (1 Min in Zukunft)...");
  const now = new Date(Date.now() + 60 * 1000).toISOString(); // 1 Minute
  const testPost = await callBlotato("/posts", "POST", {
    post: {
      accountId: "5345",
      content: {
        text: "⚡ Sofort-Test - wird gleich gelöscht",
        mediaUrls: [],
        platform: "instagram",
      },
      target: { targetType: "instagram" },
    },
    useNextFreeSlot: false,
    scheduledTime: now,
  });
  console.log(`Sofort-Post Status: ${testPost.status}`);
  console.log(`Response:`, JSON.stringify(testPost.data, null, 2));
  
  if (testPost.status === 201) {
    console.log("✅ Sofort-Post funktioniert!");
    // Warten und Schedule-ID finden zum Löschen
    await new Promise(r => setTimeout(r, 3000));
    const sch = await callBlotato("/schedules?limit=3");
    const match = sch.data?.items?.find(i => i.draft?.content?.text?.includes("Sofort-Test"));
    if (match) {
      console.log(`Schedule ID: ${match.id} - lösche...`);
      await callBlotato(`/schedules/${match.id}`, "DELETE");
      console.log("✅ Sofort-Test gelöscht!");
    }
  }
  
  // 4. Testen ob scheduledTime in der Vergangenheit geht (= sofort posten)
  console.log("\n🧪 Test: scheduledTime in Vergangenheit...");
  const past = new Date(Date.now() - 60 * 1000).toISOString(); // 1 Minute in Vergangenheit
  const pastPost = await callBlotato("/posts", "POST", {
    post: {
      accountId: "5345",
      content: {
        text: "⚡ Vergangenheits-Test - wird gleich gelöscht",
        mediaUrls: [],
        platform: "instagram",
      },
      target: { targetType: "instagram" },
    },
    useNextFreeSlot: false,
    scheduledTime: past,
  });
  console.log(`Vergangenheits-Post Status: ${pastPost.status}`);
  console.log(`Response:`, JSON.stringify(pastPost.data, null, 2));
  
  if (pastPost.status === 201) {
    await new Promise(r => setTimeout(r, 3000));
    const sch2 = await callBlotato("/schedules?limit=3");
    const match2 = sch2.data?.items?.find(i => i.draft?.content?.text?.includes("Vergangenheits-Test"));
    if (match2) {
      console.log(`Schedule ID: ${match2.id} - lösche...`);
      await callBlotato(`/schedules/${match2.id}`, "DELETE");
      console.log("✅ Vergangenheits-Test gelöscht!");
    } else {
      console.log("Post nicht in Schedules gefunden - wurde evtl. sofort gepostet!");
    }
  }
}

main().catch(console.error);
