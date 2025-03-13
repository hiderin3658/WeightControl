'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiUser, FiSave, FiSettings } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import WaveAnimation from '../components/WaveAnimation';
import { settingsDb } from '../lib/db-wrapper';

// 設定の型定義
interface UserProfile {
  name: string;
  height: number;
  birthdate: string;
  gender: string;
}

interface Settings {
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'in';
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || 'user1'; // 開発用にデフォルト値を設定

  // プロフィール状態
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    height: 170,
    birthdate: '',
    gender: 'not-specified',
  });

  // 設定状態
  const [settings, setSettings] = useState<Settings>({
    weightUnit: 'kg',
    heightUnit: 'cm',
  });

  // 保存状態
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 実際の実装では、APIからデータを取得します
        // ここではサンプルデータを使用
        
        // ユーザー名はセッションから取得
        if (session?.user?.name) {
          setProfile(prev => ({ ...prev, name: session.user?.name || '' }));
        }
        
        // 他の設定は仮のデータを使用
        // 実際の実装では、データベースから取得します
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
      }
    };
    
    loadSettings();
  }, [session]);

  // プロフィール更新ハンドラー
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'height' ? parseFloat(value) : value,
    }));
  };

  // 設定更新ハンドラー
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // 設定保存ハンドラー
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // 実際の実装では、APIを呼び出して保存します
      await new Promise(resolve => setTimeout(resolve, 1000)); // 保存シミュレーション
      
      setSaveMessage('設定を保存しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      setSaveMessage('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  // アニメーション設定
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen lavender-gradient-bg pt-20">
      <WaveAnimation />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">設定</h1>
        
        <form onSubmit={handleSaveSettings}>
          {/* プロフィール設定 */}
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center mb-4">
              <FiUser className="text-purple-600 w-5 h-5 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">プロフィール</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  名前
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="名前"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  身長 ({settings.heightUnit})
                </label>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="身長"
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={profile.birthdate}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  性別
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ height: '42px' }}
                >
                  <option value="not-specified" className="bg-white">指定しない</option>
                  <option value="male" className="bg-white">男性</option>
                  <option value="female" className="bg-white">女性</option>
                  <option value="other" className="bg-white">その他</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* アプリ設定 */}
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center mb-4">
              <FiSettings className="text-purple-600 w-5 h-5 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">アプリ設定</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  体重の単位
                </label>
                <select
                  name="weightUnit"
                  value={settings.weightUnit}
                  onChange={handleSettingsChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ height: '42px' }}
                >
                  <option value="kg" className="bg-white">キログラム (kg)</option>
                  <option value="lb" className="bg-white">ポンド (lb)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  身長の単位
                </label>
                <select
                  name="heightUnit"
                  value={settings.heightUnit}
                  onChange={handleSettingsChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ height: '42px' }}
                >
                  <option value="cm" className="bg-white">センチメートル (cm)</option>
                  <option value="in" className="bg-white">インチ (in)</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* データエクスポート */}
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">データ管理</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  onClick={() => alert('この機能は現在開発中です')}
                >
                  データをエクスポート
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  すべての記録をCSVファイルとしてエクスポートします
                </p>
              </div>
              
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => {
                    if (confirm('すべてのデータを削除してもよろしいですか？この操作は元に戻せません。')) {
                      alert('この機能は現在開発中です');
                    }
                  }}
                >
                  すべてのデータを削除
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  すべての記録と設定を完全に削除します（この操作は元に戻せません）
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* 保存ボタン */}
          <motion.div
            variants={item}
            className="flex justify-end"
          >
            {saveMessage && (
              <div className="mr-4 py-2 px-4 bg-green-100 text-green-800 rounded-md">
                {saveMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  設定を保存
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
