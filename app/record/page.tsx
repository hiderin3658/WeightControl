'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaSave, FaTrash, FaEdit } from 'react-icons/fa';
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
  
  // 体重記録用の状態
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  // 編集モード用の状態
  const [editMode, setEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);

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
          // APIを使用して体重記録を取得
          const response = await fetch('/api/weight-records', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('体重記録の取得に失敗しました');
          }
          
          const data = await response.json();
          setRecords(data);
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

  // 体重記録の保存関数
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) return;
    
    // バリデーション
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 300) {
      setError('有効な体重を入力してください');
      return;
    }
    
    if (!date) {
      setError('日付を設定してください');
      return;
    }
    
    try {
      if (editMode && editingRecord) {
        // 既存の記録を更新
        const updatedRecord: WeightRecord = {
          ...editingRecord,
          weight: weightValue,
          date,
          note,
          updatedAt: new Date().toISOString()
        };
        
        // APIを使用して更新
        const response = await fetch('/api/weight-records', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRecord),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '記録の更新に失敗しました');
        }
        
        // 記録リストを更新
        setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
        
        // 編集モードを終了
        setEditMode(false);
        setEditingRecord(null);
      } else {
        // 新しい記録を作成
        const newRecord: WeightRecord = {
          id: uuidv4(),
          userId: session.user.email,
          weight: weightValue,
          date,
          note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // APIを使用して保存
        const response = await fetch('/api/weight-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRecord),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '記録の保存に失敗しました');
        }
        
        // 記録リストを更新
        setRecords([...records, newRecord]);
      }
      
      // フォームをリセット
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setError('');
      
    } catch (err) {
      setError('記録の保存に失敗しました');
      console.error(err);
    }
  };
  
  // 記録編集の開始
  const handleEditRecord = (record: WeightRecord) => {
    setEditMode(true);
    setEditingRecord(record);
    setWeight(record.weight.toString());
    setDate(record.date);
    setNote(record.note || '');
  };
  
  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingRecord(null);
    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };
  
  // 記録削除の関数
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('この記録を削除してもよろしいですか？')) return;
    
    try {
      if (session?.user?.email) {
        // APIを使用して削除
        const response = await fetch(`/api/weight-records?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '記録の削除に失敗しました');
        }
        
        // 記録リストを更新
        setRecords(records.filter(r => r.id !== id));
      }
    } catch (err) {
      setError('記録の削除に失敗しました');
      console.error(err);
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
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">体重記録</h1>
        
        {/* 体重記録フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-lg bg-white/30 rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editMode ? '記録を編集' : '新しい記録を追加'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 65.0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">メモ (任意)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 朝食前に測定"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaSave className="mr-2" />
                {editMode ? '更新' : '記録'}
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* 記録リスト */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">記録履歴</h2>
          
          {loading ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : records.length === 0 ? (
            <p className="text-gray-500">記録がありません。新しい記録を追加しましょう。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white/30 backdrop-blur-lg rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">体重 (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <tr key={record.id} className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {record.weight} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {record.note || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            aria-label="編集"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="削除"
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
        </div>
      </div>
    </div>
  );
}
