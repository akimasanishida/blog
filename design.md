# 設計

- 作るもの：マークダウンブログ
- ブログタイトル：西田明正のブログ
- ブログURL：blog.akimasanishida.com

## サイトの構成

## プロジェクト構成

本プロジェクトの主なディレクトリ・ファイル構成は以下の通りです。  
`app/` 以下のページ構成については「## サイトの構成」を参照してください。

```
components/         # サイト全体で使う共通UIコンポーネント（Header, Footer, PostList, SearchBox など）
components/ui/      # shadcn/ui
lib/                # FirebaseやMarkdown変換などのライブラリ・ユーティリティ
types/              # 型定義
```

- 主要なロジックやUI部品は `components/` および `lib/` に配置します。
- 型定義は `types/` にまとめて管理します。

### ディレクトリ構成

| ページ           | パス                       | 内容                                      |
| ---------------- | -------------------------- | ----------------------------------------- |
| トップページ     | `/`                        | 最新記事一覧（新着順）                    |
| 記事ページ       | `/posts/[slug]`            | 個別記事ページ                            |
| アーカイブ（年） | `/archives/[year]`         | 指定年のすべての記事                      |
| アーカイブ（月） | `/archives/[year]/[month]` | 指定年月のすべての記事                    |
| カテゴリーページ | `/categories/[category]`   | 指定カテゴリーのすべての記事              |
| About ページ     | `/about`                   | サイトやあなたの紹介                      |
| 検索結果ページ   | `/search?q=...`            | キーワードによる記事検索結果              |
| 管理画面（任意） | `/admin`                   | Markdown/画像の投稿・編集画面（認証付き） |

**`app/` 以下の構成**

```
app/
├── layout.tsx
├── page.tsx              # トップページ
├── posts/
│   └── [slug]/
│       └── page.tsx      # 記事詳細
├── archives/
│   └── [year]/
│       └── page.tsx      # 年別アーカイブ
│       └── [month]/
│           └── page.tsx  # 月別アーカイブ
├── categories/
│   └── [category]/
│       └── page.tsx      # カテゴリー別記事
├── search/
│   └── page.tsx          # 検索結果ページ
├── about/
│   └── page.tsx          # Aboutページ
├── admin/
│   └── page.tsx          # 管理画面
        └── post/
        │   └── page.tsx  # 記事投稿・編集画面
        │       └── preview/
        │           └── page.tsx  # 投稿のプレビュー
        └── images/
            └── page.tsx  # 画像一覧（投稿・削除画面）
```

**ブログ投稿**

- Markdown は Firebase Firestore に保存
- 画像は Firebase Storage に保存
- サーバ側で記事を取得（`fetch` や `server component` を使用）
- SEO 対策も考慮

### About ページ

文章は後で入れる

### 記事

#### データ

- `id`: Firestore Database が自動で付与
- `title` (string, optional): タイトル
- `slug` (string): スラッグ（UI では URL と案内する）
- `publishDate` (timestamp): 投稿日時（自動生成）
- `updateDate` (timestamp, optional): 更新日時（自動生成）
- `category` (string, optional): カテゴリ（一つのみ）
- `tags` (string, optional): タグ（複数・将来拡張用）
- `content` (string, optional): Markdown テキスト
- `isPublic` (bool): 公開中か（`false`: 下書き）

### 検索結果

- 検索ボックスを表示
- その下に、検索結果を表示
- 記事一覧表示は `PostList` コンポーネントを使用
- 該当する記事がない場合は、「の検索結果はありませんでした。」と表示。例）「あ」と検索して該当なし：「あ の検索結果はありませんでした。」

### Admin

- 削除時は常に確認をするようにする

**`admin`**

- 上部：「新しい投稿」「画像管理」（ui の Button）
- 下部：投稿を表で表示（ui の Table）。参考：https://ui.shadcn.com/docs/components/data-table
    - 記事タイトル（クリックで編集ページへ）
    - カテゴリー
    - 投稿日時（昇降順並び替え可能）
    - 更新日時（昇降順並び替え可能）
    - ページを見る（新しいタブで記事のページへ）
    - 下書きに戻すボタン
    - 削除

