const fs = require('fs');

const html = fs.readFileSync('scripts/melon_csoon.html', 'utf8');

// Match all cont blocks containing detail.htm?csoonId=...
// Example:
// <a href="./detail.htm?csoonId=12964" class="thumb_160x225">
//    <span class="img"><img ... src="..."></span>
// </a>
// ... <p class="tit">...</p>
// ... <p class="date">...</p>

const blocks = html.matchAll(/<div class="[^"]*cont[^"]*">([\s\S]*?)<\/div>/gi);
const items = [];

for (const m of blocks) {
  const content = m[1];
  const idM = content.match(/csoonId=(\d+)/);
  if (!idM) continue;
  
  const id = idM[1];
  const imgM = content.match(/src="([^"]+)"/);
  const titM = content.match(/<p class="tit"[^>]*>([\s\S]*?)<\/p>/i) || content.match(/title="([^"]+)"/);
  const dateM = content.match(/<p class="date"[^>]*>([\s\S]*?)<\/p>/i) || content.match(/<span class="date"[^>]*>([\s\S]*?)<\/span>/i);
  
  const title = titM ? titM[1].replace(/<[^>]+>/g, '').trim() : '';
  const date = dateM ? dateM[1].replace(/<[^>]+>/g, '').trim() : '';
  const img = imgM ? imgM[1] : '';
  
  items.push({ id, title, date, img });
}

console.log('Melon items found:', items.length);
items.forEach(it => {
  console.log(`[ID: ${it.id}] ${it.title} | ${it.date} | ${it.img}`);
});
fs.writeFileSync('scripts/melon_parsed.json', JSON.stringify(items, null, 2));
