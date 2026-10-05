const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function ingestAllOfficialNol() {
  console.log("=== INGESTING 66 OFFICIAL NOL NOTICES ===");
  const notices = JSON.parse(fs.readFileSync('scripts/nol_all_official_notices.json', 'utf8'));
  console.log(`Loaded ${notices.length} notices from disk.`);

  let inserted = 0;
  for (const n of notices) {
    // Determine categories
    let category = "concert";
    if (n.display_concert || (n.goods_genre_name && n.goods_genre_name.includes('콘서트'))) {
      category = "concert";
    } else if (n.display_musical || (n.goods_genre_name && n.goods_genre_name.includes('뮤지컬'))) {
      category = "musical";
    } else if (n.display_play || (n.goods_genre_name && n.goods_genre_name.includes('연극'))) {
      category = "musical";
    } else if (n.goods_genre_name && n.goods_genre_name.includes('스포츠')) {
      category = "sports";
    }

    // Sort ticket open dates to pick the primary/earliest upcoming open date
    const sortedDates = (n.ticket_dates || []).map(dt => ({
      name: dt.ticket_other_open_name || dt.ticket_open_type_name || '일반 예매',
      iso: new Date(dt.ticket_open_date + '+09:00').toISOString(),
      raw: dt.ticket_open_date
    })).sort((a,b) => new Date(a.iso) - new Date(b.iso));

    if (sortedDates.length === 0) continue;

    // Pick earliest future date, or if all past, pick the last one
    const futureDates = sortedDates.filter(d => new Date(d.iso) >= new Date('2026-10-05T00:00:00+09:00'));
    const targetDate = futureDates.length > 0 ? futureDates[0] : sortedDates[sortedDates.length - 1];

    const poster = n.goods_poster_image_url || n.open_notice_poster_image_url || null;
    const prodUrl = n.goods_code 
      ? `https://nol.yanolja.com/ticket/products/${n.goods_code}` 
      : `https://nol.yanolja.com/ticket/display/upcoming`;

    const event = {
      id: `nol-notice-${n.id}`,
      slug: `nol-${n.id}`,
      title: n.title.trim(),
      category,
      platform: "interpark",
      platform_name: "NOL 티켓 (인터파크)",
      host_slug: "interpark",
      open_at: targetDate.iso,
      timezone: "Asia/Seoul",
      status: "SCHEDULED",
      source_type: "OFFICIAL_PAGE",
      source_url: prodUrl,
      confidence_score: 0.99,
      image_url: poster,
    };

    const upRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify(event)
    });

    if (upRes.ok || upRes.status === 201) {
      inserted++;
      console.log(`[OK] [${category.toUpperCase()}] ${event.title} -> ${targetDate.raw} (${targetDate.name})`);
    } else {
      console.error(`[ERR ${upRes.status}] ${event.title}:`, await upRes.text());
    }
  }

  console.log(`\nSuccessfully ingested ${inserted} official NOL notices!`);
}

async function ingestMelonRemaining() {
  console.log("\n=== INGESTING REMAINING MELON NOTICES ===");
  const melonList = JSON.parse(fs.readFileSync('scripts/melon_scraped_all.json', 'utf8'));
  
  let inserted = 0;
  for (const m of melonList) {
    if (!m.openAt || new Date(m.openAt) < new Date('2026-10-05T00:00:00+09:00')) continue;

    const event = {
      id: `melon-notice-${m.id}`,
      slug: `melon-${m.id}`,
      title: m.title.trim(),
      category: m.title.includes('뮤지컬') ? 'musical' : 'concert',
      platform: "melon",
      platform_name: "멜론티켓",
      host_slug: "melon",
      open_at: m.openAt,
      timezone: "Asia/Seoul",
      status: "SCHEDULED",
      source_type: "OFFICIAL_PAGE",
      source_url: m.url,
      confidence_score: 0.99,
      image_url: m.img,
    };

    const upRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify(event)
    });

    if (upRes.ok || upRes.status === 201) {
      inserted++;
      console.log(`[OK] [MELON] ${event.title} -> ${event.open_at}`);
    } else {
      console.error(`[ERR ${upRes.status}] ${event.title}:`, await upRes.text());
    }
  }
  console.log(`Successfully ingested ${inserted} active Melon notices!`);
}

async function main() {
  await ingestAllOfficialNol();
  await ingestMelonRemaining();
}

main().catch(console.error);
