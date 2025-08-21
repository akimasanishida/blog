// Cited from https://zenn.dev/kiwichan101kg/articles/612658661d41ae
import { adminAuth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = request.headers
      .get("Cookie")
      ?.split("session=")[1]
      ?.split(";")[0];

    if (!session) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // 第二引数には必ずtrueを渡す。 そうしないと、無効なセッション ID でも認証情報を取得できてしまう。
    const decodedToken = await adminAuth.verifySessionCookie(session, true);

    return NextResponse.json(
      { isValid: true, user: decodedToken },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }
}
