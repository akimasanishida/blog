// app/media/[...path]/route.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import appConfig from "@/lib/appConfig";

export const runtime = "nodejs"; // Admin SDK 利用のため Edge ではなく Node
export const dynamic = "force-dynamic"; // 認証有無で応答が変わるため

const LOGIN_REQUIRED = process.env.NEXT_PUBLIC_SITE_VISIBILITY === "private";

async function verifyAdminAuth(req: NextRequest) {
  if (!LOGIN_REQUIRED) return true; // 公開モードならスキップ

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    
    if (!sessionCookie) {
      return false;
    }

    // 統一された adminAuth を使用してセッション検証
    // 第二引数には必ずtrueを渡す。そうしないと、無効なセッション ID でも認証情報を取得できてしまう。
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // 管理者権限チェック（他の認証システムと整合性を保つ）
    const isAdmin = !!decodedToken.admin || false;
    
    return isAdmin;
  } catch (error) {
    console.error("Authentication verification failed:", error);
    return false;
  }
}

function cacheHeader() {
  return LOGIN_REQUIRED
    ? "private, max-age=0, must-revalidate" // 非公開時：共有キャッシュ不可
    : "public, max-age=31536000, immutable"; // 公開時：長期キャッシュ
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const isAuthorized = await verifyAdminAuth(req);
  if (!isAuthorized) {
    // 他の認証APIと整合性を保つため、適切なステータスコードを返す
    return new Response("Unauthorized", { status: 401 });
  }

  // params を await する
  const resolvedParams = await params;
  
  // URL: /media/images/posts/hoge.jpg -> ストレージ上の "images/posts/hoge.jpg" を読む想定
  // 白いスペースや特殊文字を含むパスを適切にデコード
  const decodedPathSegments = resolvedParams.path.map(segment => decodeURIComponent(segment));
  const objectPath = decodedPathSegments.join("/");

  // ストレージバケット名を明示的に指定
  const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  const file = bucket.file(objectPath);

  try {
    // 存在チェック
    const [exists] = await file.exists();
    if (!exists) {
      return new Response("Not Found", { status: 404 });
    }

    // メタデータ取得（Content-Type など）
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";
    const etag = metadata.etag;

    // 条件付きリクエスト（簡易 ETag 対応）
    const ifNoneMatch = req.headers.get("if-none-match");
    if (etag && ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": cacheHeader(),
          ETag: etag,
        },
      });
    }

    // 本体取得（必要に応じて createReadStream に置き換え可能）
    const [buffer] = await file.download();

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheHeader(),
        ...(etag ? { ETag: etag } : {}),
      },
    });
  } catch (error) {
    console.error("Error serving media file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
