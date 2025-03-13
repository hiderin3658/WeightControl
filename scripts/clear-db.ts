import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// .env.localファイルから環境変数を読み込む
dotenv.config({ path: '.env.local' });

async function clearDatabase() {
  try {
    // 環境変数から直接Redisクライアントを初期化
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
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
