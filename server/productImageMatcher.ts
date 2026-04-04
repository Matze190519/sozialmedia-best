/**
 * Product Image Matcher - Automatisch echte LR-Produktbilder verwenden
 * 
 * Wenn ein Content-Topic ein LR-Produkt enthält, wird automatisch das echte
 * Produktbild aus der Datenbank (226 Bilder) verwendet statt ein KI-Bild zu generieren.
 * 
 * Nur für Lifestyle/Motivation-Content ohne spezifisches Produkt wird KI-Bild generiert.
 */

import * as db from "./db";

// Bekannte LR-Produktnamen und -Kategorien für Matching
const LR_PRODUCT_KEYWORDS = [
  // Hauptprodukte
  "aloe vera", "mind master", "zeitgard", "colostrum", "5in1",
  "protein power", "lr lifetakt", "lr health", "lr beauty",
  "super omega", "pro balance", "heart active", "reishi plus",
  "cistus incanus", "fiber boost", "pro 12", "woman phytoactiv",
  "man phytoactiv", "vita aktiv", "freedom plus",
  // Körperpflege
  "body care", "körperpflege", "shampoo", "duschgel", "creme",
  "lotion", "serum", "peeling", "maske", "gesichtspflege",
  // Parfum
  "parfum", "eau de parfum", "guido maria", "bruce willis",
  "emma heming", "karolina kurkova",
  // Sets
  "starterpaket", "starter set", "profi set", "kennenlern",
  "autokonzept set", "business set",
  // Zeitgard
  "zeitgard", "anti-age", "anti age", "nanogold",
  // Getränke
  "drinking gel", "trinkgel", "aloe vera gel",
  // Nahrungsergänzung
  "nahrungsergänzung", "supplement", "vitamin", "mineral",
];

/**
 * Prüft ob ein Topic/Text ein LR-Produkt referenziert.
 * Gibt den erkannten Produktnamen zurück oder null.
 */
export function detectProductInTopic(topic: string): string | null {
  const topicLower = topic.toLowerCase();
  
  for (const keyword of LR_PRODUCT_KEYWORDS) {
    if (topicLower.includes(keyword)) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * Sucht ein passendes Produktbild aus der Datenbank.
 * Gibt die Bild-URL zurück oder null wenn kein Produkt gefunden.
 */
export async function findProductImage(topic: string): Promise<{
  imageUrl: string;
  productName: string;
  category: string;
} | null> {
  const productKeyword = detectProductInTopic(topic);
  if (!productKeyword) return null;
  
  try {
    // Suche in der Produktdatenbank
    const products = await db.getLRProducts({ search: productKeyword, limit: 5 });
    
    if (products.length === 0) {
      // Fallback: Breitere Suche mit einzelnen Wörtern
      const words = productKeyword.split(" ");
      for (const word of words) {
        if (word.length >= 3) {
          const fallbackProducts = await db.getLRProducts({ search: word, limit: 5 });
          if (fallbackProducts.length > 0) {
            const product = fallbackProducts[0];
            console.log(`[ProductMatcher] Produkt gefunden (Fallback): ${product.name} → ${product.imageUrl.substring(0, 60)}...`);
            return {
              imageUrl: product.imageUrl,
              productName: product.name,
              category: product.category,
            };
          }
        }
      }
      return null;
    }
    
    // Bestes Match nehmen (erstes Ergebnis)
    const product = products[0];
    console.log(`[ProductMatcher] Produkt gefunden: ${product.name} → ${product.imageUrl.substring(0, 60)}...`);
    return {
      imageUrl: product.imageUrl,
      productName: product.name,
      category: product.category,
    };
  } catch (err) {
    console.error("[ProductMatcher] Fehler bei Produktsuche:", err);
    return null;
  }
}

/**
 * Entscheidet ob ein echtes Produktbild oder ein KI-Bild verwendet werden soll.
 * 
 * Logik:
 * 1. Wenn Topic ein LR-Produkt enthält → echtes Produktbild aus DB
 * 2. Wenn Pillar "Produkt-Highlight" ist → echtes Produktbild suchen
 * 3. Sonst → KI-Bild generieren (Lifestyle, Motivation, Business)
 */
export async function getImageForContent(
  topic: string,
  pillar?: string,
): Promise<{
  type: "product" | "ai";
  imageUrl?: string;
  productName?: string;
  reason: string;
}> {
  // 1. Direkte Produkterkennung im Topic
  const productMatch = await findProductImage(topic);
  if (productMatch) {
    return {
      type: "product",
      imageUrl: productMatch.imageUrl,
      productName: productMatch.productName,
      reason: `Echtes Produktbild: ${productMatch.productName} (${productMatch.category})`,
    };
  }
  
  // 2. Pillar-basierte Erkennung
  if (pillar && pillar.toLowerCase().includes("produkt")) {
    // Versuche aus dem Topic ein Produkt zu finden
    const pillarMatch = await findProductImage(topic);
    if (pillarMatch) {
      return {
        type: "product",
        imageUrl: pillarMatch.imageUrl,
        productName: pillarMatch.productName,
        reason: `Produktbild für Pillar "${pillar}": ${pillarMatch.productName}`,
      };
    }
  }
  
  // 3. Kein Produkt erkannt → KI-Bild
  return {
    type: "ai",
    reason: "Kein LR-Produkt erkannt → KI-Bild wird generiert",
  };
}
