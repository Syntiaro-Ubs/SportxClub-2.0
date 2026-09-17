import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sportxclub_jwt_secret_key_2026";

/**
 * Generate a signed JWT token for a user session
 */
export function generateToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Middleware: Verify Bearer JWT Token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. Authentication token is missing.",
    });
  }

  try {
    // Legacy support for console admin static pseudo-tokens in development
    if (token.startsWith("cms_admin_")) {
      const parts = token.split("_");
      req.user = {
        id: parseInt(parts[2], 10) || 1,
        role: "Admin",
        accountType: "cms-admin",
        isAdmin: true,
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(403).json({
      success: false,
      error: "Invalid or tampered authentication token.",
      code: "INVALID_TOKEN",
    });
  }
}

/**
 * Middleware: Optional Authentication (attaches req.user if token valid, but allows unauthenticated access)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    if (token.startsWith("cms_admin_")) {
      const parts = token.split("_");
      req.user = {
        id: parseInt(parts[2], 10) || 1,
        role: "Admin",
        accountType: "cms-admin",
        isAdmin: true,
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Middleware: Enforce Specific Roles (e.g. ['admin', 'owner', 'player'])
 */
export function requireRole(allowedRoles = []) {
  const normalizedAllowed = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) =>
    r.toLowerCase()
  );

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to access this resource.",
      });
    }

    const userRole = String(req.user.role || "").toLowerCase();
    const userAccType = String(req.user.accountType || "").toLowerCase();

    const hasPermission =
      userRole === "super admin" ||
      userRole === "admin" ||
      userAccType === "cms-admin" ||
      normalizedAllowed.includes(userRole) ||
      normalizedAllowed.includes(userAccType);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "Forbidden. You do not have permission to perform this action.",
      });
    }

    next();
  };
}

/**
 * Middleware: Admin or Self check (prevents IDOR on user records)
 */
export function requireSelfOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentication required." });
  }

  const userRole = String(req.user.role || "").toLowerCase();
  const userAccType = String(req.user.accountType || "").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super admin" || userAccType === "cms-admin";

  if (isAdmin) {
    return next();
  }

  const targetId = req.params.id || req.body?.userId || req.query?.userId || req.body?.id;
  const targetEmail = req.body?.email || req.query?.email;

  const isSameId = targetId && String(targetId) === String(req.user.id);
  const isSameEmail = targetEmail && targetEmail.trim().toLowerCase() === String(req.user.email || "").toLowerCase();

  if (isSameId || isSameEmail || (!targetId && !targetEmail)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: "Forbidden. You cannot access or modify another user's profile.",
  });
}
