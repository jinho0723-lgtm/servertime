const fs = require('fs');

const html = fs.readFileSync('scripts/melon_csoon.html', 'utf8');

// Search for 'csoon' in html
let pos = 0;
const results = [];
while ((pos = html.indexOf('csoon', pos)) !== -1) {
  results.push(html.slice(Math.max(0, pos - 100), pos + 200));
  pos += 5;
}
console.log('Occurrences of csoon:', results.length);
results.slice(0, 5).forEach((r, i) => console.log(`[${i+1}]\n`, r));
