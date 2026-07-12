import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, Snippet, GameSettings } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { get, set } from 'idb-keyval';

const defaultSettings: GameSettings = {
    soundEffects: true, music: true, volume: 80, language: 'ar',
    notifications: true, displayName: 'لاعب', profilePublic: true, difficulty: 'medium',
    autoJoin: false, chatEnabled: true, filterProfanity: true, showFPS: false,
    graphics: 'high', animationSpeed: 'normal', vSync: true, analytics: true, showTutorial: true
};

const GameContext = createContext<{
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  user: User | null;
  currentView: 'home' | 'shop' | 'leaderboard' | 'settings' | 'profile' | 'lobby' | 'game' | 'sounds';
  setCurrentView: (view: 'home' | 'shop' | 'leaderboard' | 'settings' | 'profile' | 'lobby' | 'game' | 'sounds') => void;
  ownedSnippets: Snippet[];
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
} | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'leaderboard' | 'settings' | 'profile' | 'lobby' | 'game' | 'sounds'>('home');
  const [ownedSnippets] = useState<Snippet[]>([
    { id: 's1', title: 'Premium Pass', icon: 'Crown', description: 'Access to all features' },
    { id: 's2', title: 'Double XP', icon: 'Zap', description: 'Get 2x experience points' },
  ]);

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('gameSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    // Load custom audio from IndexedDB to avoid QuotaExceededError in localStorage
    get('customAudio').then((audio) => {
      if (audio) {
        setSettings(prev => ({ ...prev, customAudio: audio }));
      }
    }).catch(err => console.error('Failed to load custom audio from IDB:', err)).finally(() => setSettingsLoaded(true));

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Separate customAudio from other settings to save in IDB
    const { customAudio, ...settingsWithoutAudio } = settings;
    try {
      localStorage.setItem('gameSettings', JSON.stringify(settingsWithoutAudio));
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
    
    if (customAudio) {
      set('customAudio', customAudio).catch(err => console.error('Failed to save custom audio to IDB:', err));
    }
  }, [settings]);

  if (!settingsLoaded) return null;

  return (
    <GameContext.Provider value={{ gameState, setGameState, user, currentView, setCurrentView, ownedSnippets, settings, setSettings }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
