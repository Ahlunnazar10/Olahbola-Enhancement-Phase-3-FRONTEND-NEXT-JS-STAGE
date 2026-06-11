'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { getLastPathname } from '@/lib/last-path';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        setStatus('error');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!code) {
        router.push('/login');
        return;
      }

      try {
        const response = await apiClient.post('/api/v1/auth/google/callback', {
          code,
        });

        const data = response.data;

        if (response.status === 200 && data.token) {
          if (data.user) {
            login(data.user);
          }
          setStatus('success');
          const lastPath = getLastPathname();
          router.push(lastPath || '/profile');
        } else {
          console.error('Login failed:', data);
          setStatus('error');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        console.error('Error during callback:', err);
        setStatus('error');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="relative w-[300px] h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0D645F] border-t-transparent"></div>
      </div>

      <p className="text-white text-center text-xl md:text-2xl">
        {status === 'loading' && 'Tunggu, VAR Checking Sedang Berlangsung..'}
        {status === 'success' && 'Login berhasil! Mengarahkan...'}
        {status === 'error' && 'Terjadi kesalahan. Mengarahkan ke login...'}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-black w-full h-20" />

      <section
        className="h-screen w-full bg-center bg-cover flex justify-center items-center"
        style={{ backgroundImage: "url('/images/home/banner-bg2.webp')" }}
      >
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0D645F] border-t-transparent"></div>
            <p className="text-white text-center text-xl">Memuat...</p>
          </div>
        }>
          <AuthCallbackContent />
        </Suspense>
      </section>
    </div>
  );
}
