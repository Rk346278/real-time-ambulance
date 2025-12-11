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
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Test
// --------------------------------------------------
app.get("/", (req, res) => {
  res.send("Ambulance Backend is running");
});

// --------------------------------------------------
// MongoDB
// --------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ambulance_db")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// --------------------------------------------------
// Hospital APIs
// --------------------------------------------------
app.get("/api/driver-updates", async (req, res) => {
  const data = await DriverUpdate.find().sort({ createdAt: -1 }).limit(50);
  res.json(data);
});

app.get("/api/nurse-updates", async (req, res) => {
  const data = await NurseUpdate.find().sort({ createdAt: -1 }).limit(50);
  res.json(data);
});

app.delete("/api/clear-all", async (req, res) => {
  await DriverUpdate.deleteMany({});
  await NurseUpdate.deleteMany({});
  res.json({ message: "All data cleared" });
});

// --------------------------------------------------
// ✅ LIVE AMBULANCE LOCATION + ETA (THIS WAS MISSING)
// --------------------------------------------------
app.post("/update-location", (req, res) => {
  const { lat, lng, from, to, etaMinutes } = req.body;

  // ✅ broadcast FULL live info
  io.emit("ambulance_update", {
    lat,
    lng,
    from,
    to,
    etaMinutes
  });

  res.json({ status: "Location updated" });
});

// --------------------------------------------------
// Socket.io (existing logic stays)
// --------------------------------------------------
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// --------------------------------------------------
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`🚑 Server running on port ${PORT}`);
});
