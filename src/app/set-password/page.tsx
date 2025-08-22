"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { Button } from "@/components/ui/button";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionCode, setActionCode] = useState<string>("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const code = searchParams.get("oobCode") || "";
    setActionCode(code);
  }, [searchParams]);

  const redirectToLoginPage = () => {
    router.replace("/login");
  };

  const handleSetPassword = async (password: string) => {
    setError(null);
    setLoading(true);
    const auth = getAuth();
    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        confirmPasswordReset(auth, actionCode, password)
          .then(() => {
            redirectToLoginPage();
          })
          .catch((error) => {
            setError("パスワードの設定に失敗しました: " + error.message);
            setLoading(false);
          });
      })
      .catch((error) => {
        setError("URL が不正です: " + error.message);
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="p-8 bg-card shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          パスワードを設定
        </h2>
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
        {/* Set password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
          >
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
          onClick={() => handleSetPassword(password)}
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? "設定中..." : "設定する"}
        </Button>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] py-12">Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
