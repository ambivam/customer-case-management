
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('\n=== Middleware Start ===');
  console.log('Path:', pathname);
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/analyst/login',
    '/analyst/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check',
    '/api/analyst/login',
    '/api/analyst/register'
  ];
  
  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    console.log('Public route, allowing access');
    console.log('=== Middleware End ===\n');
    return NextResponse.next();
  }
  
  // Allow OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    console.log('OPTIONS request, allowing access');
    console.log('=== Middleware End ===\n');
    return NextResponse.next();
  }
  
  // Get auth token and user
  const token = request.cookies.get('auth-token');
  const userData = request.cookies.get('user-data');
  
  console.log('Cookies:', {
    'auth-token': token ? 'present' : 'missing',
    'user-data': userData ? 'present' : 'missing'
  });
  
  // If no token or user data, redirect to login
  if (!token || !userData) {
    console.log('Missing auth cookies');
    
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      console.log('API route - Returning 401');
      console.log('=== Middleware End ===\n');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Redirect to appropriate login page
    const loginUrl = pathname.startsWith('/analyst') 
      ? new URL('/analyst/login', request.url)
      : new URL('/login', request.url);
    
    console.log('Redirecting to:', loginUrl.toString());
    console.log('=== Middleware End ===\n');
    return NextResponse.redirect(loginUrl);
  }
  
  // Parse user data
  let user;
  try {
    user = JSON.parse(userData.value);
    console.log('User:', user.type);
  } catch (error) {
    console.error('Failed to parse user data');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based access
  const isAnalystRoute = pathname.startsWith('/analyst') || pathname.startsWith('/api/analyst');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard');
  
  if (isAnalystRoute && user.type !== 'analyst') {
    console.log('Non-analyst accessing analyst route');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (isDashboardRoute && user.type !== 'user') {
    console.log('Non-user accessing user route');
    return NextResponse.redirect(new URL('/analyst/dashboard', request.url));
  }
  
  console.log('Access granted');
  console.log('=== Middleware End ===\n');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
