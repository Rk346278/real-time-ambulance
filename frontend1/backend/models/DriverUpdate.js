const mongoose = require("mongoose");

const driverUpdateSchema = new mongoose.Schema(
  {
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true }
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("DriverUpdate", driverUpdateSchema);
