const SUPABASE_URL = "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function cancelObsolete() {
  const ids = ["yes24-notice-18580", "yes24-notice-18582", "yes24-notice-18584"];
  for (const id of ids) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "CANCELLED" })
    });
    console.log(`Cancelled ${id}: ${res.status}`);
  }
}

cancelObsolete().catch(console.error);
