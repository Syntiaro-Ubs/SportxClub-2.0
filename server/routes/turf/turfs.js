import express from "express";
import { getPool } from "../../db.js";
import { authenticateToken, requireRole, optionalAuth } from "../../middleware/auth.js";

const router = express.Router();

async function filterTurfColumns(pool, rawBody) {
  const [columns] = await pool.query("SHOW COLUMNS FROM `turfs`");
  const validColNames = new Set(columns.map(c => c.Field));
  const filtered = {};
  for (const key of Object.keys(rawBody)) {
    if (key === 'id' || key === 'created_at') continue;
    if (validColNames.has(key)) {
      let val = rawBody[key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      filtered[key] = val;
    }
  }
  return filtered;
}

const KNOWN_CITIES = [
  'Pune', 'Mumbai', 'Delhi-NCR', 'Delhi', 'Bengaluru', 'Bangalore',
  'Hyderabad', 'Chandigarh', 'Ahmedabad', 'Chennai', 'Kolkata', 'Kochi',
  'Nagpur', 'Nashik', 'Surat', 'Jaipur', 'Lucknow', 'Indore', 'Bhopal', 'Pimpri-Chinchwad'
];

function extractCityAndSubLocation(locationRaw) {
  if (!locationRaw) return null;
  let raw = '';
  if (typeof locationRaw === 'object' && locationRaw !== null) {
    const city = locationRaw.city || locationRaw.town || '';
    const area = locationRaw.area || locationRaw.locality || locationRaw.suburb || locationRaw.address || '';
    raw = [area, city].filter(Boolean).join(', ');
  } else {
    raw = String(locationRaw).trim();
  }
  raw = raw.replace(/^["']+|["']+$/g, '').trim();
  if (!raw || raw.toLowerCase() === 'test' || raw.toLowerCase() === 'unknown location' || raw.toLowerCase() === 'null') return null;

  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
  let detectedCity = '';
  let subArea = '';

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const matchedKnown = KNOWN_CITIES.find(c => {
      const cNorm = c.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pNorm = part.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cNorm === pNorm || (pNorm.includes(cNorm) && pNorm.length <= cNorm.length + 4);
    });

    if (matchedKnown) {
      detectedCity = matchedKnown;
      const remainingParts = parts.filter((_, idx) => idx !== i);
      if (remainingParts.length > 0) {
        let areaCandidate = remainingParts[0];
        const cityRegex = new RegExp('\\b' + detectedCity + '\\b', 'gi');
        areaCandidate = areaCandidate.replace(cityRegex, '').replace(/\s+/g, ' ').trim();
        if (areaCandidate.length > 1) {
          subArea = areaCandidate;
        }
      }
      break;
    }
  }

  if (!detectedCity && parts.length > 1) {
    detectedCity = parts[parts.length - 1];
    let areaCandidate = parts[0];
    const cityRegex = new RegExp('\\b' + detectedCity + '\\b', 'gi');
    areaCandidate = areaCandidate.replace(cityRegex, '').replace(/\s+/g, ' ').trim();
    if (areaCandidate.length > 1) {
      subArea = areaCandidate;
    }
  } else if (!detectedCity && parts.length === 1) {
    detectedCity = parts[0];
  }

  const formatTitle = (s) => s.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  if (detectedCity) {
    let standardizedCity = detectedCity.trim();
    if (standardizedCity.toLowerCase() === 'bangalore' || standardizedCity.toLowerCase() === 'bengaluru') {
      standardizedCity = 'Bengaluru';
    } else if (standardizedCity.toLowerCase() === 'delhi' || standardizedCity.toLowerCase() === 'delhi-ncr' || standardizedCity.toLowerCase() === 'delhi ncr') {
      standardizedCity = 'Delhi-NCR';
    } else {
      standardizedCity = formatTitle(standardizedCity);
    }

    return {
      city: standardizedCity,
      area: subArea ? formatTitle(subArea) : null
    };
  }
  return null;
}

// GET /api/turf/turfs/cities - Get all unique onboarded turf cities and dynamic sub-locations (Public)
router.get("/cities", async (req, res) => {
  try {
    const pool = getPool();
    const citySet = new Set();
    const subLocationsMap = {};

    const addLocation = (locRaw) => {
      const parsed = extractCityAndSubLocation(locRaw);
      if (!parsed || !parsed.city) return;
      const { city, area } = parsed;
      citySet.add(city);
      if (!subLocationsMap[city]) {
        subLocationsMap[city] = new Set();
      }
      if (area && area.toLowerCase() !== city.toLowerCase()) {
        subLocationsMap[city].add(area);
      }
    };

    // 1. Fetch locations from actual turfs table (primary source for available turfs)
    const [turfRows] = await pool.query(
      "SELECT location FROM turfs WHERE location IS NOT NULL AND location != ''"
    );
    for (const row of turfRows) {
      addLocation(row.location);
    }

    // 2. Fetch cities from turf_owners
    const [ownerRows] = await pool.query(
      "SELECT city, setup_data FROM turf_owners"
    );
    for (const row of ownerRows) {
      if (row.city) addLocation(row.city);
      if (row.setup_data) {
        try {
          const parsed = typeof row.setup_data === 'string' ? JSON.parse(row.setup_data) : row.setup_data;
          if (parsed?.location) addLocation(parsed.location);
        } catch (e) {
          // ignore parse error
        }
      }
    }

    // Clean, format in Title Case, filter out invalid names, and remove duplicates
    const ignoreWords = ["unknown location", "location not specified", "test", "null", "undefined", "n/a", "none", "string"];
    const formattedCities = Array.from(citySet)
      .filter(c => c.length > 1 && !/^\d+$/.test(c) && !ignoreWords.includes(c.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));

    const finalSubLocations = {};
    for (const city of formattedCities) {
      const areaSet = subLocationsMap[city] || new Set();
      const validAreas = Array.from(areaSet)
        .filter(a => a && a.length > 1 && a.toLowerCase() !== city.toLowerCase() && !ignoreWords.includes(a.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

      if (validAreas.length > 0) {
        finalSubLocations[city] = [`All ${city}`, ...validAreas];
      } else {
        finalSubLocations[city] = [`All ${city}`];
      }
    }

    return res.json({ success: true, cities: formattedCities, subLocations: finalSubLocations });
  } catch (err) {
    console.error("Fetch Turf Cities Error:", err);
    return res.status(500).json({ success: false, error: err.message, cities: [], subLocations: {} });
  }
});

// GET /api/turf/turfs/sports-popularity - Get booking counts per sport for dynamic ranking
router.get("/sports-popularity", async (req, res) => {
  try {
    const pool = getPool();
    let rawCity = (req.query.city || "All Cities").trim();
    let isAll = false;
    if (!rawCity || rawCity.toLowerCase() === "all cities" || rawCity.toLowerCase() === "all" || rawCity.toLowerCase() === "all areas") {
      isAll = true;
    }

    let searchTerms = [];
    if (!isAll) {
      let cleanCity = rawCity;
      if (cleanCity.toLowerCase().startsWith("all ")) {
        cleanCity = cleanCity.replace(/^all\s+/i, "").trim();
      }
      const parts = cleanCity.split(/[,•;/|]+/).map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        if (p.length > 1 && !["all", "cities", "areas"].includes(p.toLowerCase())) {
          searchTerms.push(p.toLowerCase());
        }
      });
      if (cleanCity.length > 1 && !searchTerms.includes(cleanCity.toLowerCase())) {
        searchTerms.push(cleanCity.toLowerCase());
      }
    }

    let query = `
      SELECT 
        LOWER(TRIM(COALESCE(NULLIF(TRIM(b.sport), ''), NULLIF(TRIM(t.sport_type), ''), 'Football'))) as sport_name,
        COUNT(*) as booking_count
      FROM bookings b
      LEFT JOIN turfs t ON (b.turf_id = t.id OR LOWER(TRIM(b.turf_name)) = LOWER(TRIM(t.name)))
      WHERE (b.status IS NULL OR LOWER(b.status) != 'cancelled')
    `;
    const params = [];

    if (searchTerms.length > 0) {
      const conditions = searchTerms.map(() => `(LOWER(t.location) LIKE ? OR LOWER(b.turf_name) LIKE ?)`).join(" OR ");
      query += ` AND (${conditions})`;
      searchTerms.forEach(term => {
        params.push(`%${term}%`, `%${term}%`);
      });
    }

    query += ` GROUP BY LOWER(TRIM(COALESCE(NULLIF(TRIM(b.sport), ''), NULLIF(TRIM(t.sport_type), ''), 'Football'))) ORDER BY booking_count DESC`;

    const [rows] = await pool.query(query, params);

    const sportCounts = {};
    for (const r of rows) {
      if (r.sport_name) {
        const raw = String(r.sport_name).toLowerCase();
        const subSports = raw.split(/[,•;/]+/).map(s => s.trim()).filter(Boolean);
        const count = Number(r.booking_count) || 1;
        for (const sp of subSports) {
          sportCounts[sp] = (sportCounts[sp] || 0) + count;
          if (sp.includes("cricket") && sp !== "cricket") {
            sportCounts["cricket"] = (sportCounts["cricket"] || 0) + count;
          }
        }
      }
    }

    return res.json({
      success: true,
      city: req.query.city || "All Cities",
      sportCounts
    });
  } catch (err) {
    console.error("Fetch Sports Popularity Error:", err);
    return res.status(500).json({ success: false, error: err.message, sportCounts: {} });
  }
});

async function syncApprovedTurfOwners(pool) {
  try {
    const [owners] = await pool.query(
      "SELECT id, owner_id, name, email, phone, city, status, setup_data FROM turf_owners WHERE setup_data IS NOT NULL AND status IN ('Approved', 'Active', 'approved', 'active')"
    );

    for (const owner of owners) {
      let setupData = {};
      try {
        let parsed = owner.setup_data;
        while (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch { break; }
        }
        if (parsed && typeof parsed === 'object') setupData = parsed;
      } catch (e) {}

      const turfName = setupData.turf?.name || setupData.business?.businessName;
      if (!turfName) continue;

      const ownerEmail = owner.email || setupData.personal?.email || setupData.business?.email || "";
      const ownerName = setupData.personal?.fullName || setupData.business?.ownerName || owner.name || "Turf Owner";
      const ownerPhone = setupData.personal?.phone || setupData.business?.phone || owner.phone || "";
      const turfLocation = [setupData.location?.address, setupData.location?.city, setupData.location?.state].filter(Boolean).join(", ") || setupData.location?.city || owner.city || "Location not specified";
      const sportType = Array.isArray(setupData.turf?.sports) ? setupData.turf.sports.join(", ") : (setupData.turf?.sports || "Football");
      const pricePerHour = Number(setupData.pricing?.weekdayPrice || setupData.pricing?.standardPrice || 1200);
      const weekendPrice = Number(setupData.pricing?.weekendPrice || Math.round(pricePerHour * 1.2));
      const openingTime = setupData.pricing?.openingTime || setupData.pricing?.openTime || "06:00 AM";
      const closingTime = setupData.pricing?.closingTime || setupData.pricing?.closeTime || "11:00 PM";
      const slotDuration = parseInt(setupData.pricing?.slotDuration) || 60;
      const peakStartTime = setupData.pricing?.peakStartTime || "05:00 PM";
      const peakEndTime = setupData.pricing?.peakEndTime || "11:00 PM";
      const peakPrice = setupData.pricing?.peakPrice ? Number(setupData.pricing.peakPrice) : null;
      const operationalDays = Array.isArray(setupData.pricing?.operationalDays)
        ? JSON.stringify(setupData.pricing.operationalDays)
        : (setupData.pricing?.operationalDays || "Mon,Tue,Wed,Thu,Fri,Sat,Sun");

      const description = setupData.turf?.description || "High quality sports turf with professional amenities.";
      const facilitiesRaw = setupData.location?.facilities || setupData.turf?.facilities || setupData.facilities || [];
      const amenities = Array.isArray(facilitiesRaw) ? JSON.stringify(facilitiesRaw) : (typeof facilitiesRaw === 'string' ? facilitiesRaw : "[]");
      const rules = setupData.turf?.rules || "Please wear appropriate footwear. Respect all turf property.";

      const coverImage = setupData.images?.cover?.data || setupData.images?.cover?.url || (typeof setupData.images?.cover === 'string' ? setupData.images.cover : null) || (Array.isArray(setupData.images?.turf) ? (setupData.images.turf[0]?.data || setupData.images.turf[0]?.url || setupData.images.turf[0]) : null);

      let galleryList = [];
      if (Array.isArray(setupData.images?.gallery) && setupData.images.gallery.length > 0) {
        galleryList = setupData.images.gallery
          .map(g => (typeof g === 'object' && g !== null ? (g.data || g.url) : g))
          .filter(Boolean);
      }
      if (coverImage && !galleryList.includes(coverImage)) {
        galleryList = [coverImage, ...galleryList];
      }
      if (galleryList.length === 0 && coverImage) {
        galleryList = [coverImage];
      }

      const [existing] = await pool.query(
        "SELECT id, image_url, gallery, opening_time, closing_time, amenities FROM turfs WHERE (owner_email IS NOT NULL AND LOWER(owner_email) = LOWER(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
        [ownerEmail, turfName]
      );

      if (existing.length > 0) {
        const updateImg = coverImage || existing[0].image_url;
        const updateGal = galleryList.length > 0 ? JSON.stringify(galleryList) : existing[0].gallery;
        await pool.query(
          `UPDATE turfs SET 
            name = ?, 
            location = ?, 
            sport_type = ?, 
            price_per_hour = ?, 
            weekend_price = ?,
            opening_time = ?,
            closing_time = ?,
            slot_duration = ?,
            peak_start_time = ?,
            peak_end_time = ?,
            peak_price = ?,
            operational_days = ?,
            image_url = ?, 
            gallery = ?, 
            description = ?, 
            amenities = ?, 
            rules = ?, 
            owner_name = ?, 
            owner_email = ?, 
            owner_phone = ?, 
            status = 'Active' 
          WHERE id = ?`,
          [
            turfName, 
            turfLocation, 
            sportType, 
            pricePerHour, 
            weekendPrice,
            openingTime,
            closingTime,
            slotDuration,
            peakStartTime,
            peakEndTime,
            peakPrice,
            operationalDays,
            updateImg, 
            updateGal, 
            description, 
            amenities, 
            rules, 
            ownerName, 
            ownerEmail, 
            ownerPhone, 
            existing[0].id
          ]
        );
      } else if (coverImage || turfName) {
        await pool.query(
          `INSERT INTO turfs 
            (name, location, sport_type, price_per_hour, weekend_price, opening_time, closing_time, slot_duration, peak_start_time, peak_end_time, peak_price, operational_days, rating, reviews, status, owner_name, owner_email, owner_phone, image_url, gallery, description, amenities, rules)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, 'Active', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            turfName, 
            turfLocation, 
            sportType, 
            pricePerHour, 
            weekendPrice,
            openingTime,
            closingTime,
            slotDuration,
            peakStartTime,
            peakEndTime,
            peakPrice,
            operationalDays,
            ownerName, 
            ownerEmail, 
            ownerPhone, 
            coverImage || "/assets/venues/turf-1.webp", 
            JSON.stringify(galleryList), 
            description, 
            amenities, 
            rules
          ]
        );
      }
    }
  } catch (err) {
    console.error("Auto sync approved turf owners error:", err);
  }
}

// GET /api/turf/turfs - Get all turfs (Public) with dynamic reviews & rating
router.get("/", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    const pool = getPool();
    await syncApprovedTurfOwners(pool);
    const [rows] = await pool.query(`
      SELECT t.*, 
        COALESCE(r.review_count, t.reviews, 0) AS reviews,
        CASE 
          WHEN r.review_count > 0 THEN ROUND(r.avg_rating, 2)
          WHEN t.reviews > 0 AND t.rating > 0 THEN t.rating
          ELSE 0.00
        END AS rating
      FROM turfs t
      LEFT JOIN (
        SELECT turf_name, COUNT(*) AS review_count, AVG(rating) AS avg_rating 
        FROM reviews 
        GROUP BY turf_name
      ) r ON LOWER(TRIM(r.turf_name)) = LOWER(TRIM(t.name))
      ORDER BY t.id DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Turfs Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turf/turfs/:id - Get turf by ID (Public) with dynamic reviews & rating
router.get("/:id", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    const pool = getPool();
    await syncApprovedTurfOwners(pool);
    const [rows] = await pool.query(`
      SELECT t.*, 
        COALESCE(r.review_count, t.reviews, 0) AS reviews,
        CASE 
          WHEN r.review_count > 0 THEN ROUND(r.avg_rating, 2)
          WHEN t.reviews > 0 AND t.rating > 0 THEN t.rating
          ELSE 0.00
        END AS rating
      FROM turfs t
      LEFT JOIN (
        SELECT turf_name, COUNT(*) AS review_count, AVG(rating) AS avg_rating 
        FROM reviews 
        GROUP BY turf_name
      ) r ON LOWER(TRIM(r.turf_name)) = LOWER(TRIM(t.name))
      WHERE t.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Turf not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Fetch Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/turfs - Add a new turf (Protected: Owner / Admin)
router.post("/", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const body = await filterTurfColumns(pool, req.body);
    if (body.rating === undefined || body.rating === null) body.rating = 0;
    if (body.reviews === undefined || body.reviews === null) body.reviews = 0;
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid turf fields provided" });
    }

    const values = Object.values(body);
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.map(k => `\`${k}\``).join(", ");

    const sql = `INSERT INTO turfs (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);

    const [inserted] = await pool.query("SELECT * FROM turfs WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/turfs/:id - Update turf details (Protected: Owner / Admin)
router.put("/:id", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const body = await filterTurfColumns(pool, req.body);
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" });
    }

    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    const values = [...Object.values(body), id];

    await pool.query(`UPDATE turfs SET ${setClause} WHERE id = ?`, values);
    const [updated] = await pool.query("SELECT * FROM turfs WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/turfs/:id - Delete a turf (Protected: Admin / Owner)
router.delete("/:id", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM turfs WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
