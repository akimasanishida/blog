"use client";

import { useState } from "react";
import { GithubLogoIcon } from "@phosphor-icons/react";
import {
  getAuth,
  signInWithEmailAndPassword,
  GithubAuthProvider,
  signInWithPopup,
  AuthError,
  UserCredential,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { actionsCreateSessionCookie } from "@/app/actions/create-session-cookie";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectToOriginalPage = () => {
    const redirectTo = (searchParams.get("redirectTo") as string) || "/";
    router.replace(redirectTo);
  };

  const getUserCredential = async (userCredential: UserCredential) => {
    try {
      const idToken = await userCredential.user.getIdToken();
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const isAdmin = !!idTokenResult.claims.admin || false;

      const response = await actionsCreateSessionCookie(idToken); // Server Actionsで行う
      if (!response.success) {
        return { success: false, error: response.error };
      }

      return { success: true, data: { user: userCredential.user, isAdmin } };
    } catch {
      return { success: false, error: "認証処理に失敗しました" };
    }
  };

  const handleLoginEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const response = await getUserCredential(userCredential);
      if (!response.success) {
        // throw error
        throw new Error(response.error ? response.error : "ログインに失敗しました。");
      } else {
        redirectToOriginalPage();
      }
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === "auth/user-not-found") {
        setError("メールアドレスまたはパスワードが間違っています。");
      } else if (authError.code === "auth/wrong-password") {
        setError("メールアドレスまたはパスワードが間違っています。");
      } else if (authError.code === "auth/invalid-email") {
        setError("無効なメールアドレスです。");
      } else if (authError.code === "auth/too-many-requests") {
        setError(
          "ログイン試行が多すぎます。しばらく待ってから再試行してください。"
        );
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
      setLoading(false);
    }
  };

  const handleLoginGitHub = async () => {
    setError(null);
    setLoading(true);
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      allow_signup: "false",
    });
    const auth = getAuth();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const response = await getUserCredential(userCredential);
      if (!response.success) {
        setError(
          response.error ? response.error : "GitHubでのログインに失敗しました。"
        );
      } else {
        redirectToOriginalPage();
      }
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === "auth/popup-closed-by-user") {
        setError("ログインがキャンセルされました。もう一度お試しください。");
      } else if (authError.code === "auth/network-request-failed") {
        setError("ネットワークエラーです。接続を確認して再度お試しください。");
      } else {
        setError("GitHubでのログインに失敗しました。もう一度お試しください。");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="p-8 bg-card shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">ログイン</h2>
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
        {/* Email and Password login */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-foreground"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-foreground"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          onClick={() => handleLoginEmail(email, password)}
          className="w-full my-2"
          disabled={loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
        {/* Forgot password link */}
        <div className="text-center">
          <Link
            href="/forget-password"
            className="text-xs hover:underline" // text-sm よりさらに小さく
          >
            パスワードをお忘れですか？
          </Link>
        </div>
        <hr className="my-4" />
        {/* GitHub login */}
        <Button
          onClick={handleLoginGitHub}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3"
          disabled={loading}
        >
          {loading ? (
            "ログイン中..."
          ) : (
            <>
              <GithubLogoIcon className="mr-2" />
              GitHubでログイン
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
