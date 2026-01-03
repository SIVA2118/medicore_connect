import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    phone: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "doctor" },

    gender: { type: String, enum: ["Male", "Female", "Other"] },
    age: Number,
    experience: { type: Number, default: 0 },
    qualification: String,
    registrationNumber: { type: String, unique: true },
    clinicAddress: String,
    consultationFee: { type: Number, default: 0 },

    availability: {
      days: [String],
      from: String,
      to: String,
    },

    profileImage: String,
    bio: String,
    isActive: { type: Boolean, default: true },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    // New Fields for ID Card
    bloodGroup: String,
    employeeId: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
  },
  { timestamps: true }
);

export default mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);
