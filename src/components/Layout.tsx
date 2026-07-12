import React from 'react';
import { Sword, ShoppingBag, Trophy, Settings, ShieldCheck, RefreshCw, HelpCircle, Languages, Bell, Mic } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { setCurrentView, currentView, settings } = useGame();
  
  return (
    <div className="w-full h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden select-none flex flex-col" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      {currentView !== 'game' && (
        <header className="h-14 border border-gray-200 bg-white backdrop-blur-md flex items-center px-8 shrink-0 justify-between shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-b-2xl mx-2">
          <h1 className="text-lg font-black tracking-tighter text-indigo-700">ليالي الشك</h1>
          <div className="flex gap-4 items-center">
            <Bell className="w-5 h-5 text-gray-600" />
            <button onClick={() => setCurrentView('profile')} className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
              {settings.profileImage ? <img src={settings.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-600"></div>}
            </button>
          </div>
        </header>
      )}
      <main className={`flex-grow flex items-center justify-center overflow-auto w-full h-full ${currentView !== 'game' ? 'p-4' : 'p-0'}`}>
        {children}
      </main>
      {currentView !== 'game' && (
        <footer className="h-14 border border-gray-200 bg-white backdrop-blur-md flex items-center justify-around px-4 shrink-0 text-gray-600 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] rounded-t-2xl mx-2">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 text-[10px] ${currentView === 'home' ? 'text-indigo-700' : ''}`}><Sword className="w-5 h-5" />الساحة</button>
          <button onClick={() => setCurrentView('shop')} className={`flex flex-col items-center gap-1 text-[10px] ${currentView === 'shop' ? 'text-indigo-700' : ''}`}><ShoppingBag className="w-5 h-5" />السوق</button>
          <button onClick={() => setCurrentView('leaderboard')} className={`flex flex-col items-center gap-1 text-[10px] ${currentView === 'leaderboard' ? 'text-indigo-700' : ''}`}><Trophy className="w-5 h-5" />المتصدرين</button>
          <button onClick={() => setCurrentView('sounds')} className={`flex flex-col items-center gap-1 text-[10px] ${currentView === 'sounds' ? 'text-indigo-700' : ''}`}><Mic className="w-5 h-5" />الأصوات</button>
          <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 text-[10px] ${currentView === 'settings' ? 'text-indigo-700' : ''}`}><Settings className="w-5 h-5" />الإعدادات</button>
        </footer>
      )}
    </div>
  );
};

