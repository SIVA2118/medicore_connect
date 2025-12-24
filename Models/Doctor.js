import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    specialization: { type: String, required: true },

    phone: { type: String},

    email: { type: String, unique: true, required: true },

    password: { type: String, required: true },

    role: { type: String, default: "doctor" },

    // ➕ Added Details
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    age: { type: Number },

    experience: { type: Number, default: 0 }, // in years

    qualification: { type: String }, // MBBS, MD, etc.

    registrationNumber: { type: String, unique: true }, // Medical License No.

    clinicAddress: { type: String },

    consultationFee: { type: Number, default: 0 },

    availability: {
      days: [String], // ["Mon", "Tue", "Wed"]
      from: String,   // "10:00 AM"
      to: String,     // "5:00 PM"
    },

    profileImage: { type: String }, // Cloud URL or Base64

    bio: { type: String }, // short description

    isActive: { type: Boolean, default: true },

    // ⭐ For Ratings from Patients
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
