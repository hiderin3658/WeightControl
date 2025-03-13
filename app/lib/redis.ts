import { Redis } from '@upstash/redis';

// Upstash Redisクライアントの初期化
// Vercel KV互換モードの環境変数を使用
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

export default redis;
