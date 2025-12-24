import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    // -----------------------
    // BASIC DETAILS
    // -----------------------
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: Date,
    phone: { type: String, required: true },
    email: String,

    // -----------------------
    // ADDRESS
    // -----------------------
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },

    // -----------------------
    // MEDICAL DETAILS
    // -----------------------
    bloodGroup: String,
    allergies: { type: [String], default: [] },
    existingConditions: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },

    // -----------------------
    // EMERGENCY CONTACT
    // -----------------------
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },

    // -----------------------
    // PATIENT TYPE (OPD / IPD)
    // -----------------------
    patientType: {
      type: String,
      enum: ["OPD", "IPD"],
      default: "OPD"
    },

    // -----------------------
    // INPATIENT (IPD) DETAILS
    // -----------------------
    ipdDetails: {
      ward: String,
      roomNo: String,
      bedNo: String,
      admissionDate: Date,
      dischargeDate: Date
    },

    // -----------------------
    // OUTPATIENT (OPD) DETAILS
    // -----------------------
    opdDetails: {
      visitCount: { type: Number, default: 1 },
      lastVisitDate: { type: Date, default: Date.now }
    },

    // -----------------------
    // HOSPITAL SYSTEM
    // -----------------------
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    mrn: String,

    // -----------------------
    // REPORTS (NO PHOTO)
    // -----------------------
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }]
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
