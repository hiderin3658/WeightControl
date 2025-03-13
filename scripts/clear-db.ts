import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// .env.localファイルから環境変数を読み込む
dotenv.config({ path: '.env.local' });

// 環境変数の状態をデバッグ出力
console.log('環境変数の状態:', {
  KV_REST_API_URL: process.env.KV_REST_API_URL ? '設定済み' : '未設定',
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '設定済み' : '未設定',
  NEXT_PUBLIC_KV_REST_API_URL: process.env.NEXT_PUBLIC_KV_REST_API_URL ? '設定済み' : '未設定',
  NEXT_PUBLIC_KV_REST_API_TOKEN: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN ? '設定済み' : '未設定'
});

async function clearDatabase() {
  try {
    // 環境変数から直接Redisクライアントを初期化（NEXT_PUBLIC_プレフィックスの環境変数も使用）
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || process.env.NEXT_PUBLIC_KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || '',
    });

    // FLUSHDBコマンドを実行してデータベースをクリア
    const result = await redis.flushdb();
    console.log('データベースのクリア結果:', result);
    console.log('データベースがクリアされました！');
  } catch (error) {
    console.error('データベースのクリア中にエラーが発生しました:', error);
  } finally {
    process.exit(0);
  }
}

clearDatabase();
