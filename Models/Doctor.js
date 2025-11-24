import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "doctor" },
}, { timestamps: true });

// 🩺 Fix: Prevent OverwriteModelError
export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
