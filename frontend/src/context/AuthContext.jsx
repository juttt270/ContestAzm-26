import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMyProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser, accessToken, refreshToken } = await authService.login(email, password);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (payload) => {
    const { user: newUser, accessToken, refreshToken } = await authService.signup(payload);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // best-effort — local session clears regardless
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
