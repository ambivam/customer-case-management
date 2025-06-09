'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CaseForm from '@/components/case-form';
import CaseList from '@/components/case-list';
import { FileText, Plus, List, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [refreshCases, setRefreshCases] = useState(0);
  const router = useRouter();

  useEffect(() => {
    console.group('Dashboard Page Load');
    console.log('🔵 Dashboard mounting...');

    // Check for debug info from login
    const debugInfo = sessionStorage.getItem('loginDebug');
    if (debugInfo) {
      console.log('💾 Found login debug info:', JSON.parse(debugInfo));
      // Clear it after reading
      sessionStorage.removeItem('loginDebug');
    }

    // Get user info from cookies
    const getUserFromCookie = () => {
      console.log('🍪 Reading cookies...');
      console.log('All cookies:', document.cookie);

      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-data='));
      
      console.log('Found user-data cookie:', !!userDataCookie);
      
      if (userDataCookie) {
        const userData = decodeURIComponent(userDataCookie.split('=')[1]);
        const parsedData = JSON.parse(userData);
        console.log('✅ Parsed user data:', parsedData);
        return parsedData;
      }
      console.warn('⚠️ No user data found in cookies');
      return null;
    };

    const userData = getUserFromCookie();
    if (userData) {
      console.log('👤 Setting user data in state');
      setUser(userData);
    } else {
      console.warn('❌ No user data, redirecting to login');
      router.push('/login');
    }

    console.groupEnd();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/');
      router.refresh(); // Refresh to clear the auth state
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleCaseCreated = () => {
    setRefreshCases(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CaseFlow</span>
            <span className="text-sm text-gray-500">Customer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your cases and track their progress in one place
          </p>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>My Cases</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Case</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Cases</CardTitle>
                <CardDescription>
                  Track the status and progress of all your submitted cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CaseList key={refreshCases} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CaseForm onSuccess={handleCaseCreated} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
