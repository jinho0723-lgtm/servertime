const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?platform=in.(melon,custom,naver)&select=*`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const data = await res.json();
  data.forEach(d => {
    console.log(`[${d.platform.toUpperCase()}] ${d.id} | ${d.status}`);
    console.log(`  Title: ${d.title}`);
    console.log(`  OpenAt: ${d.open_at}`);
    console.log(`  Image: ${d.image_url}`);
    console.log(`  Source: ${d.source_url}\n`);
  });
}

main().catch(console.error);
