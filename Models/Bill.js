import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription"
    },

    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    },

    scanReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScanReport"
    }],

    treatment: {
      type: String,
      required: true
    },

    billItems: [
      {
        name: { type: String, required: true },
        charge: { type: Number, required: true },
        qty: { type: Number, required: true }
      }
    ],

    amount: {
      type: Number,
      required: true
    },

    pdfFile: String,

    paid: {
      type: Boolean,
      default: true
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      default: "Cash"
    }
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
billSchema.index({ paid: 1, amount: 1 });
billSchema.index({ createdAt: -1 });

export default mongoose.models.Bill ||
  mongoose.model("Bill", billSchema);
