import { NextResponse } from 'next/server';
import { getAllPostsForAdmin } from '@/lib/firebaseServer';

export async function GET() {
  try {
    const posts = await getAllPostsForAdmin();
    
    // Convert Timestamps to ISO strings for proper serialization
    const serializedPosts = posts.map(post => ({
      ...post,
      publishDate: post.publishDate?.toDate?.() ? post.publishDate.toDate().toISOString() : post.publishDate,
      updateDate: post.updateDate?.toDate?.() ? post.updateDate.toDate().toISOString() : post.updateDate,
    }));
    
    return NextResponse.json(serializedPosts);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
