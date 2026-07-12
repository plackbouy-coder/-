import React from 'react';
import { Bot, Users, Plus, Search } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const HomePage = () => {
    const { setCurrentView, setGameState } = useGame();
    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <button onClick={() => { setGameState({ id: 'ai-game', players: [], status: 'lobby', currentNight: 0 }); setCurrentView('game'); }} className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex flex-col items-center gap-2 hover:border-indigo-500 transition-all">
                    <Bot className="w-8 h-8 text-indigo-400" />
                    <span className="text-sm font-bold">لعب ضد AI</span>
                </button>
                <button onClick={() => setCurrentView('lobby')} className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex flex-col items-center gap-2 hover:border-red-500 transition-all">
                    <Users className="w-8 h-8 text-red-400" />
                    <span className="text-sm font-bold">لعب عشوائي</span>
                </button>
                <button onClick={() => setCurrentView('lobby')} className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex flex-col items-center gap-2 hover:border-green-500 transition-all">
                    <Plus className="w-8 h-8 text-green-400" />
                    <span className="text-sm font-bold">إنشاء غرفة</span>
                </button>
                <button onClick={() => setCurrentView('lobby')} className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex flex-col items-center gap-2 hover:border-blue-500 transition-all">
                    <Search className="w-8 h-8 text-blue-400" />
                    <span className="text-sm font-bold">انضمام لغرفة</span>
                </button>
            </div>
        </div>
    );
};
