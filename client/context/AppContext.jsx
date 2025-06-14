import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setIsOwner(false);
      setSearchedCities([]);
      return;
    }

    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setIsOwner(response.data.role === "hotelOwner");
      setSearchedCities(response.data.recentSearchedCities);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsOwner(false);
      setSearchedCities([]);
      toast.error("Error fetching user: " + error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);
  
  const value = {
    currency,
    navigate,
    isOwner,
    setIsOwner,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    token,
    setToken,
    user,
    setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);