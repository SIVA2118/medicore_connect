import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctorReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "ScanReport" }],
    totalAmount: Number,
    pdfFile: String,
    paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError during hot reloads
export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
