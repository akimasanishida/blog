// Cited from https://zenn.dev/kiwichan101kg/articles/612658661d41ae
'use server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebaseAdmin'
import { AsyncResult } from '@/types/result'

const setSessionCookie = async (sessionCookie: string, maxAge: number) => {
  const cookieStore = await cookies()
  cookieStore.set('session', sessionCookie, {
    maxAge,
    httpOnly: true,
    secure: true,
  })
}

// サーバー側でのみ実行されるセッションCookie作成処理
export async function actionsCreateSessionCookie(idToken: string): Promise<AsyncResult> {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5日間有効
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    await setSessionCookie(sessionCookie, expiresIn)
    return { success: true }
  } catch {
    return { success: false, error: 'セッションの作成に失敗しました' }
  }
}