**`admin/post`**

- 左ペイン
    - タイトル・本文入力欄・公開 or 更新ボタン・下書き保存ボタン・プレビューボタン
        - 公開 or 更新ボタンを押したとき、正常に登録できるか確認する（`slug` の確認、ネットワークエラーなく登録できたかの確認など）
- 右サイドバー
    - slug 入力
    - カテゴリー入力
    - アップロード済み画像をパネル表示（ui の ScrollArea で独立させる）。ここから選択して貼り付け可能。カーソルの位置に画像挿入。画像アップロードボタンも
- 画像詳細ウィンドウ
  - 画像をアップロードした後や画像をパネルからクリックした際に画面にオーバレイする形で表示
  - 画像を大きく表示する詳細表示ウィンドウ（別ウィンドウではなく、全画面広告と同じ要領）
  - 右上に「バツ」マーク。押すとウィンドウが消える
  - 中央に画像
  - 中央下（画像の下）に「この画像を本文に貼り付ける」ボタン。押すと本文に貼り付けられる。

**操作**

- 本文入力欄では、`Ctrl + Z` で undo 可能。画像の貼り付けに関しても undo する
- 「公開」/「更新」ボタン：公開の場合は新しいデータを追加する。更新の場合は既存のデータを更新する。
  - 公開：id なしの新規投稿 or id ありで `isPublic = False` の場合に表示
  - 更新：id ありで `isPublic = True` の場合に表示
- 「下書きを保存」ボタン：`isPublic = False` で新しいデータを保存する
  - `isPublic = False` の場合に表示
- id ありの場合で `slug` が変更されて「公開」「更新」「下書きを保存」のいずれかのボタンが押された場合、URL が変更されるが問題ないか尋ねる
- 「プレビュー」ボタンを押すと、現在入力されている内容（保存されている内容**ではない**）をもとに、ブログ記事を新しいタブでプレビューする（`admin/post/preview`）
- 「画像をアップロード」ボタンから画像をアップロードした際、画像詳細ウィンドウを開く（「画像をアップロード」ボタンでは貼り付けは行わない）
- 変更内容がある状態でページを更新、移動、閉じようとした際に警告する

**`admin/post/preview`**

- ポストをプレビューする

**`admin/images`**

- 画像の追加、削除ボタン（ui の Button）
- 画像一覧をパネル表示するエリア（ui の ScrollArea で独立させる）
- 画像を追加した際、名前が重複する場合は自動で調整
- 画像をクリックすると、画像詳細ウィンドウがオーバーレイする（`admin/post` と同じもの。コンポーネント化すること）

#### 認証（`admin` 以下の各ページ）

- Firebase Authentication を使用（GitHub アカウントで認証）
- 未ログインの場合は、ログイン画面を表示
- ログイン済みかつ管理者の場合は、Admin ページを表示

**管理者**

カスタムクレーム `admin` を追加済み

### コンポーネント（`components`）

- `Header`（ナビゲーション）
    - 左揃えでブログタイトル（クリックすると `/` へ）
    - 右揃えでナビゲーションメニュー：
        - `/`（Home）：トップページ
        - `about`（About）：Aboutページ
        - `HP`（HP）：`https://akimasanishida.com` へ遷移
        - `Admin`：管理者でログイン済みの場合に表示。クリックで `/admin/` へ
        - `Logout` ボタン：ログイン済みの場合に表示。クリックでログアウト
