/**
 * Debug: Was gibt Blotato bei DELETE zurück?
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BASE = "https://backend.blotato.com/v2";

async function main() {
  // Versuche mit verschiedenen Methoden zu löschen
  const testId = "605993";
  
  // 1. DELETE mit blotato-api-key
  console.log("=== DELETE mit blotato-api-key ===");
  let res = await fetch(`${BASE}/schedules/${testId}`, {
    method: "DELETE",
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  console.log(`Status: ${res.status}`);
  const text1 = await res.text();
  console.log(`Body: ${text1}`);
  
  // 2. DELETE mit Content-Type
  console.log("\n=== DELETE mit Content-Type ===");
  res = await fetch(`${BASE}/schedules/${testId}`, {
    method: "DELETE",
    headers: { 
      "blotato-api-key": BLOTATO_API_KEY,
      "Content-Type": "application/json",
    },
  });
  console.log(`Status: ${res.status}`);
  const text2 = await res.text();
  console.log(`Body: ${text2}`);
  
  // 3. DELETE mit Authorization Bearer
  console.log("\n=== DELETE mit Authorization Bearer ===");
  res = await fetch(`${BASE}/schedules/${testId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${BLOTATO_API_KEY}` },
  });
  console.log(`Status: ${res.status}`);
  const text3 = await res.text();
  console.log(`Body: ${text3}`);

  // 4. Vielleicht ist der Endpoint anders? Versuche /posts/:id statt /schedules/:id
  console.log("\n=== DELETE /posts/:id ===");
  res = await fetch(`${BASE}/posts/${testId}`, {
    method: "DELETE",
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  console.log(`Status: ${res.status}`);
  const text4 = await res.text();
  console.log(`Body: ${text4}`);
}

main().catch(console.error);
