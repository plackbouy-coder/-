/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { SoundsPage } from './components/SoundsPage';
import { ShopPage } from './components/ShopPage';
import { GameLobby } from './components/GameLobby';
import { LeaderboardPage } from './components/LeaderboardPage';
import { GameRoom } from './components/GameRoom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Bot, Users, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { gameState, user, currentView } = useGame();

  const handleLogin = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
            <button onClick={handleLogin} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">تسجيل الدخول باستخدام Google</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full h-full"
        >
          {currentView === 'home' && <HomePage />}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'shop' && <ShopPage />}
          {currentView === 'leaderboard' && <LeaderboardPage />}
          {currentView === 'settings' && <SettingsPage />}
          {currentView === 'sounds' && <SoundsPage />}
          {currentView === 'lobby' && <GameLobby />}
          {currentView === 'game' && <GameRoom />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