- `Footer`
    - アーカイブ・カテゴリー一覧・検索を3カラムで表示
        - アーカイブ：記事が存在する年を一覧表示。先頭にトグル ▶ を付与。年をクリックすると、年別アーカイブページに遷移し、トグルをクリックすると、年の下に月別アーカイブを表示。その年が開かれている場合、トグルは ▼ に変化。アーカイブページや投稿記事では、その年のトグルが開かれている状態で表示される。それ以外の場合は、最新の年が開かれている状態で表示される。
            - 月については、記事が存在する月を一覧表示。先頭は通常の箇条書きの点を付与。月をクリックすると、月別アーカイブページに遷移する。
        - カテゴリー：カテゴリーを通常のリストで一覧表示。カテゴリーをクリックすると、カテゴリー別記事ページに遷移する。
        - 検索：検索ボックスを表示。キーワードを入力して Enter を押す or 虫眼鏡ボタンを押すと、検索結果ページに遷移する。
    - その下に著作権表示
- `SearchBox`（検索ボックス）
    - 検索ボックスを表示。キーワードを入力して Enter を押す or 虫眼鏡ボタンを押すと、検索結果ページに遷移する。
- `PostList`（記事一覧）
    - 記事のタイトル・投稿日・更新日（あれば）・カテゴリを表示
- `LoginForm`（ログインフォーム）
- `PostArticle`：投稿を表示するコンポーネント

### ライブラリ（`lib`）

- firebase.ts: Firebase を用いたデータの取得・送信
  - `getAllPosts`: すべての公開中の投稿を取得する
  - `getAllPostsForAdmin`: 下書きを含むすべての投稿を取得する
  - `getPostBySlug`: slug を用いて公開中の投稿とその中身を取得する
- firebaseAdmin.ts: Firebase の Admin 操作を行うための権限を取得
- format.ts: 日付時刻のフォーマット
  - `formatJpDateFromDate`: `Date` をフォーマット済み日付時刻文字列へ変換
  - `formatJpDateFromString`: `string` をフォーマット済み日付時刻文字列へ変換
  - `formatJpDateFromTimestamp`: Firebase の `Timestamp` をフォーマット済み日付時刻文字列へ変換
- markdown.ts: マークダウンのレンダリング
  - `renderMarkdownToHTML`: Markdown を HTML へレンダリング
- pagination.ts: ページネーションのための機能
  - `paginationPosts`: 投稿一覧より、指定されたページのみの投稿一覧を返す
- utils.ts: 外部ライブラリにより作成されたと思われる

### 型（`types`）

- image.ts
  - `ImageInfo`: 画像の情報
- post.ts
  - `Post`: 投稿の情報
  - `PostWithId`: `Post` の拡張。Firebase Database の `id` もとる。

## 使用技術

- Next.js（App Router）
- shacdn ui（UI はこれで揃える）
- tailwindcss/typography（マークダウン用）
- Vercel
- Firebase
    - Firestore Database: データベース
    - Storage: 画像
    - Authentication: 認証
- fuse.js（全文検索）
- phosphor-icons/react（アイコン）
- Markdown→HTML変換：
    - gray-matter
    - remark-parse
    - remark-gfm
    - remark-math
    - remark-emoji
    - remark-rehype
    - rehype-katex（数式表示には KaTeX を使用）
    - rehype-prism-plus（コードハイライトに prism.js を使用）
    - rehype-autolink-headings
    - rehype-stringify

## コーディング

**テスト**

テストは不要

**linter & build**

```bash
# linter
pnpm lint

# check to build successfully
pnpm build
```

**Next.js 15 以降の非同期params**

Next.js 15 以降では、非同期関数は以下の例のように書く必要がある：

```ts
// 非同期対応したコンポーネント
const ResultPage = async ({
  params,
}: {
  params: Promise<{ id: string }>; // Promiseを付与
}) => {
  const { id } = await params; // 非同期的にparamsを展開
  const result = await fetchUserData(id); // 非同期処理
  return (
    <div>
      <h1>ID: {id}</h1>
      <p>Result Data: {JSON.stringify(result)}</p>
    </div>
  );
};

export default ResultPage;
```

こうしない場合、以下のようにエラーとなる：

```
Type error: Type '{ params: { id: string; }; }' does not satisfy the constraint 'PageProps'.
Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
```

**DO NOT USE type `any`**

`any` is prohibited in TypeScript (though it is allowed in JavaScript).
Specify a different type.

エラー例：

```
Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
```
