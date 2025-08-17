import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
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

    const { slug, excludePostId } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if slug exists
    const postsCollection = adminDb.collection('posts');
    const slugQuery = postsCollection.where('slug', '==', slug);
    const querySnapshot = await slugQuery.get();
    
    let slugExists = false;
    if (!querySnapshot.empty) {
      if (excludePostId) {
        // If we're editing an existing post, exclude it from the check
        querySnapshot.forEach(docSnap => {
          if (docSnap.id !== excludePostId) {
            slugExists = true;
          }
        });
      } else {
        slugExists = true;
      }
    }
    
    return NextResponse.json({ exists: slugExists });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json({ error: 'Failed to check slug' }, { status: 500 });
  }
}
