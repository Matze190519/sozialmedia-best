/**
 * Script: Posts ohne Bild aus der Datenbank löschen
 * Ausführen mit: node scripts/delete-no-image-posts.mjs
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL nicht gesetzt!');
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// Erst zählen wie viele betroffen sind
const [countResult] = await conn.execute(
  `SELECT COUNT(*) as count FROM content_posts WHERE (mediaUrl IS NULL OR mediaUrl = '') AND (videoUrl IS NULL OR videoUrl = '')`
);
const count = countResult[0].count;
console.log(`Posts ohne Bild/Video: ${count}`);

if (count > 0) {
  // Löschen
  const [deleteResult] = await conn.execute(
    `DELETE FROM content_posts WHERE (mediaUrl IS NULL OR mediaUrl = '') AND (videoUrl IS NULL OR videoUrl = '')`
  );
  console.log(`Gelöscht: ${deleteResult.affectedRows} Posts`);
} else {
  console.log('Keine Posts ohne Bild gefunden.');
}

// Auch Approval-Logs für gelöschte Posts aufräumen
await conn.execute(
  `DELETE FROM approval_logs WHERE post_id NOT IN (SELECT id FROM content_posts)`
);
console.log('Approval-Logs aufgeräumt.');

await conn.end();
console.log('Fertig!');
