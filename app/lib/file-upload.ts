
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface UploadedFile {
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

export async function saveUploadedFile(
  file: File,
  caseId: string
): Promise<UploadedFile> {
  const uploadDir = path.join(process.cwd(), 'uploads', caseId);
  
  // Create directory if it doesn't exist
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  
  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);
  
  return {
    filename: file.name,
    filepath: filepath,
    mimetype: file.type,
    size: file.size,
  };
}
