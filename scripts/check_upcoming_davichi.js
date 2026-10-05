const fs = require('fs');

const text = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');

// Search for DAVICHI
const idx = text.indexOf('DAVICHI');
console.log('DAVICHI idx:', idx);
console.log(text.slice(Math.max(0, idx - 300), idx + 500));
