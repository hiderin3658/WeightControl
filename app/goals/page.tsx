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
          const userGoals = await goalDb.getUserGoals(session.user.email);
          setGoals(userGoals);
          
          // 最新の体重記録を取得して現在の体重として使用
          const weightRecords = await weightDb.getUserWeightRecords(session.user.email);
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
      
      // DBに保存
      await goalDb.createGoal(newGoal);
      
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
        // DBから削除
        await goalDb.deleteGoal(session.user.email, id);
        
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
    
    const startWeight = currentWeight;
    const targetWeight = goal.targetWeight;
    
    // 既に目標を達成している場合
    if (currentWeight <= targetWeight) return 100;
    
    const totalWeightLoss = startWeight - targetWeight;
    const currentWeightLoss = startWeight - currentWeight;
    const progress = (currentWeightLoss / totalWeightLoss) * 100;
    
    return Math.min(Math.max(0, progress), 100);
  };
  
  // 1日あたりの必要減量を計算
  const calculateDailyWeightLoss = (goal: Goal) => {
    if (currentWeight === null) return 0;
    
    const daysRemaining = calculateDaysRemaining(goal.targetDate);
    if (daysRemaining === 0) return 0;
    
    const remainingWeight = currentWeight - goal.targetWeight;
    return remainingWeight > 0 ? remainingWeight / daysRemaining : 0;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">目標設定</h1>
        
        {/* エラーメッセージ */}
        {error && (
          <motion.div
            variants={item}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">データを読み込み中...</p>
          </div>
        ) : goals.length === 0 ? (
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8 text-center"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">新しい目標を設定</h2>
            <p className="text-gray-600 mb-4">まだ目標が設定されていません。新しい目標を設定しましょう！</p>
            <p className="text-gray-600">上のフォームから目標体重と期間を設定して、健康的な体重管理を始めましょう。</p>
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">現在の目標</h2>
            
            {goals.map((goal) => {
              const progress = currentWeight !== null ? calculateProgress(goal) : 0;
              const daysRemaining = calculateDaysRemaining(goal.targetDate);
              const dailyWeightLoss = currentWeight !== null ? calculateDailyWeightLoss(goal) : 0;
              
              return (
                <div key={goal.id} className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="text-gray-600">目標体重</p>
                      <p className="text-3xl font-bold text-purple-600">{goal.targetWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">現在の体重</p>
                      <p className="text-3xl font-bold text-purple-600">{currentWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">残り</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {currentWeight !== null ? Math.max(0, currentWeight - goal.targetWeight).toFixed(1) : '0'} kg
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-purple-600 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="text-gray-600">開始日</p>
                      <p className="font-medium">{goal.startDate}</p>
                    </div>
                    <div className="flex items-center">
                      <FaArrowRight className="text-gray-400 mx-2" />
                    </div>
                    <div>
                      <p className="text-gray-600">目標日</p>
                      <p className="font-medium">{goal.targetDate}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50/50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm">残り日数</p>
                      <p className="text-2xl font-bold text-purple-600">{daysRemaining} 日</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm">進捗率</p>
                      <p className="text-2xl font-bold text-purple-600">{progress.toFixed(1)}%</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm">1日あたりの目標</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dailyWeightLoss.toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="mr-1" />
                      <span>削除</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
        
        {/* 目標設定フォーム */}
        {goals.length === 0 && (
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">新しい目標を設定</h2>
            
            <form onSubmit={handleSetGoal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    現在の体重
                  </label>
                  <p className="text-2xl font-bold text-purple-600">{currentWeight} kg</p>
                  <p className="text-xs text-gray-500 mt-1">
                    最新の記録から自動的に設定されます
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    目標体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    step="0.1"
                    min="0"
                    max="300"
                    required
                    placeholder="例: 65.0"
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    目標日
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <FaSave className="mr-2" />
                  目標を設定する
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {/* 目標設定のヒント */}
        <motion.div
          variants={item}
          className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">目標設定のヒント</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 rounded-lg p-4">
              <h3 className="font-medium text-purple-700 mb-2">健康的な減量ペース</h3>
              <p className="text-gray-700">
                健康的な減量は、週に0.5kg〜1kgが理想的です。急激な減量は健康に悪影響を及ぼす可能性があります。
              </p>
            </div>
            
            <div className="bg-blue-50/50 rounded-lg p-4">
              <h3 className="font-medium text-purple-700 mb-2">現実的な目標設定</h3>
              <p className="text-gray-700">
                達成可能な目標を設定することが、モチベーション維持の鍵です。まずは小さな目標から始めましょう。
              </p>
            </div>
            
            <div className="bg-blue-50/50 rounded-lg p-4">
              <h3 className="font-medium text-purple-700 mb-2">継続的な記録</h3>
              <p className="text-gray-700">
                毎日同じ時間帯に体重を測定し、記録することで、より正確な進捗管理ができます。
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
