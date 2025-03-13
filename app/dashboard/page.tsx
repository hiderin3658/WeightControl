'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import WaveAnimation from '../components/WaveAnimation';

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

// サンプルデータ（後でVercel KVからのデータに置き換え）
const sampleData = {
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '体重',
      data: [70, 69, 68.5, 68.2, 67.8, 67.5],
      borderColor: 'rgb(156, 39, 176)',
      backgroundColor: 'rgba(156, 39, 176, 0.5)',
      tension: 0.4,
    },
  ],
};

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

  return (
    <div className="min-h-screen lavender-gradient-bg pt-20">
      <WaveAnimation />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* 現在の状態カード */}
        <motion.div
          variants={item}
          className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg mb-8 hover:scale-[1.02] transition-transform duration-300"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">現在の状態</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600">現在の体重</p>
              <p className="text-4xl font-bold text-purple-600">67.5 kg</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">目標体重</p>
              <p className="text-4xl font-bold text-purple-700">65.0 kg</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">残り</p>
              <p className="text-4xl font-bold text-purple-500">2.5 kg</p>
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
            <DynamicChart data={sampleData} options={chartOptions} />
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
                <p className="text-2xl font-bold text-purple-600">68.5 kg</p>
              </div>
              <div>
                <p className="text-gray-600">最低体重</p>
                <p className="text-2xl font-bold text-purple-600">67.5 kg</p>
              </div>
              <div>
                <p className="text-gray-600">最高体重</p>
                <p className="text-2xl font-bold text-purple-600">70.0 kg</p>
              </div>
              <div>
                <p className="text-gray-600">減量</p>
                <p className="text-2xl font-bold text-purple-600">2.5 kg</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-lg bg-blue-50/50 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">目標達成予測</h2>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 mb-2">目標達成まで</p>
              <p className="text-4xl font-bold text-purple-600">21日</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
