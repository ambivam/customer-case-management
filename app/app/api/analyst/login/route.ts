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
  try {
    const { email, password } = await request.json();
    const result = await handleLogin(email, password, 'analyst');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: result.redirectUrl
    });

    // Set cookies
    if (result.cookies) {
      for (const cookie of result.cookies) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    }

    return response;
  } catch (error) {
    console.error('Analyst login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
