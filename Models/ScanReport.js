import mongoose from "mongoose";

const scanReportSchema = new mongoose.Schema(
  {
    /* ================= BASIC RELATIONS ================= */
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    // Doctor who requested or reviewed the scan
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null
    },

    // Scanner assigned to perform the scan
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scanner",
      default: null
    },

    /* ================= SCAN DETAILS ================= */
    // MRI, CT, X-Ray, Blood Test, Urine Test, ECG...
    type: {
      type: String,
      required: true
    },

    // Chest MRI, Brain CT, Blood Sugar Test...
    scanName: {
      type: String,
      required: true
    },

    // Brief clinical description
    description: {
      type: String
    },

    // Reason for scan
    indication: {
      type: String
    },

    /* ================= RESULTS ================= */
    // Summary / Impression
    impression: {
      type: String
    },

    // Detailed findings
    findings: {
      type: String
    },

    // Normal / Abnormal / Critical
    resultStatus: {
      type: String,
      enum: ["Normal", "Abnormal", "Critical", "Pending"],
      default: "Pending"
    },

    /* ================= FILES ================= */
    // PDF report file
    pdfFile: {
      type: String,
      default: null
    },

    /* ================= LAB / HOSPITAL ================= */
    labName: {
      type: String
    },

    technicianName: {
      type: String
    },

    /* ================= DATES ================= */
    scanDate: {
      type: Date,
      required: true
    },

    reportGeneratedDate: {
      type: Date
    },

    /* ================= PAYMENT ================= */
    cost: {
      type: Number,
      default: 0
    },

    /* ================= AUDIT ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null
    },

    isBilled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
scanReportSchema.index({ patient: 1 });
scanReportSchema.index({ doctor: 1 });
scanReportSchema.index({ assignedTo: 1 });
scanReportSchema.index({ isVerified: 1 });
scanReportSchema.index({ resultStatus: 1 });
scanReportSchema.index({ createdAt: -1 });

export default mongoose.models.ScanReport ||
  mongoose.model("ScanReport", scanReportSchema);
