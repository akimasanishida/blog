# 管理パネル付きマークダウンブログ

## セットアップ

セットアップにより、自身を管理者とするブログを作成可能

**Firebase と GitHub の連携**

[Firebase docs の GitHub を用いた認証方法](https://firebase.google.com/docs/auth/web/github-auth?authuser=0&hl=ja) をもとに、GitHub アカウントを紐づけられるようにする。

**.env の編集**

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=....firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://....firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=....firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_ADMIN_UID=...
```

**Firestore Database のルール（仮設定）**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read;
      allow write: if false;
    }
  }
}
```

**Storage のルール（仮設定）**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if false;
    }
  }
}
```

**実行**

```bash
npm run dev
# or 
yarn dev
# or
pnpm dev
```

[管理者ログイン](localhost:3000/admin) にアクセスし、GitHub カウントで一度ログイン。

**管理者の作成**

1. サービスアカウント（Firebase Console > 設定の歯車 > プロジェクトの設定 > サービスアカウント）から、秘密鍵の JSON ファイルを入手
1. `./serviceAccountKey.json` などに設置
1. `.env` の `SERVICE_ACCOUNT_PATH` にファイルパスを書く
1. `FIREBASE_ADMIN_UID` に、管理者に登録するユーザUID を取得（Firebase Console > Authentication）
1. `npx tsx set-claim.ts` でユーザを管理者に登録完了

**Firestore Database のルールを更新**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /posts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

**Storage のルールを更新**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /{allPaths=**} {
      allow read;
      allow write: if isAdmin();
    }
  }
}
```

**複合インデックスの有効化**

Firebase Console > Firestore Database > インデックス より、複合インデックスを作成：

必要なインデックス:

- コレクションID: posts
- フィールド:
  - `isPublic` (昇順 Ascending または 降順 Descending - == でのフィルタリングなのでどちらでも可)
  - `publishDate` (クエリに合わせて 降順 Descending)
- クエリのスコープ: コレクション (Collection)