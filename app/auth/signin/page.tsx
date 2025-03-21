'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import WaveAnimation from '@/app/components/WaveAnimation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <WaveAnimation />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-lg bg-white/30 rounded-2xl p-8 shadow-lg max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Weight Control</h1>
          <p className="text-gray-600">簡単な体重管理で健康的な毎日を</p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <FaGoogle className="text-red-500 mr-3" />
          Googleでサインイン
        </button>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>サインインすることで、当サービスの</p>
          <p className="mt-1">
            <Link href="/terms" className="text-blue-500 hover:underline">利用規約</Link>
            {' '}および{' '}
            <Link href="/privacy" className="text-blue-500 hover:underline">プライバシーポリシー</Link>
            に同意したことになります。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
