'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiCalendar, FiActivity } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import WaveAnimation from '../components/WaveAnimation';
import { weightDb } from '../lib/db-wrapper';
import { WeightRecord } from '../lib/db';

// Chart.jsをクライアントサイドのみでロードするように設定
const DynamicBarChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

const DynamicLineChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
);

// Chart.jsの設定を動的にインポート
const ChartSetup = dynamic(
  () => import('../components/ChartSetup').then((mod) => mod.default),
  { ssr: false }
);

export default function StatsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || 'user1'; // 開発用にデフォルト値を設定

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    averageWeight: 0,
    minWeight: 0,
    maxWeight: 0,
    weightLoss: 0,
    weightLossPercentage: 0,
    daysLogged: 0,
    streakDays: 0,
  });

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const records = await weightDb.getUserWeightRecords(userId);
        setWeightRecords(records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        
        // 統計情報の計算
        if (records.length > 0) {
          const weights = records.map(r => r.weight);
          const minWeight = Math.min(...weights);
          const maxWeight = Math.max(...weights);
          const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
          
          // 減量の計算（最初の記録と最新の記録を比較）
          const firstRecord = records[0];
          const lastRecord = records[records.length - 1];
          const weightLoss = firstRecord.weight - lastRecord.weight;
          const weightLossPercentage = (weightLoss / firstRecord.weight) * 100;
          
          // 記録した日数
          const uniqueDates = new Set(records.map(r => r.date.split('T')[0]));
          const daysLogged = uniqueDates.size;
          
          // 連続記録日数（簡易版）
          let streakDays = 0;
          // 実際のアプリでは連続日数の計算ロジックを実装
          
          setStats({
            averageWeight,
            minWeight,
            maxWeight,
            weightLoss,
            weightLossPercentage,
            daysLogged,
            streakDays: 5, // 仮の値
          });
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
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
  
  // 時間範囲によるデータのフィルタリング
  const getFilteredData = () => {
    if (weightRecords.length === 0) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return weightRecords.filter(record => new Date(record.date) >= cutoffDate);
  };
  
  // グラフデータの生成
  const getChartData = () => {
    const filteredData = getFilteredData();
    
    return {
      labels: filteredData.map(record => {
        const date = new Date(record.date);
        if (timeRange === 'week') {
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } else if (timeRange === 'month') {
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } else {
          return `${date.getFullYear()}/${date.getMonth() + 1}`;
        }
      }),
      datasets: [
        {
          label: '体重',
          data: filteredData.map(record => record.weight),
          borderColor: 'rgb(156, 39, 176)',
          backgroundColor: 'rgba(156, 39, 176, 0.5)',
          tension: 0.4,
        },
      ],
    };
  };
  
  // 曜日別データの生成
  const getWeekdayDistributionData = () => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekdayCounts = Array(7).fill(0);
    const weekdayWeights = Array(7).fill(0);
    
    weightRecords.forEach(record => {
      const date = new Date(record.date);
      const dayIndex = date.getDay();
      weekdayCounts[dayIndex]++;
      weekdayWeights[dayIndex] += record.weight;
    });
    
    const averageWeights = weekdayCounts.map((count, index) => 
      count === 0 ? 0 : weekdayWeights[index] / count
    );
    
    return {
      labels: weekdays,
      datasets: [
        {
          label: '平均体重',
          data: averageWeights,
          backgroundColor: 'rgba(156, 39, 176, 0.7)',
          borderColor: 'rgba(156, 39, 176, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // グラフオプション
  const lineChartOptions = {
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
  
  const barChartOptions = {
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
      duration: 1500,
    },
  };

  // 統計カードデータ
  const statCards = [
    {
      title: '平均体重',
      value: stats.averageWeight.toFixed(1),
      unit: 'kg',
      icon: <FiBarChart2 className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
    },
    {
      title: '最低体重',
      value: stats.minWeight.toFixed(1),
      unit: 'kg',
      icon: <FiTrendingDown className="w-6 h-6 text-green-600" />,
      color: 'text-green-600',
    },
    {
      title: '最高体重',
      value: stats.maxWeight.toFixed(1),
      unit: 'kg',
      icon: <FiTrendingUp className="w-6 h-6 text-red-600" />,
      color: 'text-red-600',
    },
    {
      title: '減量',
      value: stats.weightLoss > 0 ? stats.weightLoss.toFixed(1) : '0.0',
      unit: 'kg',
      icon: <FiActivity className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
    },
    {
      title: '記録日数',
      value: stats.daysLogged,
      unit: '日',
      icon: <FiCalendar className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
    },
    {
      title: '連続記録',
      value: stats.streakDays,
      unit: '日',
      icon: <FiCalendar className="w-6 h-6 text-orange-600" />,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen lavender-gradient-bg pt-20">
      <WaveAnimation />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">統計</h1>
        
        {/* 時間範囲選択 */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                timeRange === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-50/50 backdrop-blur-sm text-gray-700 hover:bg-blue-50/80'
              }`}
            >
              週間
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-50/50 backdrop-blur-sm text-gray-700 hover:bg-blue-50/80'
              }`}
            >
              月間
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                timeRange === 'year'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-50/50 backdrop-blur-sm text-gray-700 hover:bg-blue-50/80'
              }`}
            >
              年間
            </button>
          </div>
        </div>
        
        {/* 統計カード */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {statCards.map((card, index) => (
            <div
              key={index}
              className="backdrop-blur-lg bg-blue-50/50 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center mb-2">
                {card.icon}
                <h3 className="ml-2 text-sm font-medium text-gray-600">{card.title}</h3>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.value} <span className="text-sm">{card.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>
        
        {/* グラフ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">体重推移</h2>
            <div className="h-[300px]">
              <ChartSetup />
              {!loading && weightRecords.length > 0 && (
                <DynamicLineChart data={getChartData()} options={lineChartOptions} />
              )}
              {loading && <div className="flex justify-center items-center h-full">読み込み中...</div>}
              {!loading && weightRecords.length === 0 && (
                <div className="flex justify-center items-center h-full text-gray-500">
                  データがありません
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            variants={item}
            className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">曜日別平均体重</h2>
            <div className="h-[300px]">
              <ChartSetup />
              {!loading && weightRecords.length > 0 && (
                <DynamicBarChart data={getWeekdayDistributionData()} options={barChartOptions} />
              )}
              {loading && <div className="flex justify-center items-center h-full">読み込み中...</div>}
              {!loading && weightRecords.length === 0 && (
                <div className="flex justify-center items-center h-full text-gray-500">
                  データがありません
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* データがない場合のメッセージ */}
        {!loading && weightRecords.length === 0 && (
          <motion.div
            variants={item}
            className="mt-8 p-6 bg-blue-50/50 backdrop-blur-lg rounded-xl text-center"
          >
            <p className="text-lg text-gray-600">
              まだ体重記録がありません。「記録」ページから体重を記録してください。
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
