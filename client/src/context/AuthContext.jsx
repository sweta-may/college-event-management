import { createContext, useContext, useEffect, useState } from 'react';
import { auth as authApi } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cem-user')) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify stored token against the server on every page load
  useEffect(() => {
    const token = localStorage.getItem('cem-token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('cem-user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('cem-token');
        localStorage.removeItem('cem-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: u, token } = res.data;
    localStorage.setItem('cem-token', token);
    localStorage.setItem('cem-user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { user: u, token } = res.data;
    localStorage.setItem('cem-token', token);
    localStorage.setItem('cem-user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('cem-token');
    localStorage.removeItem('cem-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
