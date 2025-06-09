'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  type: 'user' | 'analyst';
  title: string;
  subtitle: string;
}

export default function LoginForm({ type = 'user', title, subtitle }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.group('Login Process');

    try {
      // Determine endpoint based on type
      const endpoint = type === 'analyst' 
        ? '/api/analyst/login'
        : '/api/auth/login';
      
      console.log('🔵 Login attempt:', { type, endpoint, email });
      
      // Make login request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Login failed:', error);
        toast.error('Login failed. Please check your credentials.');
        return;
      }

      const data = await response.json();
      console.log('📦 Login response:', data);
      
      if (!data.success) {
        console.error('❌ Login unsuccessful');
        toast.error(data.error || 'Login failed');
        return;
      }

      // Show success message
      toast.success('Login successful!');

      // Wait briefly for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify user data cookie
      const userData = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-data='));

      if (!userData) {
        console.error('❌ User data not set');
        toast.error('Login failed - please try again');
        return;
      }

      // Navigate to dashboard
      console.log('🚀 Navigating to:', data.redirectUrl);
      window.location.href = data.redirectUrl;

    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }

    console.groupEnd();
  };

  return (
    <div className="mx-auto max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
}
