const fs = require('fs');

const html = fs.readFileSync('scripts/nol_picks_section.html', 'utf8');

// Match each item block:
// \"title\":\"(.*?)\",\"locationDetails\":\[\"(.*?)\"\],\"dateInfo\":\"(.*?)\"
const itemRegex = /"thumbnail":"([^"]+)","title":"([^"]+)","locationDetails":\["([^"]*)"\],"dateInfo":"([^"]+)"/g;
let m;
const items = [];
while ((m = itemRegex.exec(html)) !== null) {
  items.push({
    thumbnail: m[1],
    title: m[2],
    venue: m[3],
    dateInfo: m[4]
  });
}

console.log('NOL Pick items count:', items.length);
items.forEach((it, idx) => {
  console.log(`${idx + 1}. ${it.title} | ${it.venue} | ${it.dateInfo}`);
});
fs.writeFileSync('scripts/nol_picks_extracted.json', JSON.stringify(items, null, 2));
