import 'dotenv/config';
import express from "express";
import cors from "cors";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin-routes.js";
import turfRoutes from "./routes/turf/index.js";
import cmsRoutes from "./routes/cms/index.js";
import profileRoutes from "./routes/profile.js";
import aiAssistantRoutes from "./routes/ai-assistant.js";
import phonepeRoutes from "./payment/phonepe-routes.js";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);
app.use("/api/payment/phonepe", phonepeRoutes);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api/turf", turfRoutes);
app.use("/api/cms", cmsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`Backend Server running on http://localhost:${PORT}`);
      console.log(`Connected & auto-synced with MySQL!`);
      console.log(`=================================`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
