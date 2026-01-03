import mongoose from "mongoose";

const receptionistSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    email: String,
    password: String,
    phone: String,
    address: String,
    degree: String,
    profileImage: String,
    role: { type: String, default: "receptionist" },
    // New Fields for ID Card
    bloodGroup: String,
    employeeId: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError when hot reloading (especially with nodemon)
export default mongoose.models.Receptionist ||
  mongoose.model("Receptionist", receptionistSchema);
