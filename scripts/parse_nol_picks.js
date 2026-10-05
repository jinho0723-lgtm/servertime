const fs = require('fs');

const html = fs.readFileSync('scripts/nol_genre_concert.html', 'utf8');

// Match all links with aria-label
const regex = /href="https:\/\/nol\.yanolja\.com\/ticket\/(?:places\/\d+\/)?products\/(\d+)"\s+aria-label="([^"]+)"/g;
let m;
const items = [];
while ((m = regex.exec(html)) !== null) {
  const prodId = m[1];
  const label = m[2];
  
  // Find image URL around this block
  const slice = html.slice(m.index, m.index + 1200);
  const imgM = slice.match(/src="([^"]+)"/);
  const img = imgM ? imgM[1] : `https://ticketimage.interpark.com/Play/image/large/${prodId.slice(0, 2)}/${prodId}_p.gif`;

  items.push({
    prodId,
    label,
    img
  });
}

console.log('Total NOL items matched:', items.length);
items.slice(0, 15).forEach((it, idx) => console.log(`${idx + 1}. [${it.prodId}] ${it.label} -> ${it.img}`));
fs.writeFileSync('scripts/nol_picks_parsed.json', JSON.stringify(items, null, 2));
