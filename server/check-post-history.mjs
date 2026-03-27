/**
 * Prüfe was mit dem Post passiert ist - History, Published Posts etc.
 */

const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY;
const BASE = "https://backend.blotato.com/v2";

async function callBlotato(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "blotato-api-key": BLOTATO_API_KEY },
  });
  console.log(`${endpoint} → Status: ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.log(text); return null; }
}

async function main() {
  // 1. Schedules (sollte leer sein)
  console.log("=== Geplante Posts (Schedules) ===");
  const schedules = await callBlotato("/schedules?limit=5");
  console.log(`Count: ${schedules?.count || 0}`);
  
  // 2. Prüfe ob es einen "posts" oder "history" Endpoint gibt
  console.log("\n=== Veröffentlichte Posts ===");
  const posts = await callBlotato("/posts?limit=5");
  if (posts) console.log(JSON.stringify(posts, null, 2).substring(0, 500));
  
  // 3. Post-Submissions prüfen
  console.log("\n=== Post Submissions ===");
  const submissions = await callBlotato("/post-submissions?limit=5");
  if (submissions) console.log(JSON.stringify(submissions, null, 2).substring(0, 500));
  
  // 4. Spezifischen Post prüfen
  console.log("\n=== Post 605993 direkt ===");
  const post = await callBlotato("/schedules/605993");
  if (post) console.log(JSON.stringify(post, null, 2).substring(0, 500));
  
  // 5. Account-Info für Instagram
  console.log("\n=== Instagram Account Info ===");
  const account = await callBlotato("/users/me/accounts");
  const igAccount = account?.items?.find(a => a.platform === "instagram");
  console.log(`Instagram: ${igAccount?.username} (ID: ${igAccount?.id})`);
  
  // 6. Prüfe ob der Post vielleicht als "draft" existiert
  console.log("\n=== Drafts ===");
  const drafts = await callBlotato("/drafts?limit=5");
  if (drafts) console.log(JSON.stringify(drafts, null, 2).substring(0, 500));
  
  // 7. Activity/History
  console.log("\n=== Activity ===");
  const activity = await callBlotato("/activity?limit=5");
  if (activity) console.log(JSON.stringify(activity, null, 2).substring(0, 500));
  
  // 8. Published posts
  console.log("\n=== Published ===");
  const published = await callBlotato("/published?limit=5");
  if (published) console.log(JSON.stringify(published, null, 2).substring(0, 500));
}

main().catch(console.error);
