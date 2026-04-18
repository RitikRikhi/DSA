async function run() {
  try {
    const res = await fetch("https://dsa-lksa.vercel.app/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test AI",
        email: "test@example.com",
        purpose: "General Enquiry",
        message: "test message"
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
run();
