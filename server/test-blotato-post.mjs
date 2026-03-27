/**
 * Direkter Blotato Post-Test - prüft ob Posts wirklich ankommen
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
if (!BLOTATO_API_KEY) { console.error("BLOTATO_API_KEY fehlt!"); process.exit(1); }

const BASE = "https://backend.blotato.com/v2";

// Test 1: Accounts abrufen mit blotato-api-key Header (wie unser Code)
async function testWithBlotatoHeader() {
  console.log("=== TEST 1: blotato-api-key Header ===");
  const res = await fetch(`${BASE}/users/me/accounts`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
  });
  console.log(`Status: ${res.status}`);
  const text = await res.text();
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)); } catch { console.log(text); }
  return res.status;
}

// Test 2: Accounts abrufen mit Authorization Bearer Header
async function testWithBearerHeader() {
  console.log("\n=== TEST 2: Authorization Bearer Header ===");
  const res = await fetch(`${BASE}/users/me/accounts`, {
    headers: { "Authorization": `Bearer ${BLOTATO_API_KEY}`, "Content-Type": "application/json" },
  });
  console.log(`Status: ${res.status}`);
  const text = await res.text();
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)); } catch { console.log(text); }
  return res.status;
}

// Test 3: Scheduled Posts mit blotato-api-key
async function testSchedulesWithBlotatoHeader() {
  console.log("\n=== TEST 3: Schedules mit blotato-api-key ===");
  const res = await fetch(`${BASE}/schedules?limit=3`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
  });
  console.log(`Status: ${res.status}`);
  const text = await res.text();
  try { 
    const json = JSON.parse(text);
    console.log(`Count: ${json.count}, Items: ${json.items?.length}`);
  } catch { console.log(text); }
}

// Test 4: Einen echten Test-Post an Instagram senden
async function testPostToInstagram() {
  console.log("\n=== TEST 4: Echten Post an Instagram senden ===");
  
  // Erst Accounts holen um die richtige Instagram Account-ID zu finden
  const accRes = await fetch(`${BASE}/schedules?limit=1`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
  });
  const accData = await accRes.json();
  
  // Instagram Account-ID aus einem bestehenden Post extrahieren
  const igPost = accData?.items?.find(i => i.draft?.content?.platform === "instagram");
  if (!igPost) {
    console.log("Kein Instagram-Post gefunden in Schedules");
    
    // Versuche accounts endpoint
    const accRes2 = await fetch(`${BASE}/users/me/accounts`, {
      headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
    });
    const accData2 = await accRes2.json();
    console.log("Accounts Response:", JSON.stringify(accData2, null, 2));
    return;
  }
  
  const igAccountId = igPost.account?.id;
  console.log(`Instagram Account ID: ${igAccountId} (${igPost.account?.username})`);
  
  // Test-Post senden
  const postData = {
    post: {
      accountId: igAccountId,
      content: {
        text: "🔥 Test-Post vom LR Content Hub - wird gleich gelöscht!",
        mediaUrls: [],
        platform: "instagram",
      },
      target: {
        targetType: "instagram",
      },
    },
    useNextFreeSlot: true,
  };
  
  console.log("\nSende Post-Daten:", JSON.stringify(postData, null, 2));
  
  const postRes = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: { "blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  
  console.log(`\nPost Response Status: ${postRes.status}`);
  const postText = await postRes.text();
  try { console.log(JSON.stringify(JSON.parse(postText), null, 2)); } catch { console.log(postText); }
}

async function main() {
  const s1 = await testWithBlotatoHeader();
  const s2 = await testWithBearerHeader();
  await testSchedulesWithBlotatoHeader();
  
  if (s1 === 200 || s2 === 200) {
    // Nur posten wenn mindestens ein Auth-Header funktioniert
    await testPostToInstagram();
  } else {
    console.log("\n⚠️ Kein Auth-Header funktioniert für /users/me/accounts - prüfe API Key");
  }
}

main().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
