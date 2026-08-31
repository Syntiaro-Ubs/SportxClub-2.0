import { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "../services/admin-api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [playerUser, setPlayerUser] = useState(() => {
    try {
      const saved = localStorage.getItem("playerUser");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [turfOwnerUser, setTurfOwnerUser] = useState(() => {
    try {
      const saved = localStorage.getItem("turfOwnerUser");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [cmsAdminUser, setCmsAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cmsAdminUser");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Track location path for session selection
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== "undefined" ? window.location.pathname : "";
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Determine current active user based on URL path
  const getCurrentUser = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : currentPath;
    if (path.startsWith("/admin-panel") || path.startsWith("/admin-login") || path.startsWith("/owner")) {
      return turfOwnerUser;
    }
    if (path.startsWith("/dashboard")) {
      return cmsAdminUser;
    }
    // Main website ONLY returns playerUser (so turf owner accounts never auto-login on player site)
    return playerUser;
  };

  const currentUser = getCurrentUser();

  const login = async (email, password, accountType = "player") => {
    try {
      const res = await adminApi.login(email, password, accountType);
      if (res.success && res.user) {
        const targetType = res.user.accountType || accountType;
        const userObj = { ...res.user, accountType: targetType };

        if (targetType === "turf-owner" || accountType === "turf-owner") {
          setTurfOwnerUser(userObj);
          localStorage.setItem("turfOwnerUser", JSON.stringify(userObj));
        } else if (targetType === "cms-admin" || accountType === "cms-admin") {
          setCmsAdminUser(userObj);
          localStorage.setItem("cmsAdminUser", JSON.stringify(userObj));
        } else {
          setPlayerUser(userObj);
          localStorage.setItem("playerUser", JSON.stringify(userObj));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userName", userObj.fullName ? userObj.fullName.split(" ")[0] : "User");
        }
        return { success: true, user: userObj };
      }
    } catch (e) {
      console.warn("Backend login failed, attempting local fallback:", e);
    }

    if (accountType !== "player") {
      return { success: false, error: "This account type must be authenticated by the database." };
    }

    // Local fallback for player-only offline development
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      const playerObj = { ...user, accountType: "player" };
      setPlayerUser(playerObj);
      localStorage.setItem("playerUser", JSON.stringify(playerObj));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", playerObj.fullName ? playerObj.fullName.split(" ")[0] : "User");
      return { success: true, user: playerObj };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const loginWithGoogle = async (googlePayload = {}) => {
    try {
      let email = typeof googlePayload === "string" ? "google.user@gmail.com" : (googlePayload.email || "google.user@gmail.com");
      let fullName = typeof googlePayload === "string" ? "Google User" : (googlePayload.fullName || "Google User");
      let role = typeof googlePayload === "object" && googlePayload.role ? googlePayload.role : (googlePayload === "owner" ? "owner" : "player");
      let avatar = typeof googlePayload === "object" ? googlePayload.avatar : null;

      const res = await adminApi.googleAuth({
        email,
        fullName,
        avatar,
        role,
      });

      if (res.success && res.user) {
        const targetType = res.user.accountType || (role === "owner" ? "turf-owner" : "player");
        const userObj = { ...res.user, accountType: targetType };

        if (targetType === "turf-owner" || role === "owner") {
          setTurfOwnerUser(userObj);
          localStorage.setItem("turfOwnerUser", JSON.stringify(userObj));
        } else {
          setPlayerUser(userObj);
          localStorage.setItem("playerUser", JSON.stringify(userObj));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userName", userObj.fullName ? userObj.fullName.split(" ")[0] : "User");
        }
        return { success: true, user: userObj, isNewUser: res.isNewUser };
      }
      return { success: false, error: res.error || "Google login failed" };
    } catch (e) {
      console.error("loginWithGoogle error:", e);
      return { success: false, error: e.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await adminApi.register(userData);
      if (res.success && res.user) {
        const targetType = res.user.accountType || (userData.role === "owner" ? "turf-owner" : "player");
        const newUserObj = { ...res.user, accountType: targetType };

        if (targetType === "turf-owner" || userData.role === "owner") {
          setTurfOwnerUser(newUserObj);
          localStorage.setItem("turfOwnerUser", JSON.stringify(newUserObj));
        } else {
          setPlayerUser(newUserObj);
          localStorage.setItem("playerUser", JSON.stringify(newUserObj));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userName", newUserObj.fullName ? newUserObj.fullName.split(" ")[0] : "User");
        }
        return { success: true, user: newUserObj };
      } else if (res.error) {
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn("Backend register failed, using local fallback:", e);
    }

    if (userData.role === "owner") {
      return { success: false, error: "Turf-owner accounts must be created in the database." };
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUserObj = {
      ...userData,
      id: Date.now().toString(),
      accountType: "player",
    };

    users.push(newUserObj);
    localStorage.setItem("users", JSON.stringify(users));

    setPlayerUser(newUserObj);
    localStorage.setItem("playerUser", JSON.stringify(newUserObj));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", newUserObj.fullName ? newUserObj.fullName.split(" ")[0] : "User");

    return { success: true, user: newUserObj };
  };

  const logout = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.startsWith("/admin-panel") || path.startsWith("/admin-login") || path.startsWith("/owner")) {
      setTurfOwnerUser(null);
      localStorage.removeItem("turfOwnerUser");
    } else if (path.startsWith("/dashboard")) {
      setCmsAdminUser(null);
      localStorage.removeItem("cmsAdminUser");
    } else {
      setPlayerUser(null);
      localStorage.removeItem("playerUser");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
    }
  };

  const logoutOwner = () => {
    setTurfOwnerUser(null);
    localStorage.removeItem("turfOwnerUser");
  };

  const updateUser = async (updatedData) => {
    const active = currentUser;
    if (!active) return { success: false, error: "No user logged in" };
    const mergedUser = { ...active, ...updatedData };

    try {
      const payload = {
        id: active.id,
        email: active.email,
        ...updatedData,
      };
      const res = await adminApi.updateProfile(payload);
      if (res.success && res.user) {
        const finalUser = { ...mergedUser, ...res.user };
        if (finalUser.accountType === "turf-owner" || finalUser.role === "owner") {
          setTurfOwnerUser(finalUser);
          localStorage.setItem("turfOwnerUser", JSON.stringify(finalUser));
        } else {
          setPlayerUser(finalUser);
          localStorage.setItem("playerUser", JSON.stringify(finalUser));
        }
        return { success: true, user: finalUser };
      }
    } catch (e) {
      console.warn("Backend profile update failed, using local state update:", e);
    }

    if (mergedUser.accountType === "turf-owner" || mergedUser.role === "owner") {
      setTurfOwnerUser(mergedUser);
      localStorage.setItem("turfOwnerUser", JSON.stringify(mergedUser));
    } else {
      setPlayerUser(mergedUser);
      localStorage.setItem("playerUser", JSON.stringify(mergedUser));
    }
    return { success: true, user: mergedUser };
  };

  const deleteAccount = async () => {
    const active = currentUser;
    if (!active) return { success: false, error: "No active user logged in" };

    try {
      const res = await fetch("/api/profile/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: active.id, email: active.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete account from database");
      }
    } catch (e) {
      console.warn("Backend account delete note:", e.message);
    }

    // Clean up local storage and session
    setPlayerUser(null);
    localStorage.removeItem("playerUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");

    // Also remove from local saved Google accounts if present
    try {
      const existing = JSON.parse(localStorage.getItem("sportx_local_google_accounts") || "[]");
      const updated = existing.filter((a) => a.email?.toLowerCase() !== active.email?.toLowerCase());
      localStorage.setItem("sportx_local_google_accounts", JSON.stringify(updated));
    } catch (e) {}

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ currentUser, playerUser, turfOwnerUser, cmsAdminUser, login, loginWithGoogle, register, logout, logoutOwner, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
