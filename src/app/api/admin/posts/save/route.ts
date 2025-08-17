import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

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

    const { postData, postId, action } = await request.json();
    
    if (!postData) {
      return NextResponse.json({ error: 'Post data is required' }, { status: 400 });
    }

    // Prepare the data to save
    const dataToSave = {
      ...postData,
      publishDate: postData.publishDate === 'serverTimestamp' ? admin.firestore.FieldValue.serverTimestamp() : postData.publishDate,
      updateDate: postData.updateDate === 'serverTimestamp' ? admin.firestore.FieldValue.serverTimestamp() : postData.updateDate,
    };

    let savedPostId: string;
    
    if (postId) {
      // Update existing post
      const postRef = adminDb.collection('posts').doc(postId);
      await postRef.update(dataToSave);
      savedPostId = postId;
    } else {
      // Create new post
      const newPostRef = await adminDb.collection('posts').add(dataToSave);
      savedPostId = newPostRef.id;
    }
    
    // Return the saved post with current timestamps
    const savedPostRef = adminDb.collection('posts').doc(savedPostId);
    const savedPostSnap = await savedPostRef.get();
    const savedPostData = savedPostSnap.data();
    
    const responseData = {
      id: savedPostId,
      ...savedPostData,
      publishDate: savedPostData?.publishDate?.toDate?.() ? savedPostData.publishDate.toDate().toISOString() : savedPostData?.publishDate,
      updateDate: savedPostData?.updateDate?.toDate?.() ? savedPostData.updateDate.toDate().toISOString() : savedPostData?.updateDate,
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
