import express from "express";

import dashboardRoutes from "./dashboard.js";
import turfsRoutes from "./turfs.js";
import bookingsRoutes from "./bookings.js";
import slotsRoutes from "./slots.js";
import staffRoutes from "./staff.js";
import reviewsRoutes from "./reviews.js";
import promotionsRoutes from "./promotions.js";
import revenueRoutes from "./revenue.js";

const router = express.Router();

router.use("/dashboard", dashboardRoutes);
router.use("/turfs", turfsRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/slots", slotsRoutes);
router.use("/staff", staffRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/promotions", promotionsRoutes);
router.use("/revenue", revenueRoutes);

export default router;
