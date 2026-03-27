/**
 * Alle geplanten Posts bei Blotato löschen
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
  return res.status;
}

async function main() {
  console.log("🗑️ Lade alle geplanten Posts...");
  
  const res = await fetch(`${BASE}/schedules?limit=100`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  const data = await res.json();
  const items = data?.items || [];
  
  console.log(`Gefunden: ${items.length} geplante Posts`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const item of items) {
    const platform = item.draft?.content?.platform || "?";
    const text = item.draft?.content?.text?.substring(0, 50) || "?";
    const scheduled = item.scheduledAt || "?";
    
    process.stdout.write(`  Lösche #${item.id} (${platform}, ${scheduled})... `);
    const status = await callBlotato(`/schedules/${item.id}`, "DELETE");
    
    if (status === 204) {
      console.log("✅");
      deleted++;
    } else {
      console.log(`❌ Status ${status}`);
      failed++;
    }
    
    // Rate limit beachten (30 req/min)
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Prüfen ob noch welche übrig sind (Pagination)
  if (data?.cursor) {
    console.log("\n📋 Prüfe ob noch mehr Posts da sind...");
    const res2 = await fetch(`${BASE}/schedules?limit=100&cursor=${data.cursor}`, {
      headers: { "blotato-api-key": BLOTATO_API_KEY },
    });
    const data2 = await res2.json();
    const items2 = data2?.items || [];
    
    for (const item of items2) {
      process.stdout.write(`  Lösche #${item.id}... `);
      const status = await callBlotato(`/schedules/${item.id}`, "DELETE");
      if (status === 204) { console.log("✅"); deleted++; }
      else { console.log(`❌ Status ${status}`); failed++; }
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\n🎉 Fertig! ${deleted} gelöscht, ${failed} fehlgeschlagen`);
  
  // Verifizieren
  const verify = await fetch(`${BASE}/schedules?limit=5`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  const verifyData = await verify.json();
  console.log(`Verbleibend: ${verifyData?.count || verifyData?.items?.length || 0} Posts`);
}

main().catch(console.error);
