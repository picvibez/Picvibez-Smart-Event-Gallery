import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  demoLogin: () => void;
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
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isDemo) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const demoLogin = () => {
    setIsDemo(true);
    // Create a mock Firebase User object
    const mockUser = {
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({ token: 'mock', claims: {}, authTime: '', issuedAtTime: '', expirationTime: '', signInProvider: null, signInSecondFactor: null }),
      reload: async () => {},
      toJSON: () => ({}),
    } as unknown as User;
    
    setUser(mockUser);
  };

  const logout = async () => {
    try {
      if (isDemo) {
        setIsDemo(false);
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
