import https from 'https';

const TOKEN = 'bp_bak_0JrsLy9xuwOrJinDMZwYxOXbymwyQ7oguOhh';
const BOT_ID = 'cac882a1-cf8f-4b8f-9740-8f96ea9558db';
const TABLE_ID = 'table_01JTKAZKTK0P69PRWZ3PMEYDR9';

async function fetchRows(offset = 0, limit = 100) {
  return new Promise((resolve, reject) => {
    const url = `https://api.botpress.cloud/v1/tables/${TABLE_ID}/rows/find`;
    const body = JSON.stringify({ offset, limit });
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${TOKEN}`,
        'x-bot-id': BOT_ID,
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(body)),
      }
    };
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Fetching products from Botpress...');
  
  let allRows = [];
  let offset = 0;
  while (true) {
    const result = await fetchRows(offset, 100);
    if (result.rows && result.rows.length > 0) {
      allRows = allRows.concat(result.rows);
      console.log(`Fetched ${allRows.length} rows...`);
      if (result.rows.length < 100) break;
      offset += 100;
    } else break;
  }
  
  console.log(`Total rows: ${allRows.length}`);
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  const { default: mysql } = await import('mysql2/promise');
  const connection = await mysql.createConnection(dbUrl);
  
  // Clear existing
  await connection.execute('DELETE FROM lr_products');
  console.log('Cleared existing products');
  
  // Insert products
  let inserted = 0;
  for (const row of allRows) {
    if (!row.Image) continue;
    const price = row.Price ? String(Math.round(row.Price * 100) / 100) : null;
    await connection.execute(
      'INSERT INTO lr_products (name, category, price, imageUrl, description, descriptionWA, whatsappText) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        row.Name || 'Unbekannt',
        row.Categories || 'Sonstige',
        price,
        row.Image,
        row.Beschreibung_kurz || null,
        row.Beschreibung_kurz_wa || null,
        row.WhatsApp_Text || null,
      ]
    );
    inserted++;
  }
  
  console.log(`Imported ${inserted} products!`);
  
  // Show categories
  const [cats] = await connection.execute('SELECT DISTINCT category, COUNT(*) as cnt FROM lr_products GROUP BY category ORDER BY cnt DESC');
  console.log('\nCategories:');
  for (const cat of cats) {
    console.log(`  ${cat.category}: ${cat.cnt}`);
  }
  
  await connection.end();
}

main().catch(console.error);
