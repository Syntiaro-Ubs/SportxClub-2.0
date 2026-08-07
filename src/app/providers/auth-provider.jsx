import { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "../services/admin-api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load logged in user from local storage on mount
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = async (email, password) => {
    try {
      // 1. Try MySQL API endpoint first
      const res = await adminApi.login(email, password);
      if (res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", user.fullName ? user.fullName.split(" ")[0] : "User");
        return { success: true, user };
      }
    } catch (e) {
      console.warn("Backend login failed, attempting local fallback:", e);
    }

    // 2. Local fallback
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user && (email === "admin@sportxclub.com" && password === "admin123")) {
      user = {
        id: "admin-1",
        fullName: "System Admin",
        email: "admin@sportxclub.com",
        role: "admin",
      };
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.fullName ? user.fullName.split(" ")[0] : "User");
      return { success: true, user };
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
        const user = res.user;
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", user.fullName ? user.fullName.split(" ")[0] : "User");
        return { success: true, user, isNewUser: res.isNewUser };
      }
      return { success: false, error: res.error || "Google login failed" };
    } catch (e) {
      console.error("loginWithGoogle error:", e);
      return { success: false, error: e.message };
    }
  };

  const register = async (userData) => {
    try {
      // 1. Try MySQL API endpoint first
      const res = await adminApi.register(userData);
      if (res.success && res.user) {
        const newUser = res.user;
        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", newUser.fullName ? newUser.fullName.split(" ")[0] : "User");
        return { success: true, user: newUser };
      } else if (res.error) {
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn("Backend register failed, using local fallback:", e);
    }

    // Local fallback
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", newUser.fullName ? newUser.fullName.split(" ")[0] : "User");

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
  };

  const updateUser = (updatedData) => {
    if (!currentUser) return { success: false, error: "No user logged in" };
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    if (updatedData.fullName) {
      localStorage.setItem("userName", updatedData.fullName.split(" ")[0]);
    }
    return { success: true, user: updatedUser };
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, loginWithGoogle, register, logout, updateUser }}>
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
