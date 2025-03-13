import { Redis } from '@upstash/redis';

// Upstash Redisクライアントの初期化
// サーバーサイドとクライアントサイドの両方で動作するように環境変数を選択
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.NEXT_PUBLIC_KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || '',
});

export default redis;
