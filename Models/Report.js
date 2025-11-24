import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  reportDetails: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
