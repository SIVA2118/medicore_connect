import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
    {
        /* ================= BASIC RELATIONS ================= */
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        // Doctor who requested or reviewed the report
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null
        },

        // Lab Technician assigned to perform the test
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lab",
            default: null
        },

        /* ================= LAB TEST DETAILS ================= */
        // Type of test: Hematology, Biochemistry, Microbiology, Serology...
        testType: {
            type: String,
            required: true
        },

        // Specific test name: CBC, Lipid Profile, Blood Sugar...
        testName: {
            type: String,
            required: true
        },

        // Brief description or notes
        description: {
            type: String
        },

        /* ================= RESULTS ================= */
        // Detailed test results (could be JSON or structured text)
        resultDetails: {
            type: String
        },

        // Normal / Abnormal / Critical
        resultStatus: {
            type: String,
            enum: ["Normal", "Abnormal", "Critical", "Pending"],
            default: "Pending"
        },

        // Reference Range for the test
        referenceRange: {
            type: String
        },

        /* ================= FILES ================= */
        // PDF report file
        pdfFile: {
            type: String,
            default: null
        },

        /* ================= METADATA ================= */
        labName: {
            type: String
        },

        technicianName: {
            type: String
        },

        /* ================= DATES ================= */
        testDate: {
            type: Date,
            required: true
        },

        reportGeneratedDate: {
            type: Date
        },

        /* ================= PAYMENT ================= */
        cost: {
            type: Number,
            default: 0
        },

        /* ================= AUDIT ================= */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null
        },

        isBilled: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

/* ================= INDEXES ================= */
labReportSchema.index({ patient: 1 });
labReportSchema.index({ doctor: 1 });
labReportSchema.index({ assignedTo: 1 });
labReportSchema.index({ isVerified: 1 });
labReportSchema.index({ resultStatus: 1 });
labReportSchema.index({ createdAt: -1 });

export default mongoose.models.LabReport ||
    mongoose.model("LabReport", labReportSchema);
