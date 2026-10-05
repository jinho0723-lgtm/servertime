const fs = require('fs');

async function checkMelon() {
  console.log("=== [1] AUDITING MELON TICKET ===");
  try {
    const res = await fetch("https://ticket.melon.com/main/index.htm", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await res.text();
    const regex = /href="(\/csoon\/detail\.htm\?csoonId=([0-9]+))"([\s\S]*?)<\/a>/g;
    let m;
    const items = [];
    while ((m = regex.exec(html)) !== null) {
      const link = m[1];
      const id = m[2];
      const inner = m[3];
      const titM = inner.match(/<span class="txt">([^<]+)<\/span>/);
      const dateM = inner.match(/<span class="more">\[오픈\]([^<]+)<\/span>/);
      if (titM && dateM) {
        items.push({ id, title: titM[1].trim(), date: dateM[1].trim(), link });
      }
    }
    console.log(`Found ${items.length} Melon events:`);
    items.forEach(it => console.log(`  - [${it.id}] ${it.title} | ${it.date} | https://ticket.melon.com${it.link}`));
  } catch (e) {
    console.error("Melon error:", e.message);
  }
}

async function checkYes24() {
  console.log("\n=== [2] AUDITING YES24 TICKET ===");
  try {
    const res = await fetch("http://ticket.yes24.com/New/Notice/NoticeMain.aspx", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const parts = html.split("<div class='swiper-slide'>");
    console.log(`Found ${parts.length - 1} Yes24 slides:`);
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i];
      const linkM = chunk.match(/href='(\/Notice\?[^']*#id=([0-9]+)[^']*)'/);
      const titM = chunk.match(/class='ticket-tit'>([^<]+)<\/p>/);
      const dateM = chunk.match(/class='ticket-date'>([^<]+)<\/p>/);
      const imgM = chunk.match(/<img[^>]+src=['"]?(\/\/tkfile\.yes24\.com\/[^'">\s]+)/i);

      if (linkM && titM && dateM) {
        let img = imgM ? imgM[1] : null;
        if (img && img.includes('/dims/')) img = img.split('/dims/')[0];
        if (img && img.startsWith('//')) img = 'https:' + img;
        console.log(`  - [${linkM[2]}] ${titM[1].trim()}`);
        console.log(`    Date: ${dateM[1].trim()} | Img: ${img}`);
      }
    }
  } catch (e) {
    console.error("Yes24 error:", e.message);
  }
}

async function checkTicketlink() {
  console.log("\n=== [3] AUDITING TICKETLINK ===");
  try {
    const res = await fetch("http://www.ticketlink.co.kr/help/getNoticeList?page=1&noticeCategoryCode=TICKET_OPEN", {
      headers: { "User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest" }
    });
    const json = await res.json();
    const list = json?.result?.result || [];
    console.log(`Found ${list.length} Ticketlink notice items:`);
    for (const it of list) {
      // Clean HTML tags safely without removing title enclosed in < >
      // Specifically replace <b>, </b>, <span>, </span>, etc.
      const cleanTitle = it.title
        .replace(/<\/?(b|strong|span|p|div|i|em)[^>]*>/gi, '')
        .replace(/티켓\s*오픈\s*안내/g, '')
        .replace(/\[단독판매\]/g, '단독판매')
        .replace(/\s+/g, ' ')
        .trim();

      let img = it.imagePath || it.noticeImagePath || null;
      if (img && img.startsWith('http://')) img = img.replace('http://', 'https://');
      const isDummy = img && img.includes('poster_dummy');

      console.log(`  - [${it.noticeId}] Raw: "${it.title}"`);
      console.log(`    Clean: "${cleanTitle}" | Date: ${it.ticketOpenDatetime} | Img: ${img} (Dummy? ${isDummy})`);
    }
  } catch (e) {
    console.error("Ticketlink error:", e.message);
  }
}

async function run() {
  await checkMelon();
  await checkYes24();
  await checkTicketlink();
}

run().catch(console.error);
