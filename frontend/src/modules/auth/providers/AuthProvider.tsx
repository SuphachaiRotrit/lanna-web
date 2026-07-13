'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMeApi, LoginResponse } from '@/services/auth.service';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const [promise] = await getMeApi();
      const res = await promise;
      setUser(res.success ? res.data.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ดึงข้อมูล User เมื่อโหลดแอปครั้งแรก
    if (!pathname.startsWith('/admin')) {
      Promise.resolve().then(() => setIsLoading(false));
      return;
    }
    getMeApi().then(([promise]) =>
      promise
        .then(res => setUser(res.success ? res.data.user : null))
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false))
    );
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
