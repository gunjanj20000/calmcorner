import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActivityId, Settings, BackgroundSoundType, CustomTrack } from '../types';
import { loadSettings, saveSettings, resetSettings as storageReset } from '../services/storageService';
import { audioService, AmbientSoundType } from '../services/audioService';
import { 
  getCustomAudioTrack, 
  getCustomAudioBlob, 
  saveCustomAudio, 
  deleteCustomAudio 
} from '../services/audioStorage';

interface AppContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllSettings: () => void;
  currentScreen: ActivityId | 'home';
  setCurrentScreen: (screen: ActivityId | 'home') => void;
  isParentSettingsOpen: boolean;
  setIsParentSettingsOpen: (open: boolean) => void;
  triggerHaptic: (pattern?: number | number[]) => void;
  speedMultiplier: number;
  sessionTimeRemaining: number;
  isSessionExpired: boolean;
  dismissSessionExpired: () => void;
  backgroundSound: BackgroundSoundType;
  setBackgroundSound: (sound: BackgroundSoundType) => void;
  toggleBackgroundSound: () => void;
  customTrack: CustomTrack | null;
  uploadCustomTrack: (file: File) => Promise<void>;
  removeCustomTrack: () => Promise<void>;
  playBubblePop: (pitchMod?: number) => void;
  playWaterDrop: (pitch?: number) => void;
  playChime: (noteIndex?: number) => void;
  playDrawingStroke: () => void;
  playFireflyGlow: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [currentScreen, setCurrentScreen] = useState<ActivityId | 'home'>('home');
  const [isParentSettingsOpen, setIsParentSettingsOpen] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [customTrack, setCustomTrack] = useState<CustomTrack | null>(null);

  // Load custom audio track on startup from IndexedDB
  useEffect(() => {
    let active = true;
    getCustomAudioTrack().then((track) => {
      if (active && track) {
        setCustomTrack(track);
        getCustomAudioBlob().then((blob) => {
          if (active && blob) {
            audioService.setCustomAudioBlob(blob);
          }
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync settings to storage and audioService
  useEffect(() => {
    saveSettings(settings);
    audioService.setVolume(settings.soundVolume);
    audioService.setMuted(!settings.soundsEnabled);

    // Sync theme class to document element
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#121820';
    } else if (settings.theme === 'twilight') {
      root.classList.remove('dark');
      root.style.backgroundColor = '#E2E8F0';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#F4F7F6';
    }
  }, [settings]);

  // Synchronize Background Sound across ALL activities / screens
  useEffect(() => {
    if (!settings.soundsEnabled || settings.backgroundSound === 'none') {
      audioService.stopAllAmbients();
    } else {
      const targetSound = settings.backgroundSound as AmbientSoundType;
      // Stop other ambients if different
      const playing = audioService.getPlayingAmbients();
      playing.forEach((t) => {
        if (t !== targetSound) {
          audioService.stopAmbient(t);
        }
      });
      // Start chosen background sound if not playing
      if (!audioService.isAmbientPlaying(targetSound)) {
        audioService.startAmbient(targetSound);
      }
    }
  }, [settings.backgroundSound, settings.soundsEnabled]);

  // Session timer logic
  useEffect(() => {
    if (settings.timerMinutes <= 0) {
      setSessionTimeRemaining(0);
      setIsSessionExpired(false);
      return;
    }

    let remainingSeconds = settings.timerMinutes * 60;
    setSessionTimeRemaining(remainingSeconds);
    setIsSessionExpired(false);

    const interval = setInterval(() => {
      remainingSeconds -= 1;
      setSessionTimeRemaining(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearInterval(interval);
        setIsSessionExpired(true);
        audioService.stopAllAmbients();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.timerMinutes]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllSettings = useCallback(() => {
    const fresh = storageReset();
    setSettings(fresh);
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[] = 15) => {
    if (!settings.vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic failures
      }
    }
  }, [settings.vibrationEnabled]);

  const speedMultiplier = settings.reduceMotion 
    ? 0.3 
    : settings.animationSpeed === 'slow' 
      ? 0.6 
      : settings.animationSpeed === 'medium' 
        ? 1.0 
        : 1.5;

  const dismissSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
    updateSettings({ timerMinutes: 0 });
  }, [updateSettings]);

  const setBackgroundSound = useCallback((sound: BackgroundSoundType) => {
    audioService.unlock();
    updateSettings({ backgroundSound: sound });
  }, [updateSettings]);

  const toggleBackgroundSound = useCallback(() => {
    audioService.unlock();
    if (settings.backgroundSound === 'none') {
      // Default to custom track if available, else tones
      const defaultTo = customTrack ? 'custom' : 'tones';
      updateSettings({ backgroundSound: defaultTo, soundsEnabled: true });
    } else {
      updateSettings({ backgroundSound: 'none' });
    }
  }, [settings.backgroundSound, customTrack, updateSettings]);

  const uploadCustomTrack = useCallback(async (file: File) => {
    triggerHaptic(20);
    const track = await saveCustomAudio(file);
    setCustomTrack(track);
    audioService.setCustomAudioBlob(file);
    audioService.unlock();
    updateSettings({ backgroundSound: 'custom', soundsEnabled: true });
  }, [triggerHaptic, updateSettings]);

  const removeCustomTrack = useCallback(async () => {
    triggerHaptic(20);
    await deleteCustomAudio();
    setCustomTrack(null);
    audioService.setCustomAudioBlob(null);
    if (settings.backgroundSound === 'custom') {
      updateSettings({ backgroundSound: 'none' });
    }
  }, [triggerHaptic, settings.backgroundSound, updateSettings]);

  // Audio helpers with unlock
  const playBubblePop = useCallback((pitchMod?: number) => {
    audioService.playBubblePop(pitchMod);
    triggerHaptic(12);
  }, [triggerHaptic]);

  const playWaterDrop = useCallback((pitch?: number) => {
    audioService.playWaterDrop(pitch);
    triggerHaptic(10);
  }, [triggerHaptic]);

  const playChime = useCallback((noteIndex?: number) => {
    audioService.playChime(noteIndex);
    triggerHaptic(15);
  }, [triggerHaptic]);

  const playDrawingStroke = useCallback(() => {
    audioService.playDrawingStroke();
  }, []);

  const playFireflyGlow = useCallback(() => {
    audioService.playFireflyGlow();
    triggerHaptic(18);
  }, [triggerHaptic]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetAllSettings,
        currentScreen,
        setCurrentScreen,
        isParentSettingsOpen,
        setIsParentSettingsOpen,
        triggerHaptic,
        speedMultiplier,
        sessionTimeRemaining,
        isSessionExpired,
        dismissSessionExpired,
        backgroundSound: settings.backgroundSound,
        setBackgroundSound,
        toggleBackgroundSound,
        customTrack,
        uploadCustomTrack,
        removeCustomTrack,
        playBubblePop,
        playWaterDrop,
        playChime,
        playDrawingStroke,
        playFireflyGlow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
