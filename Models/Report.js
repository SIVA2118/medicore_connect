import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    // --------------------------
    // BASIC REFS
    // --------------------------
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // --------------------------
    // REPORT META
    // --------------------------
    reportTitle: {
      type: String,
      default: "Doctor Examination Report",
    },

    reportDetails: {
      type: String,
    },

    // --------------------------
    // PATIENT CONDITION SECTIONS
    // --------------------------

    symptoms: {
      type: [String], // Example: ["Fever", "Body Pain", "Weakness"]
      default: [],
    },

    physicalExamination: {
      type: String, // Doctor's observations on physical checkup
    },

    clinicalFindings: {
      type: String, // Example: "Throat infection present"
    },

    diagnosis: {
      type: String, // Example: "Viral Fever"
    },

    vitals: {
      temperature: { type: String },
      bloodPressure: { type: String },
      pulseRate: { type: String },
      respiratoryRate: { type: String },
      oxygenLevel: { type: String },
      weight: { type: String },
    },

    advisedInvestigations: {
      type: [String], // Example: ["Blood Test", "Urine Test", "X-Ray"]
      default: [],
    },

    treatmentAdvice: {
      type: String, // Example: "Take rest, drink fluids"
    },

    lifestyleAdvice: {
      type: String, // Example: "Avoid oily food, maintain hydration"
    },

    followUpDate: {
      type: Date,
    },

    additionalNotes: {
      type: String,
    },

    // --------------------------
    // ADMIN + SIGNATURE
    // --------------------------
    doctorSignature: {
      type: String, // URL or Base64
    },

    isFinal: {
      type: Boolean,
      default: true,
    },

    // Report created date
    date: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.Report || mongoose.model("Report", reportSchema);
