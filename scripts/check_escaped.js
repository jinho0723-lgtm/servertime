const fs = require('fs');

const script = fs.readFileSync('scripts/nol_script_69.txt', 'utf8');

// The string might be escaped like \"오픈 예정\" or unicode escaped \uC624\uD508...
console.log('Includes DAVICHI:', script.includes('DAVICHI'));
const davichiIdx = script.indexOf('DAVICHI');
console.log('Context before DAVICHI:');
console.log(script.slice(Math.max(0, davichiIdx - 2000), davichiIdx));
