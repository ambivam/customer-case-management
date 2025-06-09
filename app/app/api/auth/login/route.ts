export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { handleLogin } from '@/lib/auth-utils';

// Enable CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  console.group('Login Request');
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);

    // Validate request body
    if (!body.email || !body.password) {
      console.error('❌ Missing email or password');
      console.groupEnd();
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await handleLogin(body.email, body.password, 'user');
    console.log('📦 Login result:', result);

    if (!result.success) {
      console.error('❌ Login failed:', result.error);
      console.groupEnd();
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create the response first
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        type: result.user.type
      },
      redirectUrl: result.redirectUrl
    });

    // Set cookies
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };

    // Set auth token (HTTP only)
    response.cookies.set('auth-token', result.user.token, {
      ...cookieOptions,
      httpOnly: true
    });

    // Set user data (client accessible)
    response.cookies.set('user-data', JSON.stringify({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      type: result.user.type
    }), {
      ...cookieOptions,
      httpOnly: false
    });

    console.log('🍪 Cookies set:', {
      'auth-token': 'present',
      'user-data': 'present'
    });

    console.log('🚀 Sending response');
    console.groupEnd();
    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
