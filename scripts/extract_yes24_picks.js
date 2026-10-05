const fs = require('fs');

const html = fs.readFileSync('scripts/yes24_picks.html', 'utf8');

// Search for YES24's PICKS block
const idx = html.indexOf("YES24's PICKS");
console.log('YES24\'s PICKS idx:', idx);

const slice = html.slice(idx, idx + 8000);
fs.writeFileSync('scripts/yes24_picks_section.html', slice);

// Match products:
// In Yes24:
// <a href="/Perf/..." or <a href="/Notice/..."
// <p class="tit"> or <div class="goods-info">...
// Let's inspect the slice
console.log('Slice snippet:');
console.log(slice.slice(0, 1500));
