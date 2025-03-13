# Weight Control App 設計書

## 概要
このアプリケーションは、ユーザーが体重管理を効率的に行うための総合的なウェブアプリケーションです。ユーザーフレンドリーなインターフェースと視覚的なデータ表示により、体重の追跡、目標設定、進捗管理を容易にします。

## 技術スタック
- **フレームワーク**: Next.js (App Router)
- **認証**: Google OAuth
- **データベース**: Vercel KV (Redis互換)
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **グラフ表示**: Chart.js
- **アイコン**: React Icons
- **フォント**: Geist Sans, Geist Mono
- **デプロイメント**: Vercel (無料枠)

## アプリケーション構造

```
weight_control_app/
├── app/
│   ├── api/            # API Routes
│   │   ├── auth/       # 認証関連API
│   │   ├── weight/     # 体重データ関連API
│   │   └── goals/      # 目標設定関連API
│   ├── components/     # 共通コンポーネント
│   │   ├── Header.tsx
│   │   ├── ChartSetup.tsx
│   │   ├── WaveAnimation.tsx
│   │   └── ...
│   ├── dashboard/      # ダッシュボードページ
│   │   └── page.tsx
│   ├── record/         # 体重記録ページ
│   │   └── page.tsx
│   ├── goals/          # 目標設定ページ
│   │   └── page.tsx
│   ├── settings/       # 設定ページ
│   │   └── page.tsx
│   ├── lib/            # ユーティリティ関数
│   │   ├── auth.ts     # 認証関連
│   │   ├── db.ts       # データベース接続
│   │   └── ...
│   ├── globals.css     # グローバルスタイル
│   └── layout.tsx      # ルートレイアウト
└── public/             # 静的ファイル
```

## 機能仕様

### 1. 認証機能
- Google OAuthによるサインイン
- セッション管理
- 認証状態の保持
- ログアウト機能

### 2. ダッシュボード
- 体重推移グラフ（Chart.js）
- 現在の体重、目標体重、残り体重の表示
- 主要統計情報（今月の減量、平均体重、BMI、目標達成率）
- アニメーションによる視覚的な演出（Framer Motion）

### 3. 体重記録機能
- 日付と体重の記録フォーム
- 過去の記録一覧表示
- 記録の編集・削除機能
- 体重入力のバリデーション

### 4. 目標設定機能
- 目標体重の設定
- 目標達成日の設定
- 進捗状況の視覚化
- 達成予測の計算・表示

### 5. 設定機能
- ユーザープロフィール設定（身長、年齢、性別など）
- 単位設定（kg/lbなど）
- 通知設定
- アカウント管理

## データモデル

### ユーザー
```json
{
  "id": "ユーザーID（Google OAuthから）",
  "email": "メールアドレス",
  "name": "名前",
  "picture": "プロフィール画像URL",
  "height": "身長（cm）",
  "gender": "性別",
  "birthdate": "生年月日",
  "createdAt": "作成日時"
}
```

### 体重記録
```json
{
  "id": "記録ID",
  "userId": "ユーザーID",
  "date": "記録日",
  "weight": "体重（kg）",
  "note": "メモ（オプション）",
  "createdAt": "作成日時",
  "updatedAt": "更新日時"
}
```

### 目標設定
```json
{
  "id": "目標ID",
  "userId": "ユーザーID",
  "targetWeight": "目標体重（kg）",
  "startDate": "開始日",
  "targetDate": "目標達成日",
  "createdAt": "作成日時",
  "updatedAt": "更新日時"
}
```

### 設定
```json
{
  "userId": "ユーザーID",
  "weightUnit": "体重単位（kg/lb）",
  "heightUnit": "身長単位（cm/in）",
  "notifications": "通知設定（オン/オフ）",
  "updatedAt": "更新日時"
}
```

## UI設計

### 全体的なテーマ
- 青を基調としたカラースキーム
- 視認性の高いコントラスト
- レスポンシブデザイン
- ガラスモーフィズム（半透明効果）を取り入れたモダンなUI
- Framer Motionを活用したスムーズなアニメーション

### ヘッダー
- アプリ名とナビゲーションリンク
- ナビゲーション項目：ダッシュボード、記録、目標、設定
- アイコンと文字の組み合わせ
- アクティブページのハイライト

### ダッシュボード
- 現在の状態カード（現在の体重、目標体重、残り）
- 体重推移グラフ（Chart.js）
- 統計情報カード（今月の減量、平均体重、BMI、目標達成率）
- 波のアニメーション効果による背景装飾

### 体重記録ページ
- 日付選択と体重入力フォーム
- 登録ボタン
- 過去の記録一覧（日付順）
- 編集・削除機能

### 目標設定ページ
- 目標体重入力
- 目標達成日設定
- 進捗バー
- 予測達成グラフ

### 設定ページ
- プロフィール設定セクション
- 単位設定セクション
- 通知設定セクション
- アカウント管理セクション

## API設計

### 認証API
- `/api/auth/signin` - Google認証開始
- `/api/auth/callback` - Google認証コールバック
- `/api/auth/signout` - サインアウト
- `/api/auth/session` - セッション情報取得

### 体重記録API
- `GET /api/weight` - 体重記録の取得
- `POST /api/weight` - 新規体重記録
- `PUT /api/weight/:id` - 体重記録の更新
- `DELETE /api/weight/:id` - 体重記録の削除

### 目標設定API
- `GET /api/goals` - 目標設定の取得
- `POST /api/goals` - 新規目標設定
- `PUT /api/goals/:id` - 目標設定の更新
- `DELETE /api/goals/:id` - 目標設定の削除

### ユーザー設定API
- `GET /api/settings` - ユーザー設定の取得
- `PUT /api/settings` - ユーザー設定の更新

## 認証フロー
1. ユーザーがログインボタンをクリック
2. Google OAuth認証画面にリダイレクト
3. ユーザーがGoogleアカウントで認証
4. コールバックURLにリダイレクト
5. セッション作成とJWTトークン発行
6. アプリのダッシュボードへリダイレクト

## データフロー
1. クライアントからAPIリクエスト
2. APIルートで認証確認
3. Vercel KVとのデータのやり取り
4. レスポンスをクライアントに返却
5. UIの更新

## デプロイメント計画
- Vercel Dashboardからデプロイ
- 環境変数の設定（Google OAuth、Vercel KV接続情報）
- ドメイン設定（オプション）
- 継続的デプロイメントの設定（GitHubとの連携）

## 今後の拡張計画
- モバイルアプリ版の開発
- 食事記録機能の追加
- ソーシャル機能（友達との競争や共有）
- AIによる体重予測
- 健康アドバイスの提供

## システム要件
- モダンなブラウザ（Chrome、Firefox、Safari、Edge）
- インターネット接続
- Googleアカウント（認証用）
