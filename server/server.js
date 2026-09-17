import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin-routes.js";
import turfRoutes from "./routes/turf/index.js";
import cmsRoutes from "./routes/cms/index.js";
import profileRoutes from "./routes/profile.js";
import aiAssistantRoutes from "./routes/ai-assistant.js";
import cashfreeRoutes from "./payment/cashfree-routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

// Apply HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

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
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Unauthorized origin"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rate limiters for brute-force & denial-of-service protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many authentication requests. Please try again in 15 minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many OTP requests. Please wait a few minutes before trying again." },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/otp", otpLimiter);
app.use("/api/cms/auth/login", authLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);
app.use("/api/payment/cashfree", cashfreeRoutes);
app.use("/api/payment", cashfreeRoutes);
app.use("/api/turf", turfRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", adminRoutes);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, "../dist")));
app.use((req, res) => {
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
