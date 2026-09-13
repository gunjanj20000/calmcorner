import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActivityId, Settings } from '../types';
import { loadSettings, saveSettings, resetSettings as storageReset } from '../services/storageService';
import { audioService } from '../services/audioService';

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
  sessionTimeRemaining: number; // in seconds, 0 or negative = expired, null = no timer
  isSessionExpired: boolean;
  dismissSessionExpired: () => void;
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
