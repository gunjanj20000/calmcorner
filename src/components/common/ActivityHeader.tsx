import React from 'react';
import { Home, Volume2, VolumeX, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BackgroundSoundType } from '../../types';

interface ActivityHeaderProps {
  title: string;
  emoji: string;
  onHome?: () => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({ title, emoji, onHome }) => {
  const { 
    setCurrentScreen, 
    settings, 
    updateSettings, 
    triggerHaptic, 
    backgroundSound, 
    setBackgroundSound,
    customTrack
  } = useApp();

  const handleHome = () => {
    triggerHaptic(20);
    if (onHome) {
      onHome();
    } else {
      setCurrentScreen('home');
    }
  };

  const toggleSound = () => {
    triggerHaptic(15);
    updateSettings({ soundsEnabled: !settings.soundsEnabled });
  };

  const soundCycle: BackgroundSoundType[] = customTrack
    ? ['custom', 'tones', 'ocean', 'rain', 'forest', 'birds', 'bells', 'none']
    : ['tones', 'ocean', 'rain', 'forest', 'birds', 'bells', 'none'];

  const cycleBackgroundSound = () => {
    triggerHaptic(20);
    const currentIndex = soundCycle.indexOf(backgroundSound);
    const nextIndex = (currentIndex + 1) % soundCycle.length;
    const nextSound = soundCycle[nextIndex];
    setBackgroundSound(nextSound);
    if (nextSound !== 'none' && !settings.soundsEnabled) {
      updateSettings({ soundsEnabled: true });
    }
  };

  const getSoundEmoji = (sound: BackgroundSoundType) => {
    switch (sound) {
      case 'custom': return '🎶';
      case 'tones': return '🎵';
      case 'ocean': return '🌊';
      case 'rain': return '🌧️';
      case 'forest': return '🌲';
      case 'birds': return '🐦';
      case 'bells': return '🔔';
      default: return '🔇';
    }
  };

  const getSoundLabel = (sound: BackgroundSoundType) => {
    switch (sound) {
      case 'custom': return customTrack ? customTrack.name : 'Custom';
      case 'tones': return 'Tones';
      case 'ocean': return 'Ocean';
      case 'rain': return 'Rain';
      case 'forest': return 'Forest';
      case 'birds': return 'Birds';
      case 'bells': return 'Bells';
      default: return 'Off';
    }
  };

  return (
    <header 
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pointer-events-none select-none"
      style={{ 
        paddingTop: 'calc(var(--sat, 0px) + 12px)', 
        paddingLeft: 'calc(var(--sal, 0px) + 16px)', 
        paddingRight: 'calc(var(--sar, 0px) + 16px)' 
      }}
    >
      {/* Big prominent Home Button */}
      <button
        onClick={handleHome}
        aria-label="Go Home"
        className="pointer-events-auto touch-btn flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg border border-white/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
      >
        <Home className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
        <span className="text-xl font-bold tracking-wide">Home</span>
      </button>

      {/* Gentle center title badge */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/75 dark:bg-slate-800/75 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-sm">
        <span className="text-2xl">{emoji}</span>
        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>

      {/* Right Controls: Background Sound Switcher + Master Mute */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        
        {/* Quick Background Sound Pill */}
        <button
          onClick={cycleBackgroundSound}
          aria-label={`Background sound: ${getSoundLabel(backgroundSound)}. Tap to change`}
          className={`touch-btn flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md shadow-md border transition-all active:scale-95 ${
            backgroundSound !== 'none' && settings.soundsEnabled
              ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-300/40'
              : 'bg-white/85 dark:bg-slate-800/85 border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-xl">{getSoundEmoji(backgroundSound)}</span>
          <span className="text-sm font-extrabold hidden md:inline max-w-[120px] truncate">
            {getSoundLabel(backgroundSound)}
          </span>
          <Music className={`w-3.5 h-3.5 ${backgroundSound !== 'none' && settings.soundsEnabled ? 'animate-bounce text-indigo-500' : 'text-slate-400'}`} />
        </button>

        {/* Master Sound Mute Button */}
        <button
          onClick={toggleSound}
          aria-label={settings.soundsEnabled ? "Mute sounds" : "Unmute sounds"}
          className="touch-btn flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg border border-white/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
        >
          {settings.soundsEnabled ? (
            <Volume2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          ) : (
            <VolumeX className="w-6 h-6 text-rose-500 dark:text-rose-400" />
          )}
        </button>

      </div>
    </header>
  );
};
