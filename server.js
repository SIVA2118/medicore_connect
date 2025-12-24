import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import adminRoutes from "./routes/adminRoutes.js";
import receptionistRoutes from "./routes/receptionistRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import billerRoutes from "./routes/billerRoutes.js";

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

app.use(express.json());
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

/* ================= LOCAL SERVER ================= */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running on port ${PORT}`);
    connectDB(); // Ensure connectDB is called here for local development startup log
  });
}

export default app;
