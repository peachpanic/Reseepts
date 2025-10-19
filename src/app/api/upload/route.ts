import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Sanitize filename
    let filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Ensure unique filename
    let filePath = path.join(imagesDir, filename);
    let counter = 1;
    while (existsSync(filePath)) {
      const ext = path.extname(filename);
      const nameWithoutExt = filename.replace(ext, '');
      filename = `${nameWithoutExt}_${counter}${ext}`;
      filePath = path.join(imagesDir, filename);
      counter++;
    }

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json(
      { 
        success: true, 
        filename: filename,
        message: 'File uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
