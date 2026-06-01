// ============================================================
//  Google Reviews Proxy Server
//  Deploy this to any Node.js host (Render, Railway, Vercel, etc.)
//  Your API key stays here — never exposed to the browser.
// ============================================================

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace with your Squarespace site domain
const ALLOWED_ORIGIN = "https://your-site.squarespace.com";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Set in your host's env vars
const PLACE_ID = process.env.PLACE_ID;             // Your Google Place ID

app.use(cors({ origin: ALLOWED_ORIGIN }));

app.get("/reviews", async (req, res) => {
  if (!GOOGLE_API_KEY || !PLACE_ID) {
    return res.status(500).json({ error: "Server misconfigured — check env vars." });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ error: data.status, message: data.error_message });
    }

    const { name, rating, user_ratings_total, reviews } = data.result;

    // Only return 5-star reviews (optional — remove filter to show all)
    const filtered = (reviews || []).filter(r => r.rating >= 4);

    res.json({ name, rating, user_ratings_total, reviews: filtered });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`Reviews proxy running on port ${PORT}`));
