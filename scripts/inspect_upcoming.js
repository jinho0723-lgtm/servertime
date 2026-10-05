const fs = require('fs');

async function inspectUpcoming() {
  const res = await fetch('https://nol.yanolja.com/ticket/display/upcoming');
  const text = await res.text();
  fs.writeFileSync('scripts/nol_upcoming.html', text);
  
  // Extract all chunks
  const pushes = [];
  const pushRegex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = pushRegex.exec(text)) !== null) {
    try {
      pushes.push(JSON.parse(`"${m[1]}"`));
    } catch (e) {}
  }
  const full = pushes.join('');
  fs.writeFileSync('scripts/nol_upcoming_full.txt', full);
  console.log('Upcoming full text length:', full.length);
}

inspectUpcoming().catch(console.error);
