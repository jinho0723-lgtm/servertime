const fs = require('fs');

const slice = fs.readFileSync('scripts/melon_picks_section.html', 'utf8');

// Pattern:
// <a href="/performance/index.htm?prodId=(\d+)" class="inner">
//   <span class="thumb"><img src="([^"]+)"
//   <strong class="tit">([^<]+)</strong> <span class="day">([^<]+)</span>
//   <span class="location">([^<]+)</span>

const regex = /href="\/performance\/index\.htm\?prodId=(\d+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<strong class="tit">([\s\S]*?)<\/strong>\s*<span class="day">([\s\S]*?)<\/span>\s*<span class="location">([\s\S]*?)<\/span>/gi;

let m;
const items = [];
while ((m = regex.exec(slice)) !== null) {
  let img = m[2];
  if (img.includes('/melon/strip/')) img = img.split('/melon/strip/')[0];
  items.push({
    prodId: m[1],
    title: m[3].replace(/<[^>]+>/g, '').trim(),
    img: img,
    date: m[4].replace(/<[^>]+>/g, '').trim(),
    venue: m[5].replace(/<[^>]+>/g, '').trim(),
    url: `https://ticket.melon.com/performance/index.htm?prodId=${m[1]}`
  });
}

console.log('Melon Picks parsed count:', items.length);
items.forEach((it, idx) => console.log(`${idx + 1}. [${it.prodId}] ${it.title} | ${it.venue} | ${it.date}`));
fs.writeFileSync('scripts/melon_picks_extracted.json', JSON.stringify(items, null, 2));
