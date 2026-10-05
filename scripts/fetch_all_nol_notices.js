const fs = require('fs');

async function fetchAllNolNotices() {
  let allNotices = [];
  let cursor = '';
  let page = 1;
  
  while (true) {
    console.log(`Fetching page ${page} with cursor: "${cursor}"...`);
    const res = await fetch('https://nol.yanolja.com/ticket/display/api/upcoming', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ sort: 'open', cursor })
    });
    
    if (!res.ok) {
      console.error(`HTTP error ${res.status}`);
      break;
    }
    
    const data = await res.json();
    const notices = data.notices || [];
    allNotices.push(...notices);
    console.log(`Page ${page}: got ${notices.length} notices. Total so far: ${allNotices.length} / ${data.summary?.total_count}`);
    
    const nextCursor = data.summary?.next_cursor;
    if (!nextCursor || nextCursor === cursor || notices.length === 0) {
      break;
    }
    cursor = nextCursor;
    page++;
    await new Promise(r => setTimeout(r, 200));
  }
  
  fs.writeFileSync('scripts/nol_all_official_notices.json', JSON.stringify(allNotices, null, 2));
  console.log(`Saved all ${allNotices.length} official NOL notices!`);
  
  // Categorize
  const concerts = allNotices.filter(n => n.display_concert || (n.goods_genre_name && n.goods_genre_name.includes('콘서트')));
  console.log(`Total Concerts: ${concerts.length}`);
  concerts.forEach((c, idx) => {
    const dates = (c.ticket_dates || []).map(d => `${d.ticket_open_date} (${d.ticket_other_open_name || d.ticket_open_type_name || ''})`).join(' | ');
    console.log(`${idx + 1}. [콘서트] ${c.title} -> ${dates}`);
  });
}

fetchAllNolNotices().catch(console.error);
