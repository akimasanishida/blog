import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const isPublicPage = request.nextUrl.pathname === '/login'
  const isPrivatePage = !isPublicPage
  const isLoggedIn = session
  // Edge Runtime では fs モジュールが使用できないため、環境変数を使用
  const isPublicSite = process.env.SITE_VISIBILITY === 'public'

  // 公開サイトの場合、認証チェックをスキップ
  if (isPublicSite) {
    // ログイン済みで `/login` にアクセスしている場合のみ `/` にリダイレクト
    if (isLoggedIn && isPublicPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // プライベートサイトの場合、従来の認証ロジックを実行
  // 未ログインの場合、認証が必要なページなら `/login` にリダイレクト
  if (!isLoggedIn && isPrivatePage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ログイン済みの場合、セッションクッキーの検証を行う
  if (isLoggedIn) {
    // セッションの検証
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`, {
      headers: {
        Cookie: `session=${session}`,
      },
    })

    // セッションクッキーが無効なら `/login` にリダイレクト
    if (!response.ok) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      redirectResponse.cookies.delete('session') // セッション Cookie を削除
      return redirectResponse
    }

    // `/login` にアクセスしているが、セッションクッキーが有効なら `/` にリダイレクト
    if (isPublicPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ["/", "/((?!api|_next|favicon.ico).*)"],
}
