'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { AuthProvider } from '@/modules/auth/providers/AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  // สร้าง QueryClient แค่ครั้งเดียวต่อ Lifecycle
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ข้อมูลถือว่าสดใหม่เป็นเวลา 1 นาที
        retry: 1,             // ลองใหม่ 1 ครั้งถ้าพัง
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
