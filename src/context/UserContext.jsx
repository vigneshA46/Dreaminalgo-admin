import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../components/utils/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= RESTORE SESSION ================= */

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiRequest('POST', '/api/admin/auth/me');
        setUser(res.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  /* ================= FETCH USER AFTER LOGIN ================= */

  const fetchUser = async () => {
    try {
      const res = await apiRequest('POST', '/api/admin/auth/me');
      setUser(res.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Fetch user failed:', err.message);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/admin/auth/logout');
    } catch (err) {
      console.error('Logout failed', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/auth/login';
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    fetchUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used inside UserProvider');
  return context;
};