'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, type ReactNode } from 'react';
import { useSecurityGuards } from '@/hooks/useSecurityGuards';
import CookieBanner from '@/components/cookie-banner/CookieBanner';

interface ProvidersProps {
  children: ReactNode;
}

function SecurityGuard() {
  useSecurityGuards();
  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityGuard />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <CookieBanner />
    </QueryClientProvider>
  );
}
