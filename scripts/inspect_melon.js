const fs = require('fs');

async function inspectMelon() {
  const res = await fetch('https://ticket.melon.com/csoon/index.htm', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/melon_csoon.html', html);
  console.log('Saved melon_csoon.html, length:', html.length);
  
  // Let's inspect ticket notices in melon
  // In melon csoon, notices are in <div class="box_ticket_list"> or similar
  const items = [];
  // Look for detail page links or open dates
  const itemMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const match of itemMatches) {
    const tr = match[1];
    if (tr.includes('csoon/detail.htm')) {
      items.push(tr);
    }
  }
  console.log('Found table rows with detail:', items.length);
  
  // Also check list items <li>
  const liMatches = html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  let csoonLis = 0;
  for (const match of liMatches) {
    const li = match[1];
    if (li.includes('csoon/detail.htm')) {
      csoonLis++;
    }
  }
  console.log('Found li items with detail:', csoonLis);
}

inspectMelon().catch(console.error);
