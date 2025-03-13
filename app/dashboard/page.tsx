'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import WaveAnimation from '../components/WaveAnimation';
import { useEffect, useState } from 'react';
import { weightDb, goalDb } from '../lib/db-wrapper';
import { WeightRecord, Goal } from '../lib/db';
import { useSession } from 'next-auth/react';
import { ChartData } from 'chart.js';

// Chart.jsをクライアントサイドのみでロードするように設定
const DynamicChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
);

// Chart.jsの設定を動的にインポート
const ChartSetup = dynamic(
  () => import('../components/ChartSetup').then((mod) => mod.default),
  { ssr: false }
);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
  animation: {
    duration: 2000,
  },
};

export default function Dashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.email || 'guest';
  
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: '体重',
        data: [],
        borderColor: 'rgb(156, 39, 176)',
        backgroundColor: 'rgba(156, 39, 176, 0.5)',
        tension: 0.4,
      },
    ],
  });

  // データを取得する
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 体重記録を取得
        const records = await weightDb.getUserWeightRecords(userId);
        setWeightRecords(records);
        
        // 目標を取得 - 最初の目標を使用
        const userGoals = await goalDb.getUserGoals(userId);
        if (userGoals.length > 0) {
          setGoal(userGoals[0]);
        }
        
        // グラフ用データを準備
        if (records.length > 0) {
          const sortedRecords = [...records].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          const labels = sortedRecords.map(record => {
            const date = new Date(record.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          });
          
          const weights = sortedRecords.map(record => record.weight);
          
          setChartData({
            labels,
            datasets: [
              {
                label: '体重',
                data: weights,
                borderColor: 'rgb(156, 39, 176)',
                backgroundColor: 'rgba(156, 39, 176, 0.5)',
                tension: 0.4,
              },
            ],
          });
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 現在の体重（最新の記録）
  const currentWeight = weightRecords.length > 0 
    ? weightRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight 
    : 0;
    
  // 目標体重
  const targetWeight = goal?.targetWeight || 0;
  
  // 残りの減量
  const remainingWeight = Math.max(0, currentWeight - targetWeight).toFixed(1);
  
  // 統計データ
  const averageWeight = weightRecords.length > 0 
    ? (weightRecords.reduce((sum, record) => sum + record.weight, 0) / weightRecords.length).toFixed(1) 
    : 0;
    
  const minWeight = weightRecords.length > 0 
    ? Math.min(...weightRecords.map(record => record.weight)).toFixed(1) 
    : 0;
    
  const maxWeight = weightRecords.length > 0 
    ? Math.max(...weightRecords.map(record => record.weight)).toFixed(1) 
    : 0;
    
  const weightLoss = weightRecords.length > 1 
    ? (Math.max(...weightRecords.map(record => record.weight)) - currentWeight).toFixed(1) 
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen lavender-gradient-bg pt-20 flex items-center justify-center">
        <div className="text-purple-700 text-xl">データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lavender-gradient-bg pt-20">
      <WaveAnimation />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {weightRecords.length === 0 ? (
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">データがありません</h2>
            <p className="text-gray-600 mb-6">
              まだデータがありません。まずは目標を設定して、体重記録を始めましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/goals"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                目標を設定する
              </a>
              <a
                href="/record"
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-center"
              >
                体重を記録する
              </a>
            </div>
          </motion.div>
        ) : (
          <>
            {/* 現在の状態カード */}
            <motion.div
              variants={item}
              className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8 hover:scale-[1.02] transition-transform duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">現在の状態</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-600">現在の体重</p>
                  <p className="text-4xl font-bold text-purple-600">{currentWeight} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">目標体重</p>
                  <p className="text-4xl font-bold text-purple-700">{targetWeight} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">残り</p>
                  <p className="text-4xl font-bold text-purple-500">{remainingWeight} kg</p>
                </div>
              </div>
            </motion.div>

            {/* グラフカード */}
            <motion.div
              variants={item}
              className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8 hover:scale-[1.02] transition-transform duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">体重推移</h2>
              <div className="h-[300px]">
                <ChartSetup />
                <DynamicChart data={chartData} options={chartOptions} />
              </div>
            </motion.div>

            {/* 統計カード */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <div className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">統計</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">平均体重</p>
                    <p className="text-2xl font-bold text-purple-600">{averageWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">最低体重</p>
                    <p className="text-2xl font-bold text-purple-600">{minWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">最高体重</p>
                    <p className="text-2xl font-bold text-purple-600">{maxWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">減量</p>
                    <p className="text-2xl font-bold text-purple-600">{weightLoss} kg</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">目標達成予測</h2>
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-600 mb-2">目標達成まで</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {goal && currentWeight > targetWeight ? 
                      `約${Math.ceil((currentWeight - targetWeight) / 0.5 * 7)}日` : 
                      '達成済み'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
