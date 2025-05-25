"use client";

import { useState } from 'react';
import { GithubLogoIcon } from '@phosphor-icons/react';
import { auth } from '@/lib/firebase';
import { GithubAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // 成功時は withAdminAuth の onAuthStateChanged でUIが更新される
    } catch (err) {
      console.error("GitHub Login Error:", err);
      const authError = err as AuthError;
      if (authError.code === 'auth/popup-closed-by-user') {
        setError("ログインがキャンセルされました。もう一度お試しください。");
      } else if (authError.code === 'auth/network-request-failed') {
        setError("ネットワークエラーです。接続を確認して再度お試しください。");
      } else {
        setError("GitHubでのログインに失敗しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">管理者ログイン</h2>
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
        <Button 
          onClick={handleLogin}
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
        <p className="text-xs text-gray-500 mt-4 text-center">
          GitHubの認証画面にリダイレクトされます。
        </p>
      </div>
    </div>
  );
}
