
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CaseFlow</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Customer Login</Button>
            </Link>
            <Link href="/analyst/login">
              <Button variant="ghost">Analyst Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Streamline Your Customer
            <span className="text-blue-600"> Case Management</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional case tracking and resolution platform designed for efficient customer support operations
          </p>
          <div className="flex justify-center space-x-4 pt-6">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Submit a Case
              </Button>
            </Link>
            <Link href="/analyst/register">
              <Button size="lg" variant="outline" className="px-8">
                Join as Analyst
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Case Management
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools for both customers and analysts to ensure efficient case resolution
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Multi-Role Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Separate portals for customers and analysts with role-based permissions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Dynamic Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Category-specific fields that adapt based on case type selection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Priority Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set priorities and due dates to ensure timely case resolution
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Status Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time status updates and progress tracking for all cases
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers using our case management platform
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-semibold">CaseFlow</span>
          </div>
          <p className="text-gray-400">
            © 2025 CaseFlow. Professional case management solutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
