import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./Routes/adminRoutes.js";
import receptionistRoutes from "./Routes/receptionistRoutes.js";
import doctorRoutes from "./Routes/doctorRoutes.js";
import scannerRoutes from "./Routes/scannerRoutes.js";
import billerRoutes from "./Routes/billerRoutes.js";
import labRoutes from "./Routes/labRoutes.js";

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
app.use("/api/lab", labRoutes);


// ==========================================
// SERVE FRONTEND (SPA Support)
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build directory
// Adjust the path "../hospital-frontend/build" if your folder structure is different on Render
const frontendBuildPath = path.join(__dirname, "../hospital-frontend/build");
app.use(express.static(frontendBuildPath));

// Catch-all handler for any request that doesn't match an API route
// Sends index.html so React Router can handle the path
app.get(/(.*)/, (req, res) => {
  // If request is for API that doesn't exist, return 404 JSON instead of HTML
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }

  res.sendFile(path.resolve(frontendBuildPath, "index.html"), (err) => {
    if (err) {
      // Fallback if build not found
      res.status(500).send("Server Error: Frontend build not found. Please ensure hospital-frontend is built and deployed.");
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});

export default app;
