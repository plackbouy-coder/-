import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowRight } from 'lucide-react';

export const LeaderboardPage = () => {
    const { setCurrentView } = useGame();
    
    return (
        <div className="w-full h-full p-6 text-gray-900 overflow-y-auto" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">المتصدرين</h2>
            </div>
            <div className="flex items-center justify-center h-48 text-gray-500 font-bold">
                قريباً...
            </div>
        </div>
    );
};
