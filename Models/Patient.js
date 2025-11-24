import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  phone: String,
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  photo: String,
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }]
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
