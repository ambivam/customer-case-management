
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if analyst already exists
    const existingAnalyst = await prisma.analyst.findUnique({
      where: { email },
    });

    if (existingAnalyst) {
      return NextResponse.json(
        { error: 'Analyst with this email already exists' },
        { status: 400 }
      );
    }

    // Create new analyst
    const hashedPassword = hashPassword(password);
    const analyst = await prisma.analyst.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({
      id: analyst.id,
      email: analyst.email,
      name: analyst.name,
      type: 'analyst',
    });

    const response = NextResponse.json({
      message: 'Analyst registered successfully',
      analyst: {
        id: analyst.id,
        name: analyst.name,
        email: analyst.email,
      },
    });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Analyst registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
