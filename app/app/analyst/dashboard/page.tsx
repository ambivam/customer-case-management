'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnalystCaseManagement from '@/components/analyst-case-management';
import { FileText, BarChart3, Users, Clock, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalystDashboardPage() {
  const [analyst, setAnalyst] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCases: 0,
    openCases: 0,
    inProgressCases: 0,
    resolvedCases: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Get analyst info from cookies
    const getAnalystFromCookie = () => {
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-data='));
      
      if (userDataCookie) {
        const userData = decodeURIComponent(userDataCookie.split('=')[1]);
        const parsedData = JSON.parse(userData);
        // Verify it's an analyst
        if (parsedData.type === 'analyst') {
          return parsedData;
        }
      }
      return null;
    };

    const analystData = getAnalystFromCookie();
    if (analystData) {
      setAnalyst(analystData);
      // Fetch dashboard stats
      fetchStats();
    } else {
      // If no analyst data in cookie or not an analyst, redirect to login
      router.push('/analyst/login');
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      
      if (response.ok) {
        const cases = data.cases;
        setStats({
          totalCases: cases.length,
          openCases: cases.filter((c: any) => c.status === 'OPEN').length,
          inProgressCases: cases.filter((c: any) => c.status === 'IN_PROGRESS').length,
          resolvedCases: cases.filter((c: any) => c.status === 'RESOLVED').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">CaseFlow</span>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-500">Analyst Portal</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {analyst && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{analyst.name}</span>
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
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyst Dashboard
          </h1>
          <p className="text-gray-600">
            Manage customer cases and track resolution progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-muted-foreground">
                All cases in the system
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.openCases}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting assignment
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgressCases}</div>
              <p className="text-xs text-muted-foreground">
                Currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedCases}</div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Case Management */}
        <Card>
          <CardHeader>
            <CardTitle>Case Management</CardTitle>
            <CardDescription>
              View, filter, and manage all customer cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalystCaseManagement analystId={analyst?.id || ''} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
