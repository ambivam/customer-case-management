'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AnalystDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking analyst authentication...');
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        
        console.log('Auth check response:', response.status);
        
        if (!response.ok) {
          console.log('Not authenticated, redirecting to analyst login...');
          toast.error('Please log in to continue');
          router.replace('/analyst/login');
          return;
        }

        const data = await response.json();
        console.log('Auth data:', data);

        if (!data.authenticated || data.user?.type !== 'analyst') {
          console.log('Invalid user type or not authenticated');
          toast.error('Please log in as an analyst to continue');
          router.replace('/analyst/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication error');
        router.replace('/analyst/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
