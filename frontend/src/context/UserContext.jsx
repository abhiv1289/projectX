import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  // Load user safely
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      localStorage.removeItem("user"); // cleanup bad data
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, loginUser, logoutUser, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
