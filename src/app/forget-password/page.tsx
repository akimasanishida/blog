"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSendEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // 送信済みページへリダイレクト
        router.replace("/forget-password/sent-email");
      })
      .catch((error) => {
        setError("メールの送信に失敗しました: " + error.message);
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="p-8 bg-card shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">パスワードを再設定</h2>
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
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
        <Button
          onClick={() => handleSendEmail(email)}
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? "メールを送信中..." : "再設定用のメールを送信"}
        </Button>
      </div>
    </div>
  );
}
