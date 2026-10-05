const fs = require('fs');

const text = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');

// In upcoming page, let's find all products / items
// Notice keys: "productId":"...", "noticeId":"...", "title":"...", "thumbnail":"...", "dateInfo":"..."
// Or action: {"web":"https://nol.yanolja.com/ticket/products/..."}

// Let's use regex to find all item blocks or parse them
const itemRegex = /\{"prices":\[\],"id":"(\d+)",[\s\S]*?"title":"(.*?)","dateInfo":"(.*?)",[\s\S]*?"noticeId":"(\d+)"[\s\S]*?\}/g;

const items = [];
// Better regex: match each product object
const prodMatches = text.matchAll(/\{"prices":\[\],"id":"(\d+)",(.*?)"noticeId":"(\d+)"(.*?\})/g);

let count = 0;
for (const m of prodMatches) {
  count++;
  const fullObjStr = m[0];
  // extract fields
  const id = m[1];
  const titleM = fullObjStr.match(/"title":"(.*?)"/);
  const dateInfoM = fullObjStr.match(/"dateInfo":"(.*?)"/);
  const thumbM = fullObjStr.match(/"thumbnail":"(.*?)"/);
  const dateInfoListM = fullObjStr.match(/"dateInfoList":(\[.*?\])/);
  const noticeId = m[3];
  
  items.push({
    id,
    noticeId,
    title: titleM ? titleM[1] : '',
    dateInfo: dateInfoM ? dateInfoM[1] : '',
    dateInfoList: dateInfoListM ? JSON.parse(dateInfoListM[1]) : [],
    thumbnail: thumbM ? thumbM[1] : ''
  });
}

console.log('Total items matched:', items.length);
console.log('Sample items:');
items.slice(0, 10).forEach(it => console.log(it));
fs.writeFileSync('scripts/nol_parsed_upcoming.json', JSON.stringify(items, null, 2));
