const fs = require('fs');

const html = fs.readFileSync('scripts/yes24_picks.html', 'utf8');

const idx = html.indexOf('PICKS');
console.log('PICKS idx:', idx);

const slice = html.slice(idx - 100, idx + 8000);
fs.writeFileSync('scripts/yes24_picks_section.html', slice);
console.log('Snippet:');
console.log(slice.slice(0, 1500));
