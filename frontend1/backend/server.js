const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DriverUpdate = require("./models/DriverUpdate");
const NurseUpdate = require("./models/NurseUpdate");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());

// ---------- Test Route ----------
app.get("/", (req, res) => {
  res.send("Ambulance Backend is running");
});

// ---------- MongoDB Connection ----------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ambulance_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- REST APIs for Hospital Dashboard ----------

// Get latest driver updates
app.get("/api/driver-updates", async (req, res) => {
  try {
    const data = await DriverUpdate.find().sort({ createdAt: -1 }).limit(50);
    res.json(data);
  } catch (err) {
    console.error("Error fetching driver updates:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get latest nurse updates
app.get("/api/nurse-updates", async (req, res) => {
  try {
    const data = await NurseUpdate.find().sort({ createdAt: -1 }).limit(50);
    res.json(data);
  } catch (err) {
    console.error("Error fetching nurse updates:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- Socket.io Events ----------
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // Driver sends location
  socket.on("driverUpdate", async (payload) => {
    try {
      const { fromLocation, toLocation } = payload;
      if (!fromLocation || !toLocation) return;

      const saved = await DriverUpdate.create({ fromLocation, toLocation });

      // Broadcast to all hospital dashboards
      io.emit("driverUpdateBroadcast", saved);
      console.log("📡 Driver update saved + broadcasted");
    } catch (err) {
      console.error("Error in driverUpdate:", err);
    }
  });

  // Nurse sends patient data
  socket.on("nurseUpdate", async (payload) => {
    try {
      const { patientName, age, symptoms } = payload;
      if (!patientName || !age || !symptoms) return;

      const saved = await NurseUpdate.create({ patientName, age, symptoms });

      // Broadcast to all hospital dashboards
      io.emit("nurseUpdateBroadcast", saved);
      console.log("📡 Nurse update saved + broadcasted");
    } catch (err) {
      console.error("Error in nurseUpdate:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`🚑 Server running on port ${PORT}`);
});
