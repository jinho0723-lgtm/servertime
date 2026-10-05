const fs = require('fs');

const text = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');

// Find all notices! Notice fields:
// "id": 15420, "title": "...", "goods_poster_image_url": "...", "ticket_open_dates": [...], "venue_name": "..."
// Let's inspect where these notices are located
const noticeRegex = /\{"ticket_open_dates":(\[.*?\]),"id":(\d+),"title":"(.*?)","open_type":(\d+),"goods_name":"(.*?)","venue_name":"(.*?)","goods_poster_image_url":"(.*?)"/g;

let m;
const notices = [];
while ((m = noticeRegex.exec(text)) !== null) {
  try {
    const dates = JSON.parse(m[1]);
    notices.push({
      id: m[2],
      title: m[3],
      venue: m[6],
      poster: m[7],
      dates: dates
    });
  } catch (e) {
    console.error('JSON parse error for dates:', e);
  }
}

console.log('Total notices found:', notices.length);
notices.forEach(n => {
  console.log(`[${n.id}] ${n.title} | ${n.venue}`);
  n.dates.forEach(d => console.log(`   - ${d.ticket_open_type_name} (${d.ticket_other_open_name}): ${d.ticket_open_date}`));
});
fs.writeFileSync('scripts/nol_upcoming_notices.json', JSON.stringify(notices, null, 2));
