"use client";

import { useState, useEffect } from 'react';
import { GithubLogoIcon } from '@phosphor-icons/react';
import { getAuth, signInWithEmailAndPassword, GithubAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const redirectTo = (searchParams.get('redirectTo') as string) || '/';
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace(redirectTo);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLoginEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // 成功時は withAdminAuth の onAuthStateChanged でUIが更新される
      })
      .catch((err) => {
        // console.error("Login Error:", err);
        const authError = err as AuthError;
        if (authError.code === 'auth/user-not-found') {
          setError("ユーザーが見つかりません。メールアドレスを確認してください。");
        } else if (authError.code === 'auth/wrong-password') {
          setError("パスワードが間違っています。もう一度お試しください。");
        } else if (authError.code === 'auth/network-request-failed') {
          setError("ネットワークエラーです。接続を確認して再度お試しください。");
        } else {
          setError("ログインに失敗しました。もう一度お試しください。");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLoginGitHub = async () => {
    setError(null);
    setLoading(true);
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      allow_signup: 'false',
    });
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(() => {
        // 成功時は withAdminAuth の onAuthStateChanged でUIが更新される
      })
      .catch((err) => {
        // console.error("GitHub Login Error:", err);
        const authError = err as AuthError;
        if (authError.code === 'auth/popup-closed-by-user') {
          setError("ログインがキャンセルされました。もう一度お試しください。");
        } else if (authError.code === 'auth/network-request-failed') {
          setError("ネットワークエラーです。接続を確認して再度お試しください。");
        } else {
          setError("GitHubでのログインに失敗しました。もう一度お試しください。");
        }
      })
      .finally(() => {
        setLoading(false);
      });
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
          <label htmlFor="email" className="block text-sm font-medium mb-1">メールアドレス</label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-foreground"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">パスワード</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-foreground"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <Button
          onClick={() => handleLoginEmail(email, password)}
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </Button>
        <hr className="my-6" />
        {/* GitHub login */}
        <Button
          onClick={handleLoginGitHub}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : (
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
