'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import WaveAnimation from '@/app/components/WaveAnimation';

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <WaveAnimation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-lg bg-white/30 rounded-2xl p-8 shadow-lg max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ログアウトしますか？</h1>
        
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </motion.div>
    </div>
  );
}
