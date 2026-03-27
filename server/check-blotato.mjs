/**
 * Prüft den Status der Posts bei Blotato - warum landen sie nicht bei Instagram?
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
if (!BLOTATO_API_KEY) { console.error("BLOTATO_API_KEY fehlt!"); process.exit(1); }

const BASE = "https://backend.blotato.com/v2";

async function callBlotato(endpoint, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${BLOTATO_API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${endpoint}`, opts);
  const text = await res.text();
  console.log(`\n[${method} ${endpoint}] Status: ${res.status}`);
  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
    return json;
  } catch {
    console.log(text);
    return text;
  }
}

async function main() {
  // 1. Alle geplanten Posts abrufen
  console.log("=== BLOTATO SCHEDULED POSTS ===");
  await callBlotato("/schedules?page=1&limit=20");

  // 2. Accounts prüfen
  console.log("\n=== BLOTATO ACCOUNTS ===");
  await callBlotato("/accounts");

  // 3. Einen der Post-IDs direkt prüfen
  const postIds = [
    "instagram-1774646618579",
    "instagram-1774646629534",
    "instagram-1774646635070",
    "instagram-1774646647868",
    "instagram-1774646650531",
  ];
  
  for (const pid of postIds) {
    console.log(`\n=== POST ${pid} ===`);
    await callBlotato(`/schedules/${pid}`);
  }
}

main().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
