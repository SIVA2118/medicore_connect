import mongoose from "mongoose";

const scannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false   // 🔐 hide password
    },

    department: String,

    role: {
      type: String,
      default: "scanner"
    },
    profileImage: String,
    phone: String,
    employeeId: String,
    bloodGroup: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
  },
  { timestamps: true }
);

export default mongoose.models.Scanner ||
  mongoose.model("Scanner", scannerSchema);
