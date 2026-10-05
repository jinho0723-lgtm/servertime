const fs = require('fs');

const script = fs.readFileSync('scripts/nol_script_69.txt', 'utf8');

// Find where DAVICHI appears
const idx = script.indexOf('DAVICHI');
console.log('DAVICHI index:', idx);
console.log('Snippet around DAVICHI:');
console.log(script.slice(Math.max(0, idx - 400), idx + 800));
