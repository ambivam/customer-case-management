
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let cases;

    if (user.type === 'analyst') {
      // Analysts can see all cases
      const whereClause = category && category !== 'all' ? { category: category as any } : {};
      
      cases = await prisma.case.findMany({
        where: whereClause,
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
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Users can only see their own cases
      cases = await prisma.case.findMany({
        where: { userId: user.id },
        include: {
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
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { writeFile, readFile, unlink } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';

// Function to ensure upload directory exists
async function ensureUploadDir(caseId: string) {
  const uploadDir = path.join(process.cwd(), 'uploads', caseId);
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const email = formData.get('email') as string;
    const category = formData.get('category') as string;
    
    // Dynamic fields
    const nameChange = formData.get('nameChange') as string;
    const addressChange = formData.get('addressChange') as string;
    const addNewBranch = formData.get('addNewBranch') as string;
    const addNewAccount = formData.get('addNewAccount') as string;
    const addNewEmployee = formData.get('addNewEmployee') as string;
    const addNewCompany = formData.get('addNewCompany') as string;

    if (!title || !description || !email || !category) {
      return NextResponse.json(
        { error: 'Title, description, email, and category are required' },
        { status: 400 }
      );
    }

    // Process files if any
    const files: { filename: string; filepath: string; mimetype: string; size: number }[] = [];
    let fileIndex = 0;
    while (formData.has(`file-${fileIndex}`)) {
      const file = formData.get(`file-${fileIndex}`) as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        
        // Create case-specific upload directory
        const uploadDir = await ensureUploadDir('temp'); // Temporary directory until we have the case ID
        const filepath = path.join(uploadDir, file.name);
        
        // Save file
        await writeFile(filepath, buffer);
        
        files.push({
          filename: file.name,
          filepath: filepath,
          mimetype: file.type,
          size: file.size,
        });
      }
      fileIndex++;
    }

    // Create case
    let caseData = await prisma.case.create({
      data: {
        title,
        description,
        email,
        category: category as any,
        userId: user.id,
        nameChange: nameChange || null,
        addressChange: addressChange || null,
        addNewBranch: addNewBranch || null,
        addNewAccount: addNewAccount || null,
        addNewEmployee: addNewEmployee || null,
        addNewCompany: addNewCompany || null,
      },
      include: {
        documents: true,
      },
    });

    // Move files to permanent location and create document records
    if (files.length > 0) {
      const permanentUploadDir = await ensureUploadDir(caseData.id);
      
      for (const file of files) {
        // Move file to permanent location
        const permanentPath = path.join(permanentUploadDir, file.filename);
        await writeFile(permanentPath, await readFile(file.filepath));
        
        // Create document record
        await prisma.document.create({
          data: {
            filename: file.filename,
            filepath: permanentPath,
            mimetype: file.mimetype,
            size: file.size,
            caseId: caseData.id,
          },
        });
        
        // Clean up temporary file
        await unlink(file.filepath);
      }
      
      // Fetch updated case with documents
      const updatedCase = await prisma.case.findUnique({
        where: { id: caseData.id },
        include: { documents: true },
      });
      
      if (updatedCase) {
        caseData = updatedCase;
      }
    }

    return NextResponse.json({
      message: 'Case created successfully',
      case: caseData,
    });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
