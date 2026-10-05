const fs = require('fs');

async function scrapeAllMelon() {
  const html = fs.readFileSync('scripts/melon_csoon.html', 'utf8');
  
  // Find all detail.htm?csoonId=(\d+)
  const regex = /href="\.\/detail\.htm\?csoonId=(\d+)"/g;
  const ids = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  
  console.log('Unique Melon csoon IDs:', ids);
  
  const results = [];
  for (const id of ids) {
    try {
      const res = await fetch(`https://ticket.melon.com/csoon/detail.htm?csoonId=${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const detailHtml = await res.text();
      
      // Title
      const titM = detailHtml.match(/<h2 class="tit">([\s\S]*?)<\/h2>/i) || detailHtml.match(/<p class="tit_consert">([\s\S]*?)<\/p>/i);
      const title = titM ? titM[1].replace(/<[^>]+>/g, '').replace(/티켓\s*오픈\s*안내/g, '').trim() : '';
      
      // Poster
      const imgM = detailHtml.match(/<div class="box_consert_thumb">[\s\S]*?<img[^>]+src="([^"]+)"/i) || detailHtml.match(/<div class="thumb">[\s\S]*?<img[^>]+src="([^"]+)"/i);
      let img = imgM ? imgM[1] : null;
      if (img && img.includes('/melon/resize/')) img = img.split('/melon/resize/')[0];
      
      // Open schedule
      // Look for: <dd class="txt_date"><span class="blit">:</span>2026년 10월 6일 (Tue) 20:00</dd>
      const dateMatch = detailHtml.match(/<dd class="txt_date"[^>]*>[\s\S]*?(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일[^(]*\([A-Za-z가-힣]+\)\s*(\d{1,2}):(\d{2})<\/dd>/i);
      let openAt = null;
      if (dateMatch) {
        const y = dateMatch[1];
        const mo = dateMatch[2].padStart(2, '0');
        const d = dateMatch[3].padStart(2, '0');
        const h = dateMatch[4].padStart(2, '0');
        const min = dateMatch[5].padStart(2, '0');
        openAt = new Date(`${y}-${mo}-${d}T${h}:${min}:00+09:00`).toISOString();
      }
      
      results.push({
        id,
        title,
        openAt,
        img,
        url: `https://ticket.melon.com/csoon/detail.htm?csoonId=${id}`
      });
      console.log(`Melon [${id}] ${title} -> Open: ${openAt} | Img: ${img ? 'YES' : 'NO'}`);
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error fetching melon ${id}:`, e.message);
    }
  }
  
  fs.writeFileSync('scripts/melon_scraped_all.json', JSON.stringify(results, null, 2));
}

scrapeAllMelon().catch(console.error);
