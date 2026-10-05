const fs = require('fs');

const html = fs.readFileSync('scripts/melon_main.html', 'utf8');

// Search for 멜론티켓 PICK
const idx = html.indexOf('멜론티켓 PICK');
console.log('멜론티켓 PICK idx:', idx);

const slice = html.slice(idx, idx + 10000);
fs.writeFileSync('scripts/melon_picks_section.html', slice);

// Match items:
// <a href="/performance/index.htm?prodId=..."
// <p class="tit"> or title="..."
// <span class="img"><img src="..."
const regex = /href="\/performance\/index\.htm\?prodId=(\d+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<p class="tit"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<p class="date"[^>]*>([\s\S]*?)<\/p>/gi;

let m;
const items = [];
while ((m = regex.exec(slice)) !== null) {
  let img = m[2];
  if (img.includes('/melon/resize/')) img = img.split('/melon/resize/')[0];
  items.push({
    prodId: m[1],
    title: m[3].replace(/<[^>]+>/g, '').trim(),
    img: img,
    date: m[4].replace(/<[^>]+>/g, '').trim(),
    url: `https://ticket.melon.com/performance/index.htm?prodId=${m[1]}`
  });
}

console.log('Melon Picks found:', items.length);
if (items.length === 0) {
  // Let's inspect slice snippet
  console.log('Slice snippet:');
  console.log(slice.slice(0, 1500));
} else {
  items.forEach((it, idx) => console.log(`${idx + 1}. [${it.prodId}] ${it.title} | ${it.date}`));
}
fs.writeFileSync('scripts/melon_picks_extracted.json', JSON.stringify(items, null, 2));
