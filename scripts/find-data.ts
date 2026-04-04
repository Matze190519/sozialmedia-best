import { drizzle } from "drizzle-orm/mysql2";
import { like, desc } from "drizzle-orm";
import { lrProducts, contentPosts } from "../drizzle/schema.js";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log("=== MIND MASTER PRODUKTE ===");
  const prods = await db.select({
    name: lrProducts.name, 
    imageUrl: lrProducts.imageUrl, 
    category: lrProducts.category
  }).from(lrProducts).where(like(lrProducts.name, '%Mind%'));
  for (const p of prods) {
    console.log(`${p.name} | ${p.category} | ${p.imageUrl}`);
  }

  console.log("\n=== ALOE VERA PRODUKTE ===");
  const aloe = await db.select({
    name: lrProducts.name, 
    imageUrl: lrProducts.imageUrl
  }).from(lrProducts).where(like(lrProducts.name, '%Aloe%')).limit(5);
  for (const p of aloe) {
    console.log(`${p.name} | ${p.imageUrl}`);
  }

  console.log("\n=== LETZTE 15 POSTS ===");
  const posts = await db.select().from(contentPosts).orderBy(desc(contentPosts.createdAt)).limit(15);
  
  for (const p of posts) { 
    console.log(`ID:${p.id} | ${(p as any).title || p.content?.substring(0,40)} | Status:${p.status} | Video:${p.videoUrl ? p.videoUrl.substring(0,60) : 'NO'} | Media:${p.mediaUrl ? p.mediaUrl.substring(0,60) : 'NO'}`);
  }

  console.log("\n=== PRODUKT-KATEGORIEN ===");
  const cats = await db.selectDistinct({ category: lrProducts.category }).from(lrProducts);
  for (const c of cats) {
    console.log(c.category);
  }

  process.exit(0);
}
main();
