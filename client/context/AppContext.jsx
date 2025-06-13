import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  const { user } = useUser();

  const { userId, getToken } = useAuth();
  // console.log(userId);

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);

  const fetchUser = async (attempt = 1, maxAttempts = 3) => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities);
      } else if (attempt < maxAttempts) {
        // Retry after delay
        setTimeout(() => {
          fetchUser(attempt + 1, maxAttempts);
        }, 3000); // 3 sec delay
      } else {
        toast.error("Failed to fetch user data after multiple attempts.");
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        setTimeout(() => {
          fetchUser(attempt + 1, maxAttempts);
        }, 3000);
      } else {
        toast.error("Error fetching user: " + error.message);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user]);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);