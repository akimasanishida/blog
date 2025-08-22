"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

export default function SentEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="p-8 bg-card shadow-xl rounded-lg w-full max-w-md">
        <EnvelopeSimpleIcon className="w-18 h-18 mx-auto mb-4 text-muted-foreground" />
        <center>
          <p>パスワード再設定のためのメールを送信しました。</p>
          <p>メールを確認してください。</p>
          <p>このページは閉じても問題ありません。</p>
        </center>
      </div>
    </div>
  );
}
