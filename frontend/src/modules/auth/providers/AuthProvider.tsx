'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMeApi } from '@/services/auth.service';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const [promise] = await getMeApi();
      const res = await promise;
      if (res.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ดึงข้อมูล User เมื่อโหลดแอปครั้งแรก
    if (pathname.startsWith('/admin')) {
        refreshUser();
    } else {
        setIsLoading(false);
    }
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
