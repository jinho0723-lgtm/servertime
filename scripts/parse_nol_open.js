const fs = require('fs');

const html = fs.readFileSync('scripts/nol_ticket.html', 'utf8');

// Notice "widgetTitle\":\"오픈 예정\"
// Let's find all items that have "widgetTitle\":\"오픈 예정\" or belong to widgetId 10411
// In the JSON chunks, let's extract all item objects

// Notice the pattern:
// \"id\":\"26014056\", ... \"title\":\"2026 DAVICHI CONCERT...\", \"dateInfo\":\"내일 18:00\", \"dateInfoList\":[...], \"noticeId\":\"15420\"

// Let's write an unescaper for the Next.js chunk string
// Next.js chunks are: self.__next_f.push([1,"..."])
const pushes = [];
const pushRegex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
let m;
while ((m = pushRegex.exec(html)) !== null) {
  try {
    // Unescape the string
    const raw = JSON.parse(`"${m[1]}"`);
    pushes.push(raw);
  } catch (e) {
    // raw might have unescaped quotes or whatever
  }
}

const fullText = pushes.join('');
console.log('fullText length:', fullText.length);

// Let's find "오픈 예정" in fullText
let startIdx = fullText.indexOf('"title":"오픈 예정"');
if (startIdx === -1) startIdx = fullText.indexOf('오픈 예정');
console.log('startIdx in fullText:', startIdx);

if (startIdx !== -1) {
  const snippet = fullText.slice(startIdx, startIdx + 15000);
  fs.writeFileSync('scripts/nol_open_snippet.txt', snippet);
  console.log('Saved snippet, length:', snippet.length);
}
