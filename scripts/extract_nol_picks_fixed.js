const fs = require('fs');

const raw = fs.readFileSync('scripts/nol_picks_section.html', 'utf8');

// In raw, notice:
// \"thumbnail\":\"([^\"]+)\"
// \"title\":\"([^\"]+)\"
// \"locationDetails\":\[\"([^\"]*)\"\]
// \"dateInfo\":\"([^\"]+)\"

// Notice in the snippet:
// \"thumbnail\":\"https://...\",\"title\":\"...\",\"locationDetails\":[\"...\"],\"dateInfo\":\"...\"
// Backslashes! The string is escaped with backslashes!
// Let's unescape or use regex with optional backslash: \\?\"

const regex = /\\"thumbnail\\":\\"([^"\\]+)\\",\\"title\\":\\"([^"\\]+)\\",\\"locationDetails\\":\[\\"([^"\\]*)\\"\],\\"dateInfo\\":\\"([^"\\]+)\\"/g;

let m;
const items = [];
while ((m = regex.exec(raw)) !== null) {
  items.push({
    thumbnail: m[1],
    title: m[2],
    venue: m[3],
    dateInfo: m[4]
  });
}

console.log('Matches with escaped regex:', items.length);
if (items.length === 0) {
  // Let's try JSON unescaping or flexible regex
  const parts = raw.split(/\\"type\\":\\"PRODUCT_ITEM\\"/);
  console.log('Parts count:', parts.length);
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    const titM = p.match(/\\"title\\":\\"([^"\\]+)\\"/);
    const thumbM = p.match(/\\"thumbnail\\":\\"([^"\\]+)\\"/);
    const dateM = p.match(/\\"dateInfo\\":\\"([^"\\]+)\\"/);
    const venM = p.match(/\\"locationDetails\\":\[\\"([^"\\]*)\\"\]/);
    const idM = p.match(/\\"productId\\":\\"([^:\\]+)/);
    
    if (titM) {
      items.push({
        id: idM ? idM[1] : null,
        title: titM[1],
        thumbnail: thumbM ? thumbM[1] : null,
        dateInfo: dateM ? dateM[1] : null,
        venue: venM ? venM[1] : null
      });
    }
  }
  console.log('Parsed via parts:', items.length);
}

items.forEach((it, idx) => console.log(`${idx + 1}. [${it.id}] ${it.title} (${it.venue})`));
fs.writeFileSync('scripts/nol_picks_extracted.json', JSON.stringify(items, null, 2));
