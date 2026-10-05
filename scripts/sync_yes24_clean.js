const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function main() {
  console.log("Fetching Yes24 NoticeMain.aspx...");
  const res = await fetch("http://ticket.yes24.com/New/Notice/NoticeMain.aspx", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await res.text();
  const parts = html.split("<div class='swiper-slide'>");

  const events = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const linkMatch = chunk.match(/href='(\/Notice\?[^']*#id=([0-9]+)[^']*)'/);
    const titMatch = chunk.match(/class='ticket-tit'>([^<]+)<\/p>/);
    const dateMatch = chunk.match(/class='ticket-date'>([^<]+)<\/p>/);
    const imgMatch = chunk.match(/<img[^>]+src=['"]?(\/\/tkfile\.yes24\.com\/[^'">\s]+)/i);

    if (linkMatch && titMatch && dateMatch) {
      const urlPath = linkMatch[1];
      const id = linkMatch[2];
      const title = titMatch[1].replace(/티켓\s*오픈\s*안내/g, '').replace(/\[|\]/g, ' ').replace(/\s+/g, ' ').trim();
      const rawDate = dateMatch[1].trim();
      let img = imgMatch ? imgMatch[1] : null;
      if (img && img.includes('/dims/')) img = img.split('/dims/')[0];
      if (img && img.startsWith('//')) img = 'https:' + img;

      const m = rawDate.match(/(\d{4})\.(\d{2})\.(\d{2})\s*\([^)]*\)\s*(\d{2}):(\d{2})/);
      if (m) {
        const iso = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+09:00`).toISOString();
        events.push({
          id: `yes24-notice-${id}`,
          slug: `yes24-${id}`,
          title,
          category: title.includes('뮤지컬') ? 'musical' : title.includes('연극') ? 'musical' : 'concert',
          platform: 'yes24',
          platform_name: '예스24 티켓',
          host_slug: 'yes24',
          open_at: iso,
          timezone: 'Asia/Seoul',
          status: 'SCHEDULED',
          source_type: 'OFFICIAL_PAGE',
          source_url: `http://ticket.yes24.com${urlPath}`,
          image_url: img,
          confidence_score: 0.99
        });
      }
    }
  }

  console.log(`Parsed ${events.length} valid official Yes24 events:`);
  for (const ev of events) {
    console.log(`- [${ev.id}] ${ev.title} | ${ev.open_at} | ${ev.image_url}`);
    const upRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify(ev)
    });
    console.log(`  Upsert status: ${upRes.status}`);
  }

  // Remove old mismatched rows where title was erroneously set to GHOSTIVAL 2026
  // (e.g. yes24-notice-18585 which is obsolete or mismatched)
  console.log("\nCleaning up old mismatched ghostival row (yes24-notice-18585)...");
  // We can update yes24-notice-18585 status to CANCELLED or update its title so it doesn't conflict
  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.yes24-notice-18585`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "CANCELLED",
      title: "종료된 예스24 티켓 공지"
    })
  });
  console.log("Cleanup status:", updateRes.status);
}

main().catch(console.error);
