import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Lab from "../Models/Lab.js";
import LabReport from "../Models/LabReport.js";
import Patient from "../Models/Patient.js";
import Doctor from "../Models/Doctor.js";

// -------------------------------------------------------
// Lab Login
// -------------------------------------------------------
export const loginLab = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password)
            return res.status(400).json({ message: "Email & password required" });

        const lab = await Lab.findOne({ email }).select("+password");
        if (!lab) return res.status(404).json({ message: "Lab user not found" });

        const isMatch = await bcrypt.compare(password, lab.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        // Create JWT
        const token = jwt.sign(
            { id: lab._id, role: lab.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Lab login successful",
            token,
            lab: {
                id: lab._id,
                name: lab.name,
                email: lab.email,
                department: lab.department,
                role: lab.role,
                profileImage: lab.profileImage
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// -------------------------------------------------------
// Get Lab Profile
// -------------------------------------------------------
export const getLabProfile = async (req, res) => {
    try {
        const lab = await Lab.findById(req.user.id);
        if (!lab) return res.status(404).json({ message: "Lab user not found" });

        res.json(lab);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};

// -------------------------------------------------------
// Update Lab Profile
// -------------------------------------------------------
export const updateLabProfile = async (req, res) => {
    try {
        const updateData = req.body;

        // Block changing protected fields
        delete updateData.email;
        delete updateData.role;
        delete updateData.password;

        const lab = await Lab.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        );

        res.json({ message: "Profile updated", lab });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// -------------------------------------------------------
// Update Lab Password
// -------------------------------------------------------
export const updateLabPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const lab = await Lab.findById(req.user.id).select("+password");
        if (!lab) return res.status(404).json({ message: "Lab user not found" });

        const isMatch = await bcrypt.compare(oldPassword, lab.password);
        if (!isMatch)
            return res.status(400).json({ message: "Old password incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        lab.password = hashed;
        await lab.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating password", error });
    }
};

/* ================= CREATE LAB REPORT ================= */
export const createLabReport = async (req, res) => {
    try {
        const report = await LabReport.create({
            patient: req.body.patient || null,
            doctor: req.user.role === "doctor" ? req.user.id : (req.body.doctor || null),
            assignedTo: req.body.assignedTo || null,

            testType: req.body.testType,
            testName: req.body.testName,
            description: req.body.description,

            resultDetails: req.body.resultDetails,
            resultStatus: req.body.resultStatus,
            referenceRange: req.body.referenceRange,

            labName: req.body.labName,
            technicianName: req.body.technicianName,
            pdfFile: req.body.pdfFile,

            testDate: req.body.testDate,
            reportGeneratedDate: req.body.reportGeneratedDate,
            cost: req.body.cost,

            isVerified: req.body.isVerified || false,
            verifiedBy: req.body.verifiedBy || null,

            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Lab report created successfully",
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ================= GET ALL LAB REPORTS ================= */
export const getLabReports = async (req, res) => {
    try {
        const reports = await LabReport.find()
            .populate("patient", "name age gender profileImage")
            .populate("doctor", "name specialization profileImage")
            .populate("verifiedBy", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET SINGLE LAB REPORT ================= */
export const getLabReportById = async (req, res) => {
    try {
        const report = await LabReport.findById(req.params.id)
            .populate("patient", "name age gender mrn profileImage")
            .populate("doctor", "name specialization profileImage")
            .populate("verifiedBy", "name profileImage");

        if (!report)
            return res.status(404).json({ message: "Lab report not found" });

        res.status(200).json({ success: true, report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= UPDATE LAB REPORT ================= */
export const updateLabReport = async (req, res) => {
    try {
        const report = await LabReport.findById(req.params.id);
        if (!report)
            return res.status(404).json({ message: "Lab report not found" });

        Object.assign(report, req.body);
        await report.save();

        res.status(200).json({
            success: true,
            message: "Lab report updated",
            report
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= VERIFY LAB REPORT (DOCTOR) ================= */
export const verifyLabReport = async (req, res) => {
    try {
        const report = await LabReport.findById(req.params.id);
        if (!report)
            return res.status(404).json({ message: "Lab report not found" });

        report.isVerified = true;
        report.verifiedBy = req.user.id;
        report.resultStatus = req.body.resultStatus || report.resultStatus;
        report.reportGeneratedDate = new Date();

        await report.save();

        res.status(200).json({
            success: true,
            message: "Lab report verified",
            report
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= DELETE LAB REPORT ================= */
export const deleteLabReport = async (req, res) => {
    try {
        const report = await LabReport.findByIdAndDelete(req.params.id);
        if (!report)
            return res.status(404).json({ message: "Lab report not found" });

        res.status(200).json({
            success: true,
            message: "Lab report deleted"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
    try {
        const labId = req.user.id;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Run independent queries in parallel for maximum speed
        const [
            totalReports,
            completedReports,
            myTotalReports,
            statsBreakdown,
            todayReports,
            myPendingReports,
            recentReports
        ] = await Promise.all([
            LabReport.countDocuments().lean(),
            LabReport.countDocuments({ isVerified: true }).lean(),
            LabReport.countDocuments({ createdBy: labId }).lean(),
            LabReport.aggregate([
                { $group: { _id: "$resultStatus", count: { $sum: 1 } } }
            ]),
            LabReport.countDocuments({ createdAt: { $gte: startOfToday } }).lean(),
            LabReport.find({
                assignedTo: labId,
                isVerified: false
            }).populate("patient", "name age gender mrn profileImage")
                .populate("doctor", "name profileImage")
                .sort({ createdAt: 1 })
                .lean(),
            LabReport.find()
                .sort({ createdAt: -1 })
                .limit(6)
                .populate("patient", "name")
                .populate("doctor", "name")
                .lean()
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalReports,
                completedReports,
                todayReports,
                myTotalReports,
                breakdown: statsBreakdown
            },
            myPendingReports,
            recentReports
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ================= GET ALL PATIENTS (For Lab Selection) ================= */
export const getAllPatientsForLab = async (req, res) => {
    try {
        const patients = await Patient.find()
            .select("name age gender mrn phone patientType")
            .lean();
        res.status(200).json({ success: true, patients });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET ALL DOCTORS (For Lab Selection) ================= */
export const getAllDoctorsForLab = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select("name specialization")
            .lean();
        res.status(200).json({ success: true, doctors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET ALL LAB USERS (For Doctor Selection) ================= */
export const getAllLabs = async (req, res) => {
    try {
        const labs = await Lab.find()
            .select("name email phone")
            .lean();
        res.status(200).json({ success: true, labs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
