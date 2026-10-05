const fs = require('fs');

const script = fs.readFileSync('scripts/nol_script_69.txt', 'utf8');

// The widget title is "오픈 예정", widgetId is "10411"
const widgetIdx = script.indexOf('"widgetTitle":"오픈 예정"');
console.log('widgetIdx:', widgetIdx);

// Let's find all items in this widget or items that have dateInfoList or productId and noticeId
// Let's write a regex or slice out the JSON block
const match = script.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)/s);
// Actually Next.js App Router uses streaming chunks: self.__next_f.push([1, "..."])
// Let's parse all JSON objects or extract the items array

// Let's find where "오픈 예정" section starts
let pos = script.indexOf('"오픈 예정"');
while (pos !== -1) {
  console.log('Found "오픈 예정" at', pos);
  pos = script.indexOf('"오픈 예정"', pos + 1);
}
