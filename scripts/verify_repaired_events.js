const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?status=eq.SCHEDULED&select=platform,id,slug,title,open_at,image_url,source_url&order=open_at.asc`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const data = await res.json();
  console.log(`Total Active SCHEDULED Events: ${data.length}\n`);

  const byPlatform = {};
  for (const ev of data) {
    byPlatform[ev.platform] = (byPlatform[ev.platform] || 0) + 1;
    console.log(`[${ev.platform.toUpperCase()}] ${ev.title}`);
    console.log(`  Slug: ${ev.slug}`);
    console.log(`  Open: ${ev.open_at}`);
    console.log(`  Img:  ${ev.image_url}`);
    console.log(`  Link: ${ev.source_url}\n`);
  }
  console.log("=== Active Events by Platform ===");
  console.log(byPlatform);
}

main().catch(console.error);
