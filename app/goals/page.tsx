'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaSave, FaTrash, FaArrowRight } from 'react-icons/fa';
import WaveAnimation from '../components/WaveAnimation';
import { v4 as uuidv4 } from 'uuid';
import { goalDb, weightDb } from '../lib/db-wrapper';
import { Goal, WeightRecord } from '../lib/db';

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 目標設定用の状態
  const [targetWeight, setTargetWeight] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    // 認証状態をチェック
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // データ取得
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (session?.user?.email) {
          // 目標データを取得
          const response = await fetch('/api/goals', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const userGoals = await response.json();
          setGoals(userGoals);
          
          // 最新の体重記録を取得して現在の体重として使用
          const weightRecordsResponse = await fetch('/api/weight-records', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const weightRecords = await weightRecordsResponse.json();
          if (weightRecords.length > 0) {
            // 日付でソートして最新の記録を取得
            const sortedRecords = [...weightRecords].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setCurrentWeight(sortedRecords[0].weight);
          }
        }
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, session]);

  // 目標設定の関数
  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) return;
    
    // バリデーション
    const targetWeightValue = parseFloat(targetWeight);
    if (isNaN(targetWeightValue) || targetWeightValue <= 0 || targetWeightValue > 300) {
      setError('有効な目標体重を入力してください');
      return;
    }
    
    if (!targetDate) {
      setError('目標日を設定してください');
      return;
    }
    
    const start = new Date(startDate);
    const target = new Date(targetDate);
    
    if (target <= start) {
      setError('目標日は開始日より後に設定してください');
      return;
    }
    
    try {
      // 新しい目標を作成
      const newGoal: Goal = {
        id: uuidv4(),
        userId: session.user.email,
        targetWeight: targetWeightValue,
        startDate,
        targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // APIを使用してDBに保存
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '目標の保存に失敗しました');
      }
      
      // 目標リストを更新
      setGoals([...goals, newGoal]);
      
      // フォームをリセット
      setTargetWeight('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setTargetDate('');
      setError('');
      
    } catch (err) {
      setError('目標の保存に失敗しました');
      console.error(err);
    }
  };
  
  // 目標削除の関数
  const handleDeleteGoal = async (id: string) => {
    if (!confirm('この目標を削除してもよろしいですか？')) return;
    
    try {
      if (session?.user?.email) {
        // APIを使用してDBから削除
        const response = await fetch(`/api/goals?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '目標の削除に失敗しました');
        }
        
        // 目標リストを更新
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (err) {
      setError('目標の削除に失敗しました');
      console.error(err);
    }
  };
  
  // 目標達成までの日数を計算
  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // 目標達成までの進捗率を計算
  const calculateProgress = (goal: Goal) => {
    if (currentWeight === null) return 0;
    
    const startWeight = goal.startWeight || currentWeight;
    const targetWeight = goal.targetWeight;
    
    // 増量目標の場合
    if (targetWeight > startWeight) {
      if (currentWeight >= targetWeight) return 100;
      const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
    // 減量目標の場合
    else {
      if (currentWeight <= targetWeight) return 100;
      const progress = ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <WaveAnimation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">目標設定</h1>
        
        {/* 目標設定フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-lg bg-white/30 rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">新しい目標を設定</h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSetGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">目標体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 65.0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">開始日</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">目標日</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaSave className="mr-2" />
                目標を設定
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* 目標リスト */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">あなたの目標</h2>
          
          {loading ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : goals.length === 0 ? (
            <p className="text-gray-500">目標が設定されていません。新しい目標を設定しましょう。</p>
          ) : (
            goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-lg bg-white/30 rounded-xl p-6 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      目標体重: {goal.targetWeight} kg
                    </h3>
                    <p className="text-gray-600">
                      開始日: {new Date(goal.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      目標日: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center">
                    <span className="text-blue-600 font-semibold mr-4">
                      残り {calculateDaysRemaining(goal.targetDate)} 日
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="目標を削除"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {/* 進捗バー */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>進捗状況</span>
                    <span>{Math.round(calculateProgress(goal))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${calculateProgress(goal)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 現在の体重と目標までの差 */}
                {currentWeight !== null && (
                  <div className="mt-4 flex items-center text-gray-700">
                    <span className="font-medium">現在: {currentWeight} kg</span>
                    <FaArrowRight className="mx-3 text-gray-400" />
                    <span className="font-medium">目標: {goal.targetWeight} kg</span>
                    <span className="ml-4 text-sm">
                      (あと {Math.abs(currentWeight - goal.targetWeight).toFixed(1)} kg)
                    </span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
