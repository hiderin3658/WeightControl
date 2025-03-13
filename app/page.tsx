'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaWeight } from 'react-icons/fa';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 認証状態をチェック
    if (status === 'authenticated') {
      // 認証済みの場合はダッシュボードへ
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // 未認証の場合はサインイン画面へ
      router.push('/auth/signin');
    }
    // status === 'loading' の場合はローディング画面を表示したままにする
  }, [status, router]);

  // ローディング中の表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <FaWeight className="text-blue-600 text-5xl" />
        </div>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Weight Control</h1>
        <p className="text-gray-600">読み込み中...</p>
        <div className="mt-6">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
        </div>
      </motion.div>
    </div>
  );
}
