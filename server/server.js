import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

import express from "express";
import cors from "cors";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin-routes.js";
import turfRoutes from "./routes/turf/index.js";
import cmsRoutes from "./routes/cms/index.js";
import profileRoutes from "./routes/profile.js";
import aiAssistantRoutes from "./routes/ai-assistant.js";
import payuRoutes from "./payment/payu-routes.js";


const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

const allowedOrigins = [
  process.env.APP_FRONTEND_URL,
  "https://sportxclub.com",
  "https://www.sportxclub.com",
  "http://sportxclub.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server callbacks)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, configurable for production
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);
app.use("/api/payment/payu", payuRoutes);
app.use("/api/payment", payuRoutes);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api/turf", turfRoutes);
app.use("/api/cms", cmsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
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
