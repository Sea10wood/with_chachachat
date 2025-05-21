# Next.js + Supabase 認証アプリケーション

このプロジェクトは、Next.jsとSupabaseを使用した認証機能付きのWebアプリケーションです。

## 技術スタック

- **フロントエンド**
  - Next.js (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - Geist (フォント)

- **バックエンド/認証**
  - Supabase
  - Supabase Auth Helpers for Next.js
  - Supabase SSR

## プロジェクト構成

```
.
├── app/                 # Next.js App Routerのページコンポーネント
├── components/         # 再利用可能なReactコンポーネント
├── types/             # TypeScript型定義
├── utils/             # ユーティリティ関数
├── middleware.ts      # Next.jsミドルウェア（認証制御）
├── next.config.js     # Next.js設定
├── tailwind.config.js # Tailwind CSS設定
└── tsconfig.json      # TypeScript設定
```

## 主な機能

- Supabaseを使用した認証システム
- クッキーベースのセッション管理
- サーバーサイドレンダリング（SSR）対応
- ミドルウェアによる認証保護
- モダンなUI（Tailwind CSS）
- メモリベースのレート制限（1分間に10リクエストまで）

## 開発環境のセットアップ

1. 必要なパッケージのインストール:
   ```bash
   npm install
   ```

2. 環境変数の設定:
   `.env.local`ファイルを作成し、以下の変数を設定:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. 開発サーバーの起動:
   ```bash
   npm run dev
   ```
