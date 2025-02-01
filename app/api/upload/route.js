// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { query } from '@/lib/db/queries';
import { validateImageFile } from '@/lib/security/fileValidation';
import crypto from 'crypto';

// Generate safe filename function
const generateSafeFileName = (originalName) => {
    const ext = originalName.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    return `${timestamp}_${randomString}.${ext}`;
  };

export async function POST(request) {
  try {
    console.log('Starting file upload process');

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    console.log('Received file:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      uploadType: type
    });

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'images', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Generate safe filename
    const fileName = generateSafeFileName(file.name);
    const filePath = join(uploadDir, fileName);
    
    // Save file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }

    // Important: Store the correct path in database
    // Make sure the path starts with a leading slash
    const dbFilePath = `/uploads/${fileName}`;
    let updateQuery;

    try {
      if (session.user.role === 'employeroutside') {
        updateQuery = type === 'logo'
          ? 'UPDATE employer_outside_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
          : 'UPDATE employer_outside_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
      } else {
        updateQuery = type === 'logo'
          ? 'UPDATE employer_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
          : 'UPDATE employer_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
      }

      const result = await query(updateQuery, [dbFilePath, session.user.id]);
      console.log('Database updated successfully:', result.rows[0]);
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }

    return NextResponse.json({
      url: dbFilePath,  // Return the correct path
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload process error:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    );
  }
}