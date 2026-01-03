import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
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

        department: String, // e.g., "Pathology", "Microbiology"

        role: {
            type: String,
            default: "lab"
        },

        // Additional fields can be added here
        phone: String,
        profileImage: String,
        employeeId: String,
        bloodGroup: String,
        emergencyContactName: String,
        emergencyContactPhone: String,
    },
    { timestamps: true }
);

export default mongoose.models.Lab ||
    mongoose.model("Lab", labSchema);
