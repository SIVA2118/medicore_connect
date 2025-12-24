import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    prescriptionNo: {
      type: String,
      default: () => "RX-" + Math.floor(100000 + Math.random() * 900000),
    },

    symptoms: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    department: { type: String, default: "" },

    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },        // ex: 2 times a day
        duration: { type: String, required: true },         // ex: 5 days

        // ⭐ NEW FIELDS ⭐
        partOfDay: { type: String, default: "" },           // Morning / Afternoon / Night
        mealInstruction: { type: String, default: "" }      // Before Food / After Food
      }
    ],

    notes: { type: String },

    followUpDate: { type: Date },

    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", default: null }
  },
  { timestamps: true }
);

// prevent OverwriteModelError
export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
