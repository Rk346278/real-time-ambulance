const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

// Models
const DriverUpdate = require("./models/DriverUpdate");
const NurseUpdate = require("./models/NurseUpdate");

const app = express();
const server = http.createServer(app);

// Socket Setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Ambulance Backend is running");
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ambulance_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// =======================================================================
// ⭐ SEMANTIC AI SEVERITY SCORING (UNCHANGED)
// =======================================================================
function semanticSeverityScore(text) {
  if (!text) return 0;

  const t = text.toLowerCase();

  const critical = [
    "heart attack", "cardiac arrest", "stroke", "unconscious",
    "not breathing", "no pulse", "major accident", "severe trauma",
    "head trauma", "brain injury"
  ];

  const high = [
    "heavy bleeding", "bleeding heavily", "deep cut", "multiple fractures",
    "seizure", "difficulty breathing", "shortness of breath", "severe pain",
    "collapsed", "shock"
  ];

  const moderate = [
    "fracture", "broken bone", "chest pain", "vomiting blood",
    "high fever", "severe dehydration", "asthma attack"
  ];

  const low = [
    "fever", "dizziness", "vomiting", "minor injury", "small cut",
    "cold", "cough"
  ];

  const minimal = [
    "mild", "minor", "light headache", "scratch"
  ];

  const match = (arr) => arr.some(word => t.includes(word));

  if (match(critical)) return 95;
  if (match(high)) return 80;
  if (match(moderate)) return 60;
  if (match(low)) return 35;
  if (match(minimal)) return 15;

  return 50;
}


// =======================================================================
// ⭐ NEW: AI CONDITION SEVERITY (ADDED)
// =======================================================================
function getConditionSeverity(score) {
  if (score >= 75) return "CRITICAL";
  if (score >= 40) return "SERIOUS";
  return "STABLE";
}


// =======================================================================
// ⭐ NEW: AI IMMEDIATE REQUIREMENT (ADDED)
// =======================================================================
function getImmediateRequirement(notes, conditionSeverity) {
  const t = notes.toLowerCase();

  if (conditionSeverity === "CRITICAL") {
    if (t.includes("breathing") || t.includes("oxygen"))
      return "Oxygen Support & ICU Ready";
    if (t.includes("cardiac") || t.includes("heart"))
      return "Cardiac ICU & Defibrillator";
    if (t.includes("head") || t.includes("brain"))
      return "Neuro ICU & Emergency CT";
    return "Emergency ICU Admission";
  }

  if (conditionSeverity === "SERIOUS") {
    if (t.includes("fracture"))
      return "Orthopedic Surgery Preparation";
    if (t.includes("bleeding"))
      return "Blood Unit & ER Monitoring";
    return "Emergency Ward Monitoring";
  }

  return "General Ward Observation";
}


// =======================================================================
// ⭐ STEP C1 — Detect traffic signals (UNCHANGED)
// =======================================================================
function detectSignalsFromGeometry(coords) {
  const signals = [];

  for (let i = 1; i < coords.length - 1; i++) {
    const p1 = coords[i - 1];
    const p2 = coords[i];
    const p3 = coords[i + 1];

    const v1 = [p2[0] - p1[0], p2[1] - p1[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);

    const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);

    if (angle > 35) {
      signals.push({
        lat: p2[1],
        lng: p2[0],
        name: "Intersection " + signals.length
      });
    }
  }

  return signals;
}


// =======================================================================
// ⭐ OSRM ROUTING (UNCHANGED)
// =======================================================================
app.get("/api/get-route", async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;

    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&alternatives=true`;

    const response = await axios.get(url);

    response.data.routes = response.data.routes.map((route) => {
      const coords = route.geometry.coordinates;
      const detectedSignals = detectSignalsFromGeometry(coords);
      return { ...route, signals: detectedSignals };
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Route fetch failed" });
  }
});


// =======================================================================
// ⭐ GET APIs (UNCHANGED)
// =======================================================================
app.get("/api/driver-updates", async (req, res) => {
  const data = await DriverUpdate.find().sort({ createdAt: -1 }).limit(100);
  res.json(data);
});

app.get("/api/nurse-updates", async (req, res) => {
  const data = await NurseUpdate.find()
    .sort({ severityScore: -1, createdAt: -1 })
    .limit(100);
  res.json(data);
});


// =======================================================================
// ⭐ CLEAR ALL (UNCHANGED)
// =======================================================================
app.delete("/api/clear-all", async (req, res) => {
  await NurseUpdate.deleteMany({});
  await DriverUpdate.deleteMany({});
  res.json({ message: "All data cleared successfully." });
});


// =======================================================================
// ⭐ DRIVER POST (UNCHANGED)
// =======================================================================
app.post("/api/driver-updates", async (req, res) => {
  const saved = await DriverUpdate.create(req.body);
  io.emit("driverUpdateBroadcast", saved);
  res.json({ message: "Driver update saved", data: saved });
});


// =======================================================================
// ⭐ NURSE POST — ✅ UPDATED AI LOGIC ONLY
// =======================================================================
app.post("/api/nurse-updates", async (req, res) => {
  try {
    const { patientName, age, notes } = req.body;

    const severityScore = semanticSeverityScore(notes);
    const conditionSeverity = getConditionSeverity(severityScore);
    const immediateRequirement = getImmediateRequirement(notes, conditionSeverity);

    const payload = {
      patientName,
      age,
      notes,
      severityScore,
      conditionSeverity,
      immediateRequirement
    };

    const saved = await NurseUpdate.create(payload);
    io.emit("nurseUpdateBroadcast", saved);

    res.json({
      message: "Nurse update saved (AI-generated triage)",
      data: saved
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// =======================================================================
// ⭐ LIVE LOCATION (UNCHANGED)
// =======================================================================
let ambulanceLocation = {};

app.post("/update-location", (req, res) => {
  const { lat, lng, signals } = req.body;

  ambulanceLocation = { lat, lng };

  if (signals) {
    signals.forEach((sig) => {
      const d = Math.sqrt((lat - sig.lat) ** 2 + (lng - sig.lng) ** 2);
      if (d < 0.0012) {
        io.emit("signal_approach", {
          signal: sig.name,
          status: "turn_green",
          lat: sig.lat,
          lng: sig.lng
        });
      }
    });
  }

  io.emit("ambulance_update", ambulanceLocation);
  res.json({ message: "Location updated" });
});


// =======================================================================
// ⭐ SOCKET.IO — ✅ NURSE EVENT UPDATED
// =======================================================================
io.on("connection", (socket) => {
  socket.on("driverUpdate", async (payload) => {
    const saved = await DriverUpdate.create(payload);
    io.emit("driverUpdateBroadcast", saved);
  });

  socket.on("nurseUpdate", async (payload) => {
    const severityScore = semanticSeverityScore(payload.notes || "");
    const conditionSeverity = getConditionSeverity(severityScore);
    const immediateRequirement = getImmediateRequirement(payload.notes || "", conditionSeverity);

    const saved = await NurseUpdate.create({
      patientName: payload.patientName,
      age: payload.age,
      notes: payload.notes,
      severityScore,
      conditionSeverity,
      immediateRequirement
    });

    io.emit("nurseUpdateBroadcast", saved);
  });
});


// =======================================================================
// ⭐ START SERVER (UNCHANGED)
// =======================================================================
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`🚑 Server running on port ${PORT}`);
});
