import React from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Logout = () => {
  const { setToken, setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-indigo-600 hover:text-indigo-500"
    >
      Logout
    </button>
  );
};

export default Logout;
