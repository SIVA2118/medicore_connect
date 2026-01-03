import mongoose from "mongoose";

const billerSchema = new mongoose.Schema(
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
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "biller"
    },
    profileImage: String,
    phone: String,
    employeeId: String,
    bloodGroup: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
    degree: String,
    address: String,
  },
  { timestamps: true }
);

// Prevent model overwrite in dev
export default mongoose.models.Biller ||
  mongoose.model("Biller", billerSchema);
