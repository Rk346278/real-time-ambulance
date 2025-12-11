const mongoose = require("mongoose");

const nurseUpdateSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    symptoms: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NurseUpdate", nurseUpdateSchema);
