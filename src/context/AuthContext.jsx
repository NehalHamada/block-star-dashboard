import { useState } from "react";
import { authService } from "../services/authService";
import { AuthContext } from "./authContextDef";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  // Lazy initialization to avoid effect warnings and unnecessary renders
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  // Loading is no longer needed for initialization as it's synchronous now
  const loading = false;

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      // Ensure we're extracting the correct data structure
      // The authService now returns the full response.data which typically contains { data: { token, user } }
      // or it might return the inner object depending on implementation.
      // Based on user's manual edit, authService returns response.data.

      const accessToken = data.data?.token || data.token;

      const userData = data.data?.user || data.user;

      if (userData.role !== "admin") {
        toast.error("ليس لديك صلاحية الدخول");
        return { success: false, error: "ليس لديك صلاحية الدخول" };
      }

      if (accessToken) setToken(accessToken);
      if (userData) setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
