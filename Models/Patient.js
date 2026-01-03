import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mrn: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      default: () => "MRN-" + Math.floor(100000 + Math.random() * 900000)
    },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: Date,
    phone: { type: String, required: true },
    email: String,
    profileImage: String,

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },

    bloodGroup: String,
    allergies: [String],
    existingConditions: [String],
    currentMedications: [String],

    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },

    patientType: { type: String, enum: ["OPD", "IPD"], default: "OPD" },

    ipdDetails: {
      ward: String,
      roomNo: String,
      bedNo: String,
      admissionDate: Date,
      dischargeDate: Date
    },

    opdDetails: {
      visitCount: { type: Number, default: 1 },
      lastVisitDate: { type: Date, default: Date.now },
    },

    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    lastReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },

    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ "opdDetails.lastVisitDate": -1 });
patientSchema.index({ createdAt: -1 });

export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);
