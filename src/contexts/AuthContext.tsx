'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // デモモードの場合、仮のユーザーを設定
      const demoUser = {
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'デモユーザー',
        photoURL: null,
      } as User;
      
      setUser(demoUser);
      setLoading(false);
      return;
    }

    // Firebase設定が正しい場合のみ認証監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      if (isFirebaseConfigured()) {
        await signOut(auth);
      } else {
        // デモモードの場合
        setUser(null);
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const value = {
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
