const fs = require('fs');

async function inspectNol() {
  const res = await fetch('https://nol.yanolja.com/ticket');
  const text = await res.text();
  fs.writeFileSync('scripts/nol_ticket.html', text);
  console.log('Saved nol_ticket.html, length:', text.length);
  
  const m = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    console.log('Found __NEXT_DATA__!');
    fs.writeFileSync('scripts/nol_next_data.json', m[1]);
    const data = JSON.parse(m[1]);
    console.log('Keys:', Object.keys(data));
    console.log('pageProps keys:', Object.keys(data.props?.pageProps || {}));
  } else {
    console.log('No __NEXT_DATA__, searching for script tags containing DAVICHI');
    const scripts = text.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
    scripts.forEach((s, i) => {
      if (s.includes('DAVICHI')) {
        console.log(`Script ${i} length: ${s.length}`);
        fs.writeFileSync(`scripts/nol_script_${i}.txt`, s);
      }
    });
  }
}

inspectNol().catch(console.error);
