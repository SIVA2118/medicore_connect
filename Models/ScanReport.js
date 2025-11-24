import mongoose from "mongoose";

const scanReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    type: { type: String },
    description: { type: String },
    pdfFile: { type: String }, // path or URL to generated PDF
  },
  { timestamps: true }
);

const ScanReport = mongoose.models.ScanReport || mongoose.model("ScanReport", scanReportSchema);
export default ScanReport;
