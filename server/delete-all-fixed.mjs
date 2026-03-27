/**
 * Alle geplanten Posts bei Blotato löschen - OHNE Content-Type bei DELETE
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BASE = "https://backend.blotato.com/v2";

async function main() {
  console.log("🗑️ Lade alle geplanten Posts...");
  
  const res = await fetch(`${BASE}/schedules?limit=100`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  const data = await res.json();
  const items = data?.items || [];
  
  console.log(`Gefunden: ${items.length} geplante Posts\n`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const item of items) {
    const platform = item.draft?.content?.platform || "?";
    const scheduled = item.scheduledAt || "?";
    
    process.stdout.write(`  Lösche #${item.id} (${platform}, ${scheduled})... `);
    
    // KEIN Content-Type bei DELETE!
    const delRes = await fetch(`${BASE}/schedules/${item.id}`, {
      method: "DELETE",
      headers: { "blotato-api-key": BLOTATO_API_KEY },
    });
    
    if (delRes.status === 204) {
      console.log("✅");
      deleted++;
    } else {
      const errText = await delRes.text();
      console.log(`❌ Status ${delRes.status}: ${errText}`);
      failed++;
    }
    
    // Rate limit beachten
    await new Promise(r => setTimeout(r, 500));
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
