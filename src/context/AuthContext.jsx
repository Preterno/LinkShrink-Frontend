import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import showToast from "../components/common/Toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const verifyToken = async (storedToken) => {
    try {
      const base_url = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${base_url}/api/verifyToken`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      return response.data.isValid;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        const isValidToken = await verifyToken(storedToken);

        if (isValidToken) {
          setToken(storedToken);
          if (!isLoggedIn) {
            showToast("Session restored", { type: "success" });
            setIsLoggedIn(true);
          }
          if (location.pathname === "/login") {
            const lastRoute = localStorage.getItem("lastRoute");
            navigate(lastRoute || "/");
          }
        } else {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          showToast("Session expired. Please log in again.", { type: "error" });
          navigate("/login");
        }
      } else {
        if (location.pathname === "/login") {
          setIsLoggedIn(false);
        } else {
          navigate("/login");
        }
      }
    };

    checkTokenValidity();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const base_url = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${base_url}/api/login`, {
        email,
        password,
      });
      setToken(response.data.accessToken);
      setIsLoggedIn(true);
      showToast("Login successful", { type: "success" });
      navigate("/");
      localStorage.setItem("token", response.data.accessToken);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      showToast(errorMessage, {
        type: "error",
      });
    }
  };
  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    showToast("Logged out successfully", { type: "info" });
    navigate("/signin");
  };
  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
