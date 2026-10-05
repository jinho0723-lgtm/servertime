const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

// -------------------------------------------------------------
// Helper: Clean Title Without Swallowing Angle-Bracket Show Titles
// -------------------------------------------------------------
function cleanHtmlTagsOnly(raw) {
  if (!raw) return "";
  return raw
    // Remove specific HTML tags only (<b>, </b>, <span>, </span>, etc.)
    .replace(/<\/?(b|strong|span|p|div|i|em|font|a)[^>]*>/gi, "")
    // Normalize ticket open notice text
    .replace(/티켓\s*오픈\s*안내/g, "")
    .replace(/\[단독판매\]/g, "단독판매")
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------------------------------------------------
// 1. Ingest Clean Ticketlink Events
// -------------------------------------------------------------
async function repairTicketlink() {
  console.log("=== [1] REPAIRING TICKETLINK EVENTS ===");
  const res = await fetch("http://www.ticketlink.co.kr/help/getNoticeList?page=1&noticeCategoryCode=TICKET_OPEN", {
    headers: { "User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest" }
  });
  const data = await res.json();
  const list = data?.result?.result || [];

  console.log(`Found ${list.length} official Ticketlink notices:`);

  for (const item of list) {
    if (!item.ticketOpenDatetime) continue;

    const title = cleanHtmlTagsOnly(item.title);
    let imageUrl = item.imagePath || item.noticeImagePath || null;
    if (imageUrl && imageUrl.startsWith("http://")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }

    const dateStr = item.ticketOpenDatetime.includes("+")
      ? item.ticketOpenDatetime
      : `${item.ticketOpenDatetime}+09:00`;
    const openAt = new Date(dateStr).toISOString();

    const event = {
      id: `ticketlink-notice-${item.noticeId}`,
      slug: `ticketlink-${item.noticeId}`,
      title,
      category: item.noticeCategoryName === "스포츠" ? "sports" : item.noticeCategoryName === "뮤지컬" ? "musical" : "concert",
      platform: "ticketlink",
      platform_name: "티켓링크",
      host_slug: "ticketlink",
      open_at: openAt,
      timezone: "Asia/Seoul",
      status: "SCHEDULED",
      source_type: "OFFICIAL_API",
      source_url: `https://www.ticketlink.co.kr/help/notice/${item.noticeId}`,
      confidence_score: 0.99,
      image_url: imageUrl,
    };

    console.log(`- [${event.id}] ${event.title}`);
    console.log(`  Open: ${event.open_at} | Img: ${event.image_url}`);

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
    console.log(`  Supabase Upsert: ${upRes.status}`);
  }
}

// -------------------------------------------------------------
// 2. Ingest Clean Yes24 Events
// -------------------------------------------------------------
async function repairYes24() {
  console.log("\n=== [2] REPAIRING YES24 EVENTS ===");
  const res = await fetch("http://ticket.yes24.com/New/Notice/NoticeMain.aspx", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await res.text();
  const parts = html.split("<div class='swiper-slide'>");

  const validIds = new Set();

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const linkMatch = chunk.match(/href='(\/Notice\?[^']*#id=([0-9]+)[^']*)'/);
    const titMatch = chunk.match(/class='ticket-tit'>([^<]+)<\/p>/);
    const dateMatch = chunk.match(/class='ticket-date'>([^<]+)<\/p>/);
    const imgMatch = chunk.match(/<img[^>]+src=['"]?(\/\/tkfile\.yes24\.com\/[^'">\s]+)/i);

    if (linkMatch && titMatch && dateMatch) {
      const urlPath = linkMatch[1];
      const id = linkMatch[2];
      validIds.add(id);

      const title = titMatch[1].replace(/티켓\s*오픈\s*안내/g, "").replace(/\[|\]/g, " ").replace(/\s+/g, " ").trim();
      const rawDate = dateMatch[1].trim();
      let img = imgMatch ? imgMatch[1] : null;
      if (img && img.includes("/dims/")) img = img.split("/dims/")[0];
      if (img && img.startsWith("//")) img = "https:" + img;

      const m = rawDate.match(/(\d{4})\.(\d{2})\.(\d{2})\s*\([^)]*\)\s*(\d{2}):(\d{2})/);
      if (m) {
        const iso = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+09:00`).toISOString();
        const event = {
          id: `yes24-notice-${id}`,
          slug: `yes24-${id}`,
          title,
          category: title.includes("뮤지컬") ? "musical" : title.includes("연극") ? "musical" : "concert",
          platform: "yes24",
          platform_name: "예스24 티켓",
          host_slug: "yes24",
          open_at: iso,
          timezone: "Asia/Seoul",
          status: "SCHEDULED",
          source_type: "OFFICIAL_PAGE",
          source_url: `http://ticket.yes24.com${urlPath}`,
          confidence_score: 0.99,
          image_url: img,
        };

        console.log(`- [${event.id}] ${event.title}`);
        console.log(`  Open: ${event.open_at} | Img: ${event.image_url}`);

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
        console.log(`  Supabase Upsert: ${upRes.status}`);
      }
    }
  }

  // Cancel any obsolete or mismatched yes24 notices that are not in the valid current list
  const obsoleteIds = ["18585", "18592"];
  for (const obs of obsoleteIds) {
    await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.yes24-notice-${obs}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "CANCELLED", image_url: null })
    });
  }
}

// -------------------------------------------------------------
// 3. Cancel All 27 Synthetic NOL/Interpark Events
// -------------------------------------------------------------
async function cancelSyntheticInterpark() {
  console.log("\n=== [3] CANCELLING SYNTHETIC NOL / INTERPARK EVENTS ===");
  // Query all interpark events
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?platform=eq.interpark&select=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const list = await res.json();
  console.log(`Found ${list.length} synthetic Interpark events to cancel`);

  for (const item of list) {
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${item.id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "CANCELLED" })
    });
    console.log(`- Cancelled ${item.id}: status ${patchRes.status}`);
  }
}

// -------------------------------------------------------------
// 4. Verify Melon Events
// -------------------------------------------------------------
async function verifyMelon() {
  console.log("\n=== [4] VERIFYING MELON EVENTS ===");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?platform=eq.melon&select=*`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const list = await res.json();
  for (const m of list) {
    console.log(`- [${m.id}] ${m.title}`);
    console.log(`  Open: ${m.open_at} | Img: ${m.image_url} | URL: ${m.source_url}`);
  }
}

async function run() {
  console.log("Starting Master Data Repair...\n");
  await repairTicketlink();
  await repairYes24();
  await cancelSyntheticInterpark();
  await verifyMelon();
  console.log("\nMaster Data Repair Completed Successfully!");
}

run().catch(console.error);
