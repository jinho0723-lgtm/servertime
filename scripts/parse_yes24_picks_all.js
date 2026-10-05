const fs = require('fs');

const slice = fs.readFileSync('scripts/yes24_picks_section.html', 'utf8');

const regex = /<a href='\/Perf\/(\d+)[^']*'[^>]*title='([^']*)'[^>]*>[\s\S]*?data-src='([^']+)'[\s\S]*?<p class='list-2-tit1'>([^<]*)<\/p>[\s\S]*?<p class='list-2-tit2'>([^<]*)<\/p>/g;

let m;
const items = [];
while ((m = regex.exec(slice)) !== null) {
  let img = m[3];
  if (img.includes('/dims/')) img = img.split('/dims/')[0];
  items.push({
    id: m[1],
    fullTitle: m[2],
    title: m[4].trim(),
    venue: m[5].trim(),
    img: img,
    url: `http://ticket.yes24.com/Perf/${m[1]}`
  });
}

console.log('Yes24 Picks found:', items.length);
items.forEach((it, idx) => {
  console.log(`${idx + 1}. [${it.id}] ${it.title} | ${it.venue} | ${it.img}`);
});
fs.writeFileSync('scripts/yes24_picks_extracted.json', JSON.stringify(items, null, 2));
