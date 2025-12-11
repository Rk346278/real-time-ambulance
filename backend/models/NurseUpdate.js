const mongoose = require("mongoose");

const nurseUpdateSchema = new mongoose.Schema(
  {
    // ✅ Nurse-entered fields
    patientName: { 
      type: String, 
      required: true 
    },

    age: { 
      type: Number, 
      required: true 
    },

    notes: { 
      type: String, 
      required: true 
    },

    // ✅ AI-generated fields
    severityScore: { 
      type: Number, 
      default: 0 
    },

    conditionSeverity: { 
      type: String, 
      enum: ["CRITICAL", "SERIOUS", "STABLE"]
    },

    immediateRequirement: { 
      type: String 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NurseUpdate", nurseUpdateSchema);
