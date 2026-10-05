const fs = require('fs');

const text = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');

// Find the state with pages and notices
const queryStateIdx = text.indexOf('"notices":[');
console.log('Query state idx:', queryStateIdx);

// Let's find the JSON chunk containing "notices"
// We can locate the start of the array or object
let start = text.lastIndexOf('{"summary":', queryStateIdx);
console.log('Summary start:', start);

// Let's extract the notices array:
// Match all notices objects or extract the JSON string
let openBrackets = 0;
let jsonStr = '';
for (let i = queryStateIdx + 10; i < text.length; i++) {
  if (text[i] === '[') openBrackets++;
  else if (text[i] === ']') {
    if (openBrackets === 0) {
      jsonStr = text.slice(queryStateIdx + 10, i + 1);
      break;
    }
    openBrackets--;
  }
}

console.log('jsonStr length:', jsonStr.length);
try {
  const notices = JSON.parse(jsonStr);
  console.log('Successfully parsed notices! Count:', notices.length);
  fs.writeFileSync('scripts/nol_official_notices.json', JSON.stringify(notices, null, 2));
  
  notices.forEach((n, idx) => {
    const dates = (n.ticket_dates || []).map(d => `${d.ticket_open_date} (${d.ticket_open_type_name || ''} ${d.ticket_other_open_name || ''})`).join(', ');
    console.log(`${idx + 1}. [ID: ${n.id}] [${n.display_concert ? '콘서트' : (n.display_musical ? '뮤지컬' : '기타')}] ${n.title} | ${dates}`);
  });
} catch (e) {
  console.error('Parse error:', e.message);
  fs.writeFileSync('scripts/nol_notices_raw.txt', jsonStr);
}
