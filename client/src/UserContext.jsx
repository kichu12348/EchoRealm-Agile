import { createContext, useEffect, useState } from "react";
import axios from "axios";
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const backendUrl = "http://localhost:8080";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // User Handling

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/users/login`, {
        email,
        password,
      });
      const data = response?.data;
      if (data.status === 200) {
        setUser(data?.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Register
  const register = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/users/register`, {
        email,
        password,
      });
      const data = response?.data;
      if (data.status === 200) {
        setUser(data?.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/users/forgot-password`,
        {
          email,
        },
      );
      return response?.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Reset Password
  const resetPassword = async (userId, resetToken, password) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/users/reset-password`,
        {
          userId,
          resetToken,
          password,
        },
      );
      return response?.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
