import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Import Routes
import adminRoutes from "./routes/adminRoutes.js";
import receptionistRoutes from "./routes/receptionistRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import billerRoutes from"./Routes/billerRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection (using .env)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/biller", billerRoutes);

app.get("/", (req, res) => res.send("🏥 Hospital Management API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


app.use("/pdfs", express.static("pdfs"));

export default app;
