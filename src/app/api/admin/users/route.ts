import { NextRequest, NextResponse } from 'next/server';
import { addNewUser } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await addNewUser(email);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
