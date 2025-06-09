
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.type !== 'analyst') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, priority, dueDate, analystId } = body;

    // Update case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(analystId && { analystId }),
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        analyst: {
          select: { name: true, email: true }
        },
        documents: true,
        updates: {
          include: {
            analyst: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      message: 'Case updated successfully',
      case: updatedCase,
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
