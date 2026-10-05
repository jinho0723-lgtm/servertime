const fs = require('fs');

const text = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');

// Find all occurrences of "venue_name"
let idx = 0;
const results = [];
while ((idx = text.indexOf('"venue_name"', idx)) !== null && idx !== -1) {
  // slice from idx - 300 to idx + 300
  results.push(text.slice(Math.max(0, idx - 400), idx + 400));
  idx += 12;
}

console.log('Occurrences of venue_name:', results.length);
if (results.length > 0) {
  console.log('First match:');
  console.log(results[0]);
}
