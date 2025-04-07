# 体重管理アプリ

体重管理と健康目標達成をサポートするためのウェブアプリケーションです。

## デプロイ先

アプリケーションは以下のURLでデプロイされています：
https://weight-control-nu.vercel.app/

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Vercel KV (Redis)
- **認証**: NextAuth.js（Google OAuth）
- **グラフ表示**: Chart.js
- **アニメーション**: Framer Motion
- **デプロイ**: Vercel

## 環境構築

1. リポジトリをクローン
```bash
git clone <repository-url>
cd weight_control_app
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数の設定
   - `.env.local.example`を`.env.local`にリネーム
   - 以下の環境変数を設定
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
NEXT_PUBLIC_KV_REST_API_URL=your-kv-rest-api-url
NEXT_PUBLIC_KV_REST_API_TOKEN=your-kv-rest-api-token
```

4. 開発サーバー起動
```bash
npm run dev
```

## データモデル

### User
- id (string): ユーザーID
- email (string): メールアドレス
- name (string): 名前
- picture (string): プロフィール画像URL
- height (number): 身長
- gender (string): 性別
- birthdate (string): 生年月日
- createdAt (string): 作成日時

### WeightRecord
- id (string): 記録ID
- userId (string): ユーザーID
- date (string): 記録日
- weight (number): 体重
- note (string): メモ
- exercise (object): 運動記録（任意）
- createdAt (string): 作成日時
- updatedAt (string): 更新日時

### Goal
- id (string): 目標ID
- userId (string): ユーザーID
- targetWeight (number): 目標体重
- startWeight (number): 開始時体重
- startDate (string): 開始日
- targetDate (string): 目標達成日
- createdAt (string): 作成日時
- updatedAt (string): 更新日時

### UserSettings
- userId (string): ユーザーID
- weightUnit (string): 体重単位（kg/lb）
- heightUnit (string): 身長単位（cm/in）
- notifications (boolean): 通知設定
- updatedAt (string): 更新日時

## 機能一覧

- ユーザー認証（Google OAuth）
- 体重記録の登録・管理
- 目標設定と進捗管理
- 体重推移のグラフ表示
- 統計情報の表示
- ユーザー設定のカスタマイズ

## アプリケーション構造

```
weight_control_app/
├── app/
│   ├── api/            # API Routes
│   ├── auth/           # 認証関連ページ
│   ├── components/     # 共通コンポーネント
│   ├── dashboard/      # ダッシュボードページ
│   ├── record/         # 体重記録ページ
│   ├── goals/          # 目標設定ページ
│   ├── stats/          # 統計情報ページ
│   ├── settings/       # 設定ページ
│   ├── lib/            # ユーティリティ関数
│   │   ├── auth-options.ts  # 認証設定
│   │   ├── db.ts           # データベース操作
│   │   ├── redis.ts        # Redis接続
│   └── ...
├── public/             # 静的ファイル
└── ...
```

## コマンド

- `npm run dev`: 開発サーバーの起動 (Turbopack使用)
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバーの起動
- `npm run lint`: コードの静的解析
