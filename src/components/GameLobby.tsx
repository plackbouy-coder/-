import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Plus, Play, ArrowRight, Search, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, arrayUnion, serverTimestamp, getDocs, limit } from 'firebase/firestore';

export const GameLobby = () => {
    const { setCurrentView, setGameState, user } = useGame();
    const [rooms] = useState([{ id: 'r1', name: 'لعبة عادية', players: 1 }, { id: 'r2', name: 'لعبة احترافية', players: 2 }]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('ar');
    const [lobbyId, setLobbyId] = useState<string | null>(null);
    const [playersCount, setPlayersCount] = useState(0);

    useEffect(() => {
        if (!isSearching || !lobbyId) return;

        const unsubscribe = onSnapshot(doc(db, 'lobbies', lobbyId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setPlayersCount(data.players.length);
                if (data.players.length >= 10) {
                    setGameState({ id: lobbyId, players: data.players, status: 'lobby', currentNight: 0 });
                    setCurrentView('game');
                    setIsSearching(false);
                }
            }
        });

        return () => unsubscribe();
    }, [isSearching, lobbyId, setGameState, setCurrentView]);

    const findOrCreateLobby = async () => {
        setIsSearching(true);
        if (!user) return;
        
        const q = query(collection(db, 'lobbies'), where('status', '==', 'waiting'), where('category', '==', selectedCategory), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            await updateDoc(doc.ref, { players: arrayUnion({ id: user.uid, name: user.displayName || 'لاعب' }) });
            setLobbyId(doc.id);
        } else {
            const newLobby = await addDoc(collection(db, 'lobbies'), {
                status: 'waiting',
                category: selectedCategory,
                players: [{ id: user.uid, name: user.displayName || 'لاعب' }],
                createdAt: serverTimestamp()
            });
            setLobbyId(newLobby.id);
        }
    };

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
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 max-w-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> تصنيف اللعبة</h3>
                <div className="flex gap-2 mb-4">
                    {['ar', 'fr', 'en'].map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg font-bold ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                            {cat === 'ar' ? 'عربي' : cat === 'fr' ? 'فرنسي' : 'إنجليزي'}
                        </button>
                    ))}
                </div>
                {!isSearching ? (
                    <motion.button onClick={findOrCreateLobby} className="w-full bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700">
                        <Search className="w-5 h-5" /> بحث عشوائي عن مباراة
                    </motion.button>
                ) : (
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <p className="font-bold text-indigo-700 mb-2">جاري البحث عن لاعبين...</p>
                        <p className="text-2xl font-mono font-bold text-indigo-900">{playersCount} / 10</p>
                    </div>
                )}
            </div>
        </div>
    );
};
