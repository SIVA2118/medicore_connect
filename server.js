import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import adminRoutes from "./Routes/adminRoutes.js";
import receptionistRoutes from "./Routes/receptionistRoutes.js";
import doctorRoutes from "./Routes/doctorRoutes.js";
import scannerRoutes from "./Routes/scannerRoutes.js";
import billerRoutes from "./Routes/billerRoutes.js";

import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

/* ================= DATABASE & MIDDLEWARE ================= */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database Connection Error" });
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(cors());

/* ================= ROUTES ================= */
app.use("/api/admin", adminRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/biller", billerRoutes);

app.get("/", (req, res) => {
  res.send("🏥 Hospital Management API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});

export default app;
