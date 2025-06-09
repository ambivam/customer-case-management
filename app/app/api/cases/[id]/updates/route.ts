
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.type !== 'analyst') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create case update
    const update = await prisma.caseUpdate.create({
      data: {
        message,
        caseId: id,
        analystId: user.id,
      },
      include: {
        analyst: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Update added successfully',
      update,
    });
  } catch (error) {
    console.error('Error adding case update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
