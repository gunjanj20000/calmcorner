import { Settings } from '../types';

const STORAGE_KEY = 'calm_corner_settings_v1';

const defaultSettings: Settings = {
  animationSpeed: 'slow',
  soundVolume: 0.5,
  soundsEnabled: true,
  backgroundSound: 'tones',
  vibrationEnabled: true,
  reduceMotion: false,
  theme: 'soft',
  favoriteActivities: ['bubbles', 'water', 'magic-touch'],
  enabledActivities: {
    'bubbles': true,
    'water': true,
    'magic-touch': true,
    'draw': true,
    'fireflies': true,
    'floating': true,
    'sounds': true,
    'favorites': true,
  },
  timerMinutes: 0,
};

export const loadSettings = (): Settings => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultSettings;
    const parsed = JSON.parse(data);
    return {
      ...defaultSettings,
      ...parsed,
      enabledActivities: {
        ...defaultSettings.enabledActivities,
        ...(parsed.enabledActivities || {})
      },
    };
  } catch (e) {
    console.warn('Failed to load settings from localStorage, using defaults:', e);
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
};

export const resetSettings = (): Settings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to remove settings from localStorage:', e);
  }
  return defaultSettings;
};
