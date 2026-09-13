export type ActivityId = 
  | 'bubbles'
  | 'water'
  | 'magic-touch'
  | 'draw'
  | 'fireflies'
  | 'floating'
  | 'sounds'
  | 'favorites';

export type AnimationSpeed = 'slow' | 'medium' | 'fast';

export type Theme = 'soft' | 'twilight' | 'dark';

export interface ActivityMeta {
  id: ActivityId;
  name: string;
  emoji: string;
  label: string;
  bgGradient: string;
  cardColor: string;
  accentColor: string;
}

export interface Settings {
  animationSpeed: AnimationSpeed;
  soundVolume: number; // 0 to 1
  soundsEnabled: boolean;
  vibrationEnabled: boolean;
  reduceMotion: boolean;
  theme: Theme;
  favoriteActivities: ActivityId[];
  enabledActivities: Record<ActivityId, boolean>;
  timerMinutes: number; // 0 = off, 10, 15, 20, 30
}

export const ACTIVITIES: ActivityMeta[] = [
  {
    id: 'bubbles',
    name: 'Bubbles',
    emoji: '🫧',
    label: 'Bubbles',
    bgGradient: 'from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-indigo-950',
    cardColor: 'bg-blue-50/80 hover:bg-blue-100/90 border-blue-200',
    accentColor: '#60A5FA',
  },
  {
    id: 'water',
    name: 'Water',
    emoji: '🌊',
    label: 'Water',
    bgGradient: 'from-cyan-100 to-teal-100 dark:from-slate-800 dark:to-cyan-950',
    cardColor: 'bg-teal-50/80 hover:bg-teal-100/90 border-teal-200',
    accentColor: '#2DD4BF',
  },
  {
    id: 'magic-touch',
    name: 'Magic Touch',
    emoji: '✨',
    label: 'Magic Touch',
    bgGradient: 'from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-950',
    cardColor: 'bg-purple-50/80 hover:bg-purple-100/90 border-purple-200',
    accentColor: '#C084FC',
  },
  {
    id: 'draw',
    name: 'Draw',
    emoji: '🎨',
    label: 'Draw',
    bgGradient: 'from-amber-100 to-orange-100 dark:from-slate-800 dark:to-amber-950',
    cardColor: 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200',
    accentColor: '#FBBF24',
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    emoji: '🪲',
    label: 'Fireflies',
    bgGradient: 'from-emerald-100 to-teal-100 dark:from-slate-900 dark:to-emerald-950',
    cardColor: 'bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200',
    accentColor: '#34D399',
  },
  {
    id: 'floating',
    name: 'Floating',
    emoji: '🪶',
    label: 'Floating',
    bgGradient: 'from-rose-100 to-pink-100 dark:from-slate-800 dark:to-rose-950',
    cardColor: 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-200',
    accentColor: '#FB7185',
  },
  {
    id: 'sounds',
    name: 'Sounds',
    emoji: '🎵',
    label: 'Sounds',
    bgGradient: 'from-sky-100 to-violet-100 dark:from-slate-800 dark:to-sky-950',
    cardColor: 'bg-sky-50/80 hover:bg-sky-100/90 border-sky-200',
    accentColor: '#38BDF8',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    emoji: '❤️',
    label: 'Favorites',
    bgGradient: 'from-pink-100 to-red-100 dark:from-slate-800 dark:to-pink-950',
    cardColor: 'bg-pink-50/80 hover:bg-pink-100/90 border-pink-200',
    accentColor: '#F43F5E',
  },
];
