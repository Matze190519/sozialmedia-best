import { drizzle } from "drizzle-orm/mysql2";
import { contentPosts, products } from "../drizzle/schema.js";
import { desc, like } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Get latest 10 posts
  console.log("=== LATEST 10 POSTS ===");
  const posts = await db.select({ 
    id: contentPosts.id, 
    title: contentPosts.title, 
    videoUrl: contentPosts.videoUrl,
    imageUrl: contentPosts.imageUrl 
  }).from(contentPosts).orderBy(desc(contentPosts.createdAt)).limit(10);
  
  for (const p of posts) { 
    console.log(`${p.id} | ${p.title} | VIDEO: ${p.videoUrl ? p.videoUrl.substring(0, 80) : 'NONE'} | IMG: ${p.imageUrl ? p.imageUrl.substring(0, 80) : 'NONE'}`); 
  }

  // Get Mind Master product image
  console.log("\n=== MIND MASTER PRODUKT ===");
  const mindMaster = await db.select({
    id: products.id,
    name: products.name,
    imageUrl: products.imageUrl
  }).from(products).where(like(products.name, '%Mind Master%'));
  for (const p of mindMaster) {
    console.log(`${p.id} | ${p.name} | ${p.imageUrl}`);
  }

  process.exit(0);
}
main();
