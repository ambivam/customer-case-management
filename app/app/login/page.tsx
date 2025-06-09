'use client';

import LoginForm from '@/components/login-form';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <FileText className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Customer Case Management</h1>
          <p className="text-gray-600 mt-2">Customer Portal</p>
        </div>

        <LoginForm
          type="user"
          title="Welcome Back"
          subtitle="Sign in to your account to manage your cases"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you an analyst?{' '}
            <Link href="/analyst/login" className="text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
