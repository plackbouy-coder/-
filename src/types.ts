export type Role = 'Mafia' | 'Citizen' | 'Doctor' | 'Detective' | 'Sheriff' | 'Bodyguard';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  isAlive: boolean;
  isReady: boolean;
  region: string;
}

export interface GameState {
  id: string;
  players: Player[];
  status: 'lobby' | 'night' | 'day' | 'voting' | 'finished';
  currentNight: number;
  winner?: 'Mafia' | 'Citizens';
}

export interface Snippet {
    id: string;
    title: string;
    icon: string;
    description: string;
}

export interface GameSettings {
    soundEffects: boolean;
    music: boolean;
    volume: number;
    language: string;
    notifications: boolean;
    displayName: string;
    profilePublic: boolean;
    difficulty: string;
    autoJoin: boolean;
    chatEnabled: boolean;
    filterProfanity: boolean;
    showFPS: boolean;
    graphics: string;
    animationSpeed: string;
    vSync: boolean;
    analytics: boolean;
    showTutorial: boolean;
    profileImage?: string;
    customAudio?: Record<string, string>;
}
