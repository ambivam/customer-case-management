'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document details
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
      include: {
        case: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has access to this case
    if (
      user.type !== 'analyst' && // Analysts can access all documents
      document.case.userId !== user.id // Users can only access their own documents
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get file path
    const filePath = document.filepath;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.promises.readFile(filePath);

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', document.mimetype);
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${document.filename}"`
    );
    response.headers.set('Content-Length', document.size.toString());

    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
