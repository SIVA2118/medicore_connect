import mongoose from "mongoose";

const receptionistSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: { type: String, default: "receptionist" },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError when hot reloading (especially with nodemon)
export default mongoose.models.Receptionist ||
  mongoose.model("Receptionist", receptionistSchema);
