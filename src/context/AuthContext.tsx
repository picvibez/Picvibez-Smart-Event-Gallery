import React, { createContext, useContext, useEffect, useState } from 'react';

// Simplified mock User interface to replace Firebase User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'guest';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  demoLogin: (role?: 'admin' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  demoLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a saved demo session in localStorage
    const savedUser = localStorage.getItem('picvibez_demo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const demoLogin = (role: 'admin' | 'guest' = 'admin') => {
    const mockUser: User = {
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
      role: role,
    };
    
    setUser(mockUser);
    localStorage.setItem('picvibez_demo_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('picvibez_demo_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
