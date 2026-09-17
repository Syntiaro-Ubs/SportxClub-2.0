import express from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.js";

import authRoutes from "./auth.js";
import sectionsRoutes from "./sections.js";
import bannersRoutes from "./banners.js";
import sportsRoutes from "./sports.js";
import testimonialsRoutes from "./testimonials.js";
import faqsRoutes from "./faqs.js";
import facilitiesRoutes from "./facilities.js";
import offersRoutes from "./offers.js";
import galleryRoutes from "./gallery.js";
import whyCardsRoutes from "./why_cards.js";
import eventsRoutes from "./events.js";
import postsRoutes from "./posts.js";
import teamRoutes from "./team.js";

const router = express.Router();

// Allow public auth endpoints (login)
router.use("/auth", authRoutes);

// Protect all write/delete operations on CMS content with admin auth
router.use((req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  return authenticateToken(req, res, () => {
    return requireRole(["admin", "super admin", "cms-admin"])(req, res, next);
  });
});

router.use("/sections", sectionsRoutes);
router.use("/banners", bannersRoutes);
router.use("/sports", sportsRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/faqs", faqsRoutes);
router.use("/facilities", facilitiesRoutes);
router.use("/offers", offersRoutes);
router.use("/gallery", galleryRoutes);
router.use("/why-cards", whyCardsRoutes);
router.use("/events", eventsRoutes);
router.use("/posts", postsRoutes);
router.use("/team", teamRoutes);

export default router;
