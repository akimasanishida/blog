// Cited from https://zenn.dev/kiwichan101kg/articles/612658661d41ae
'use server'

import { cookies } from 'next/headers'
import { AsyncResult } from '@/types/result'

export async function deleteSessionCookie(): Promise<AsyncResult> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return { success: true }
}