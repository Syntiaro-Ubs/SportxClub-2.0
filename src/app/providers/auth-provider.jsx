import { createContext, useContext, useState, useEffect } from "react";

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

  const login = (email, password) => {
    // Mock login by checking local storage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if user already exists
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    // Auto login after registration
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
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
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUser = { ...currentUser, ...updatedData };
    
    // Update in users array
    const updatedUsers = users.map((u) => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Update currentUser in state and localStorage
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    // Sync userName in localStorage if fullName changes
    if (updatedData.fullName) {
      localStorage.setItem("userName", updatedData.fullName.split(" ")[0]);
    }
    
    return { success: true, user: updatedUser };
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateUser }}>
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
