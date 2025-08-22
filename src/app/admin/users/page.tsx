"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsyncResult } from "@/types/result";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import withAdminAuth from "@/components/withAdminAuth";

function UsersPageClient() {
  const handleInvite = async () => {
    const inviteEmail = document.getElementById(
      "invite-email"
    ) as HTMLInputElement;

    if (inviteEmail) {
      try {
        const email: string = inviteEmail.value.trim();
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        });

        const result: AsyncResult = await response.json();

        if (result.success) {
          // 招待成功
          // パスワード設定メール送信
          const auth = getAuth();
          sendPasswordResetEmail(auth, email)
            .then(() => {
              alert("ユーザの招待に成功しました: " + email);
              inviteEmail.value = "";
            })
            .catch((error) => {
              alert("ユーザの招待に失敗しました: " + error.message);
            });
        } else {
          // 招待失敗
          alert(`ユーザの招待に失敗しました: ${result.error}`);
        }
      } catch {
        alert("エラーが発生しました");
      }
    }
    else {
      alert("メールアドレスを入力してください");
    }
  };

  return (
    <>
      <h1>ユーザ管理</h1>
      <h2>ユーザの招待</h2>
      {/* 縦に３つ並べる */}
      <div className="flex flex-col gap-2 w-80 mx-auto">
        <Input
          id="invite-email"
          placeholder="メールアドレスを入力"
        />
        <Button className="mx-auto" onClick={() => handleInvite()}>招待</Button>
      </div>
    </>
  );
}

export default withAdminAuth(UsersPageClient);
