import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../providers/auth-provider";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("sportx_cms_token")
      : null;
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  // Check if session exists in memory, sessionStorage, or localStorage
  const activeUser =
    currentUser ||
    (() => {
      try {
        return (
          JSON.parse(sessionStorage.getItem("sportx_cms_user") || "null") ||
          JSON.parse(localStorage.getItem("cmsAdminUser") || "null") ||
          JSON.parse(localStorage.getItem("turfOwnerUser") || "null") ||
          JSON.parse(localStorage.getItem("playerUser") || "null")
        );
      } catch {
        return null;
      }
    })();

  if (!activeUser && !token) {
    // Redirect to relevant login page based on attempted path
    const loginTarget = location.pathname.startsWith("/site-maker") || location.pathname.startsWith("/dashboard")
      ? "/dashboard/login"
      : location.pathname.startsWith("/owner") || location.pathname.startsWith("/admin-panel")
      ? "/admin-login"
      : "/login";

    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (normalizedAllowed.length > 0 && activeUser) {
    const userRole = String(activeUser.role || "").toLowerCase();
    const userAccType = String(activeUser.accountType || "").toLowerCase();

    const isAuthorized =
      userRole === "admin" ||
      userRole === "super admin" ||
      userAccType === "cms-admin" ||
      normalizedAllowed.includes(userRole) ||
      normalizedAllowed.includes(userAccType);

    if (!isAuthorized) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
