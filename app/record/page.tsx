'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import WaveAnimation from '../components/WaveAnimation';
import { v4 as uuidv4 } from 'uuid';
import { weightDb } from '../lib/db-wrapper';
import { WeightRecord } from '../lib/db';

export default function RecordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 体重入力用の状態
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  
  // 編集モード用の状態
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);
  
  // 運動種別の選択肢
  const exerciseTypes = [
    "ウォーキング",
    "ランニング/ジョギング",
    "サイクリング",
    "水泳",
    "筋力トレーニング",
    "ラジオ体操",
    "通勤・通学時の活動",
    "その他"
  ];

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
          // DBから体重記録を取得
          const userRecords = await weightDb.getUserWeightRecords(session.user.email);
          
          // 日付でソート（新しい順）
          const sortedRecords = [...userRecords].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setRecords(sortedRecords);
        }
      } catch (err) {
        setError('記録の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, session]);

  // 記録追加の関数
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) return;
    
    // 体重のバリデーション
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 300) {
      setError('有効な体重を入力してください');
      return;
    }
    
    try {
      // 編集モードの場合
      if (isEditing && editingRecord) {
        // 更新処理
        const updatedRecord: WeightRecord = {
          ...editingRecord,
          date,
          weight: weightValue,
          note: note || undefined,
          exercise: exerciseType ? {
            type: exerciseType,
            duration: parseInt(exerciseDuration) || 0,
            calories: exerciseCalories ? parseInt(exerciseCalories) : undefined
          } : undefined,
          updatedAt: new Date().toISOString()
        };
        
        // DBに保存
        await weightDb.updateWeightRecord(updatedRecord);
        
        // 記録リストを更新
        setRecords(records.map(r => 
          r.id === updatedRecord.id ? updatedRecord : r
        ));
        
        // 編集モードをリセット
        setIsEditing(false);
        setEditingRecord(null);
      } else {
        // 新規追加処理
        const newRecord: WeightRecord = {
          id: uuidv4(),
          userId: session.user.email,
          date,
          weight: weightValue,
          note: note || undefined,
          exercise: exerciseType ? {
            type: exerciseType,
            duration: parseInt(exerciseDuration) || 0,
            calories: exerciseCalories ? parseInt(exerciseCalories) : undefined
          } : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // DBに保存
        await weightDb.createWeightRecord(newRecord);
        
        // 記録リストを更新（新しい記録を先頭に追加）
        setRecords([newRecord, ...records]);
      }
      
      // フォームをリセット
      setDate(new Date().toISOString().split('T')[0]);
      setWeight('');
      setNote('');
      setExerciseType('');
      setExerciseDuration('');
      setExerciseCalories('');
      setError('');
      
    } catch (err) {
      setError('記録の保存に失敗しました');
      console.error(err);
    }
  };
  
  // 記録編集の関数
  const handleEditRecord = (record: WeightRecord) => {
    setIsEditing(true);
    setEditingRecord(record);
    
    // フォームに値をセット
    setDate(record.date);
    setWeight(record.weight.toString());
    setNote(record.note || '');
    if (record.exercise) {
      setExerciseType(record.exercise.type);
      setExerciseDuration(record.exercise.duration.toString());
      setExerciseCalories(record.exercise.calories?.toString() || '');
    } else {
      setExerciseType('');
      setExerciseDuration('');
      setExerciseCalories('');
    }
  };
  
  // 記録削除の関数
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('この記録を削除してもよろしいですか？')) return;
    
    try {
      if (session?.user?.email) {
        // DBから削除
        await weightDb.deleteWeightRecord(session.user.email, id);
        
        // 記録リストを更新
        setRecords(records.filter(r => r.id !== id));
      }
    } catch (err) {
      setError('記録の削除に失敗しました');
      console.error(err);
    }
  };
  
  // 体重の変化を計算（前回からの増減）
  const calculateWeightChange = (currentIndex: number): number | null => {
    if (currentIndex >= records.length - 1) return null;
    
    const currentWeight = records[currentIndex].weight;
    const previousWeight = records[currentIndex + 1].weight;
    
    return currentWeight - previousWeight;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">体重記録</h1>
        
        {/* エラーメッセージ */}
        {error && (
          <motion.div
            variants={item}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        {/* 記録フォーム */}
        <motion.div
          variants={item}
          className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? '記録を編集' : '新しい記録を追加'}
          </h2>
          
          <form onSubmit={handleAddRecord}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  日付
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1"
                  min="0"
                  max="300"
                  required
                  placeholder="例: 67.5"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  メモ (任意)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="今日の状態や運動など"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  運動種別 (任意)
                </label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ height: '42px' }}
                >
                  <option value="">選択してください</option>
                  {exerciseTypes.map((type) => (
                    <option key={type} value={type} className="bg-white">{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  運動時間 (分) (任意)
                </label>
                <input
                  type="number"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  min="0"
                  max="1440"
                  placeholder="例: 30"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  消費カロリー (kcal) (任意)
                </label>
                <input
                  type="number"
                  value={exerciseCalories}
                  onChange={(e) => setExerciseCalories(e.target.value)}
                  min="0"
                  max="10000"
                  placeholder="例: 150"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingRecord(null);
                    setDate(new Date().toISOString().split('T')[0]);
                    setWeight('');
                    setNote('');
                    setExerciseType('');
                    setExerciseDuration('');
                    setExerciseCalories('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                {isEditing ? '更新する' : '記録する'}
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* 記録リスト */}
        <motion.div
          variants={item}
          className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">体重記録一覧</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">データを読み込み中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">まだ体重記録がありません。最初の記録を追加しましょう！</p>
              <p className="text-gray-600 mb-6">上のフォームから体重を記録して、健康管理を始めましょう。</p>
              <div className="flex justify-center">
                <a
                  href="/goals"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  目標を設定する
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">体重</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">変化</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">運動</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-50/50 divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={record.id} className="hover:bg-blue-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{record.weight} kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {calculateWeightChange(index) !== null ? (
                          <span className={`font-medium ${calculateWeightChange(index)! < 0 ? 'text-green-600' : calculateWeightChange(index)! > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {calculateWeightChange(index)! < 0 ? '' : '+'}
                            {calculateWeightChange(index)!.toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.note || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.exercise ? (
                          <span>
                            {record.exercise.type} ({record.exercise.duration}分
                            {record.exercise.calories ? `, ${record.exercise.calories}kcal` : ''})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
