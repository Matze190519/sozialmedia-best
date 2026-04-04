import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __f = fileURLToPath(import.meta.url);
const __d = path.dirname(__f);
dotenv.config({ path: path.resolve(__d, "../.env") });

const key = process.env.BLOTATO_API_KEY!;
console.log("Key exists:", !!key, "length:", key?.length);

const videoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029098351/UJZxdmp3sY63YUqiVd8uaj/reference-videos/1775309990474-2bewvc.mp4";

const body = {
  post: {
    account: 5345,
    target: { targetType: "instagram" },
    content: "Stress, Müdigkeit, Konzentrationsprobleme? 🧠 Mind Master ist die Antwort. DM für mehr Infos 💪 #MindMaster #LR #Gesundheit #AntiStress #Energie",
    mediaUrls: [videoUrl],
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 120000).toISOString(),
  },
};

console.log("Posting to Blotato...");
console.log("URL:", videoUrl);
console.log("scheduledAt:", body.post.scheduledAt);

try {
  const resp = await fetch("https://api.blotato.com/v2/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  console.log("Status:", resp.status);
  const text = await resp.text();
  console.log("Response:", text);
} catch (e: any) {
  console.log("FETCH ERROR:", e.message);
  console.log("Full error:", e);
}

process.exit(0);
