import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Plus, Play, ArrowRight } from 'lucide-react';

export const GameLobby = () => {
    const { setCurrentView, setGameState } = useGame();
    const [rooms] = useState([{ id: 'r1', name: 'لعبة عادية', players: 1 }, { id: 'r2', name: 'لعبة احترافية', players: 2 }]);

    const createGame = () => {
        // Unlock audio context
        const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"); // Short silent MP3
        silentAudio.volume = 0.01;
        silentAudio.play().catch(() => {});

        setGameState({ id: 'new', players: [], status: 'lobby', currentNight: 0 });
        setCurrentView('game');
    };

    return (
        <div className="w-full h-full p-6 text-gray-900 overflow-y-auto" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">ساحة الانتظار</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-lg">
                <button onClick={createGame} className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
                    <Plus className="w-5 h-5" /> إنشاء غرفة جديدة
                </button>
                {rooms.map(room => (
                    <div key={room.id} className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                        <span className="font-bold">{room.name}</span>
                        <div className='flex items-center gap-4'>
                            <span className="text-sm flex items-center gap-1"><Users className="w-4 h-4"/> {room.players}/10</span>
                            <button onClick={() => { const a = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"); a.volume = 0.01; a.play().catch(()=>{}); setCurrentView('game'); }} className="bg-indigo-100 text-indigo-700 p-2 rounded-lg"><Play className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
