import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ROLE_DASHBOARD_PATH } from '../lib/roles';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth called outside AuthProvider - returning fallback');
    return {
      user: null,
      loading: true,
      login: async () => { throw new Error('AuthProvider not initialized'); },
      logout: () => {}
    } as AuthContextType;
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  // Restore user from localStorage on startup
  useEffect(() => {
    const raw = localStorage.getItem('bose_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem('bose_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // POST /auth/login – returns { user } (no token)
    const response = await api.post('/auth/login', { email, password });
    const loggedInUser: User = response.data.user;

    setUser(loggedInUser);
    localStorage.setItem('bose_user', JSON.stringify(loggedInUser));

    const roleKey = (loggedInUser.role || '').toLowerCase() as keyof typeof ROLE_DASHBOARD_PATH;
    navigate(ROLE_DASHBOARD_PATH[roleKey] || '/dashboard', { replace: true });
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bose_user');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}