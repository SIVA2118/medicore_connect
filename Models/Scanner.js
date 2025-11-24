import mongoose from "mongoose";

const scannerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    department: String,
    role: { type: String, default: "scanner" },
  },
  { timestamps: true }
);

export default mongoose.models.Scanner || 
  mongoose.model("Scanner", scannerSchema);
