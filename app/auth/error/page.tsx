'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import WaveAnimation from '@/app/components/WaveAnimation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // エラータイプに応じたメッセージを表示
  let errorMessage = '認証中にエラーが発生しました';
  if (error === 'AccessDenied') {
    errorMessage = 'アクセスが拒否されました';
  } else if (error === 'Configuration') {
    errorMessage = '認証設定に問題があります';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <WaveAnimation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-lg bg-white/30 rounded-2xl p-8 shadow-lg max-w-md w-full text-center"
      >
        <div className="text-red-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto h-16 w-16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">認証エラー</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        
        <Link 
          href="/auth/signin"
          className="inline-block bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          サインインに戻る
        </Link>
      </motion.div>
    </div>
  );
}
