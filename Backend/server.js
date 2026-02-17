const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- GLOBAL SEARCH COUNTER ----------------
let routeSearchCount = 0;

// ---------------- AI CONFIG ----------------
const AI_URL = "https://campusnav-ai.onrender.com"; // your AI backend URL

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("CampusNav Backend is running");
});

// ---------------- LOCATIONS ----------------
app.get("/api/locations", (req, res) => {
  res.json([
    { name: "CSE Block", lat: 17.5216, lng: 78.3674 },
    { name: "Mechanical/Civil/EEE Block", lat: 17.5212, lng: 78.3672 },
    { name: "EEE Block", lat: 17.5211, lng: 78.3665 },
    { name: "IT Block", lat: 17.5204, lng: 78.3674 },
    { name: "Canteen", lat: 17.5204, lng: 78.3666 },
    { name: "Gokaraju Lailavathi Block", lat: 17.5210, lng: 78.3656 },
    { name: "Bank", lat: 17.5190, lng: 78.3682 },
    { name: "Pharmacy", lat: 17.5206, lng: 78.3688 },
    { name: "Library", lat: 17.5205, lng: 78.3675 },
    { name: "Halls 1 and 2", lat: 17.5192, lng: 78.3679 },
    { name: "Volleyball Court", lat: 17.5194, lng: 78.3679 },
    { name: "Cricket Ground", lat: 17.5194, lng: 78.3663 },
    { name: "Open Air Stadium", lat: 17.5207, lng: 78.3667 },
    { name: "AIML Block", lat: 17.5218, lng: 78.3670 }
  ]);
});

// ---------------- ROUTE SEARCH LOG ----------------
app.post("/api/log-route", (req, res) => {
  routeSearchCount += 1;
  console.log("Route search count:", routeSearchCount);

  res.json({ success: true });
});

// ---------------- AI CROWD STATUS ----------------
app.get("/api/crowd-status", async (req, res) => {
  try {
    const response = await axios.post(
      `${AI_URL}/predict`,
      { route_count: routeSearchCount },
      { timeout: 20000 } // handles Render cold start
    );

    // Validate AI response
    if (!response.data || !response.data.crowd_level) {
      return res.json({
        status: "Low",
        message: "Fallback value used"
      });
    }

    res.json({
      status: response.data.crowd_level
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);

    // Graceful fallback instead of breaking frontend
    res.json({
      status: "Low",
      message: "AI temporarily warming up"
    });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
