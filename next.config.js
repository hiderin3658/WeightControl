/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 本番ビルド時のESLintチェックを無効化
    ignoreDuringBuilds: true,
  },
  // 画像最適化の警告を抑制
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
