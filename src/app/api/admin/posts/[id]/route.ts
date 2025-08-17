import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const postRef = adminDb.collection('posts').doc(id);
    const docSnap = await postRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const data = docSnap.data();
    const post = {
      id: docSnap.id,
      slug: data?.slug,
      title: data?.title || 'untitled',
      isPublic: data?.isPublic,
      publishDate: data?.publishDate?.toDate?.() ? data.publishDate.toDate().toISOString() : data?.publishDate,
      updateDate: data?.updateDate?.toDate?.() ? data.updateDate.toDate().toISOString() : data?.updateDate,
      category: data?.category || 'uncategorized',
      content: data?.content || '',
      tags: data?.tags || [],
    };
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
