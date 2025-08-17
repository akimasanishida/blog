import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const isAdmin = !!decodedToken.admin || false;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List images from Firebase Storage using Admin SDK
    const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const [files] = await bucket.getFiles({ prefix: 'images/posts/' });
    
    // Filter out directories and only include actual image files
    const imageFiles = files.filter((file) => {
      // Skip directories (files that end with '/')
      if (file.name.endsWith('/')) return false;
      
      // Only include files that are actually in the images/posts/ directory
      // and have a file extension (indicating they are actual files, not folders)
      const fileName = file.name.split('/').pop() || '';
      return fileName.includes('.') && fileName.length > 0;
    });
    
    const images = imageFiles.map((file) => ({
      url: `/media/${file.name}`,
      name: file.name.split('/').pop() || file.name,
      refPath: file.name,
    }));
    
    // Sort by name
    images.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}
