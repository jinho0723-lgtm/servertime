const fs = require('fs');

async function findApi() {
  const s = fs.readFileSync('scripts/nol_upcoming_full.txt', 'utf8');
  const m = s.match(/"next_cursor":"([^"]+)"/);
  console.log('Cursor:', m ? m[1] : null);
  
  // Search for API endpoints in the html or full text
  // e.g. api or v1 or ticket
  const urls = s.match(/https?:\/\/[a-zA-Z0-9.-]+\/api\/[a-zA-Z0-9/_.-]+/g) || [];
  console.log('API URLs:', Array.from(new Set(urls)));
  
  const endpoints = s.match(/\/api\/[a-zA-Z0-9/_.-]+/g) || [];
  console.log('Endpoints:', Array.from(new Set(endpoints)).slice(0, 20));
}

findApi().catch(console.error);
