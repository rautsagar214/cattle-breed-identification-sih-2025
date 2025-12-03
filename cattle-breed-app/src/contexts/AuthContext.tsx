import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getStoredUser, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  refreshUser: async () => { },
  setUser: () => { },
  loginAsGuest: () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log('Auth state updated:', currentUser?.email || 'Not logged in');
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for stored user and validate token
    const initAuth = async () => {
      try {
        // First, try to get stored user (faster)
        const storedUser = await getStoredUser();

        if (storedUser) {
          setUser(storedUser);
          console.log('✅ Restored user session:', storedUser.phone || storedUser.email);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginAsGuest = () => {
    const guestUser: User = {
      id: -1,
      email: 'guest@example.com',
      name: 'Guest User',
      phone: '',
      role: 'guest',
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    console.log('👤 Logged in as Guest');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    setUser,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
