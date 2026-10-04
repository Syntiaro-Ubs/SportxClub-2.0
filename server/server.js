import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { initDatabase, getPool } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin-routes.js";
import turfRoutes from "./routes/turf/index.js";
import { syncApprovedTurfOwners } from "./routes/turf/turfs.js";
import cmsRoutes from "./routes/cms/index.js";
import profileRoutes from "./routes/profile.js";
import aiAssistantRoutes from "./routes/ai-assistant.js";
import cashfreeRoutes from "./payment/cashfree-routes.js";
import settlementsRoutes from "./routes/settlements.js";
import { startMidnightPayoutScheduler } from "./services/payout-cron-service.js";
import { startBookingStatusScheduler, syncCompletedBookings } from "./services/booking-slot-service.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

// Enable Gzip / Deflate compression for all responses (JS/CSS/JSON/HTML)
app.use(compression());

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
app.use("/api/settlements", settlementsRoutes);
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

// ===== SEO: Dynamic Sitemap.xml =====
app.get("/sitemap.xml", async (req, res) => {
  try {
    const pool = getPool();

    // Fetch all active turf venues from DB
    let venueUrls = "";
    try {
      const [turfs] = await pool.execute(
        "SELECT id, name, updated_at FROM turfs WHERE status = 'active' OR status = 'approved' OR status IS NULL LIMIT 1000"
      );
      venueUrls = turfs
        .map((t) => {
          const lastmod = t.updated_at
            ? new Date(t.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];
          return `
  <url>
    <loc>https://www.sportxclub.in/venues/${t.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        })
        .join("");
    } catch (dbErr) {
      console.warn("Sitemap: Could not fetch turfs from DB:", dbErr.message);
    }

    const today = new Date().toISOString().split("T")[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.sportxclub.in/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/venues</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/tournaments</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/community</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/ai-assistant</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.sportxclub.in/refund-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>${venueUrls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // cache for 1 hour
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// ===== SEO: robots.txt fallback (static file is served by express.static first) =====
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin-panel/
Disallow: /site-maker/
Disallow: /dashboard/
Disallow: /player-dashboard/
Disallow: /login
Disallow: /register
Disallow: /payment-status

Sitemap: https://www.sportxclub.in/sitemap.xml`);
});


// Serve frontend in production with optimized cache headers
app.use(
  express.static(path.join(__dirname, "../dist"), {
    maxAge: "1y",
    immutable: true,
    setHeaders: (res, filePath) => {
      // index.html should not be cached long term so new deploys are picked up immediately
      if (filePath.endsWith("index.html") || filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  })
);

app.use((req, res) => {
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

async function startServer() {
  try {
    await initDatabase();

    // Initial background sync for approved turf owners once on server boot
    try {
      const pool = getPool();
      await syncApprovedTurfOwners(pool);
      console.log("Turf owners initial sync completed.");
      // Auto-complete any concluded bookings that ended in the past
      await syncCompletedBookings(pool);
    } catch (syncErr) {
      console.warn("Initial turf sync warning:", syncErr.message);
    }
    
    // Start automated 12:00 AM Midnight Turf Payout Cron Scheduler
    startMidnightPayoutScheduler();

    // Start automated 15-minute booking lifecycle status monitor (Confirmed -> Completed)
    startBookingStatusScheduler();

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
