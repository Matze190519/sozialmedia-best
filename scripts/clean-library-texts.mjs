/**
 * Script: Bibliothek-Texte bereinigen
 * Entfernt Varianten-Formatierung und behält nur den echten Post-Text
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Alle Bibliothek-Einträge holen
const [items] = await conn.execute('SELECT id, textContent FROM content_library WHERE textContent IS NOT NULL');
console.log(`Bereinige ${items.length} Bibliothek-Einträge...`);

let cleaned = 0;
for (const item of items) {
  const original = item.textContent;
  let text = original;
  
  // Varianten-Header entfernen: "---\nVARIANTE 1:\n📝 POST-TEXT:"
  // Extrahiere den eigentlichen Post-Text nach "POST-TEXT:" oder "📝"
  
  // Muster 1: "VARIANTE X: ... POST-TEXT: [text]"
  const postTextMatch = text.match(/POST-TEXT:\s*([\s\S]*?)(?:\n\n(?:VARIANTE|REEL|STORY|CAROUSEL|---)|$)/i);
  if (postTextMatch) {
    text = postTextMatch[1].trim();
  } else {
    // Muster 2: Alles nach "---" und Varianten-Label entfernen
    // Entferne Zeilen die mit "---", "VARIANTE", "REEL", "STORY", "CAROUSEL", "HOOK", "SLIDE" beginnen
    const lines = text.split('\n');
    const cleanLines = [];
    let inPostText = false;
    let skipSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip-Marker
      if (trimmed === '---' || 
          trimmed.match(/^(VARIANTE|REEL \d|STORY \d|CAROUSEL|🎬|📱|📝 POST-TEXT:|POST-TEXT:)/i)) {
        if (trimmed.match(/POST-TEXT:/i)) {
          inPostText = true;
          skipSection = false;
        } else {
          inPostText = false;
          skipSection = true;
        }
        continue;
      }
      
      if (skipSection && trimmed === '') {
        skipSection = false;
        continue;
      }
      
      if (!skipSection) {
        cleanLines.push(line);
      }
    }
    
    const cleaned_text = cleanLines.join('\n').trim();
    if (cleaned_text.length > 20) {
      text = cleaned_text;
    }
  }
  
  // Führende/nachfolgende Leerzeilen entfernen
  text = text.replace(/^\n+/, '').replace(/\n+$/, '').trim();
  
  // Nur updaten wenn sich was geändert hat
  if (text !== original && text.length > 20) {
    await conn.execute('UPDATE content_library SET textContent = ? WHERE id = ?', [text, item.id]);
    cleaned++;
    if (cleaned <= 3) {
      console.log(`\nID ${item.id} bereinigt:`);
      console.log('Vorher:', original.substring(0, 80));
      console.log('Nachher:', text.substring(0, 80));
    }
  }
}

console.log(`\n✅ ${cleaned} von ${items.length} Einträgen bereinigt.`);

// Auch content_posts bereinigen
const [posts] = await conn.execute('SELECT id, content, editedContent FROM content_posts WHERE content LIKE "%VARIANTE%"');
console.log(`\nBereinige ${posts.length} Posts mit Varianten-Text...`);

let postsCleaned = 0;
for (const post of posts) {
  const text = post.editedContent || post.content;
  const postTextMatch = text.match(/POST-TEXT:\s*([\s\S]*?)(?:\n\n(?:VARIANTE|REEL|STORY|CAROUSEL|---)|$)/i);
  if (postTextMatch) {
    const cleanText = postTextMatch[1].trim();
    if (cleanText.length > 20) {
      await conn.execute('UPDATE content_posts SET content = ?, editedContent = ? WHERE id = ?', 
        [cleanText, cleanText, post.id]);
      postsCleaned++;
    }
  }
}

console.log(`✅ ${postsCleaned} Posts bereinigt.`);
await conn.end();
console.log('\nFertig!');
