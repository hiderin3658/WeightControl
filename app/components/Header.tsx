'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaWeight, FaChartLine, FaBullseye, FaCog, FaChartBar, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ハイドレーション対策
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: FaChartLine },
    { href: '/record', label: '記録', icon: FaWeight },
    { href: '/goals', label: '目標', icon: FaBullseye },
    { href: '/stats', label: '統計', icon: FaChartBar },
    { href: '/settings', label: '設定', icon: FaCog },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!isMounted) {
    return null; // ハイドレーション前は何も表示しない
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="backdrop-blur-md bg-white/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Weight Control
              </Link>
            </div>

            {/* モバイルメニューボタン */}
            <div className="md:hidden flex items-center">
              {session?.user && (
                <div className="mr-2 relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {session.user.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'ユーザー'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-blue-500 text-xl" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <FaSignOutAlt className="mr-2" />
                            サインアウト
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">メニューを開く</span>
                {mobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <FaBars className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center">
              <div className="ml-10 flex items-center space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105
                        ${isActive 
                          ? 'text-blue-600 bg-blue-50/50' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                        }`}
                    >
                      <Icon className="mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* ユーザー情報とドロップダウン */}
              {session?.user && (
                <div className="ml-6 relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {session.user.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'ユーザー'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-blue-500 text-xl" />
                      )}
                    </div>
                    <span className="font-medium">{session.user.name || 'ユーザー'}</span>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <FaSignOutAlt className="mr-2" />
                            サインアウト
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-md shadow-lg overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-3 py-3 rounded-md text-base font-medium w-full
                        ${isActive 
                          ? 'text-blue-600 bg-blue-50/50' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                        }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
