const fs = require('fs');

async function main() {
  const res = await fetch('http://ticket.yes24.com/New/Notice/NoticeMain.aspx', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();

  const parts = html.split("<div class='swiper-slide'>");
  console.log(`Found ${parts.length - 1} slides in NoticeMain.aspx\n`);

  const results = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const linkMatch = chunk.match(/href='(\/Notice\?[^']*#id=([0-9]+)[^']*)'/);
    const titMatch = chunk.match(/class='ticket-tit'>([^<]+)<\/p>/);
    const dateMatch = chunk.match(/class='ticket-date'>([^<]+)<\/p>/);
    const imgMatch = chunk.match(/<img[^>]+src=['"]?(\/\/tkfile\.yes24\.com\/[^'">\s]+)/i);

    if (linkMatch && titMatch) {
      const urlPath = linkMatch[1];
      const id = linkMatch[2];
      const title = titMatch[1].replace(/티켓\s*오픈\s*안내/g, '').replace(/\[|\]/g, ' ').replace(/\s+/g, ' ').trim();
      const rawDate = dateMatch ? dateMatch[1].trim() : '';
      let img = imgMatch ? imgMatch[1] : null;
      if (img && img.includes('/dims/')) img = img.split('/dims/')[0];
      if (img && img.startsWith('//')) img = 'https:' + img;

      results.push({ id, title, rawDate, img, urlPath });
      console.log(`ID: ${id}`);
      console.log(`Title: ${title}`);
      console.log(`Date: ${rawDate}`);
      console.log(`Image: ${img}`);
      console.log(`URL: http://ticket.yes24.com${urlPath}\n`);
    }
  }
}

main().catch(console.error);
