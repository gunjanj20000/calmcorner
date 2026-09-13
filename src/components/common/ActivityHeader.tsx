import React from 'react';
import { Home, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ActivityHeaderProps {
  title: string;
  emoji: string;
  onHome?: () => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({ title, emoji, onHome }) => {
  const { setCurrentScreen, settings, updateSettings, triggerHaptic } = useApp();

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

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pointer-events-none select-none"
      style={{ paddingTop: 'calc(var(--sat, 0px) + 12px)', paddingLeft: 'calc(var(--sal, 0px) + 16px)', paddingRight: 'calc(var(--sar, 0px) + 16px)' }}>
      {/* Big prominent Home Button */}
      <button
        onClick={handleHome}
        aria-label="Go Home"
        className="pointer-events-auto touch-btn flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/85 dark:bg-slate-800/85 backdrop-blur-md shadow-lg border border-white/40 dark:border-slate-700 text-calm-text dark:text-calm-darkText hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
      >
        <Home className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
        <span className="text-xl font-bold tracking-wide">Home</span>
      </button>

      {/* Gentle center badge */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-sm">
        <span className="text-2xl">{emoji}</span>
        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>

      {/* Quick Sound Mute Button */}
      <button
        onClick={toggleSound}
        aria-label={settings.soundsEnabled ? "Mute sounds" : "Unmute sounds"}
        className="pointer-events-auto touch-btn flex items-center justify-center w-14 h-14 rounded-full bg-white/85 dark:bg-slate-800/85 backdrop-blur-md shadow-lg border border-white/40 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
      >
        {settings.soundsEnabled ? (
          <Volume2 className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        ) : (
          <VolumeX className="w-7 h-7 text-rose-500 dark:text-rose-400" />
        )}
      </button>
    </header>
  );
};
