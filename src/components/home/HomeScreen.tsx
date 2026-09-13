import React from 'react';
import { useApp } from '../../context/AppContext';
import { ACTIVITIES, ActivityId, BackgroundSoundType } from '../../types';
import { Settings, Volume2, VolumeX, Maximize2, Sparkles, Clock, Music } from 'lucide-react';
import { InstallPromptBanner } from '../common/InstallPromptBanner';
import { ActivityIcon } from '../common/ActivityIcon';

export const HomeScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    setIsParentSettingsOpen, 
    settings, 
    updateSettings, 
    triggerHaptic, 
    playChime,
    sessionTimeRemaining,
    backgroundSound,
    setBackgroundSound,
    customTrack
  } = useApp();

  const handleSelectActivity = (id: ActivityId) => {
    triggerHaptic(20);
    playChime();
    setCurrentScreen(id);
  };

  const toggleFullscreen = () => {
    triggerHaptic(15);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Only show activities that are enabled by parents in settings
  const visibleActivities = ACTIVITIES.filter(
    (act) => settings.enabledActivities[act.id] ?? true
  );

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
    <div className="relative w-full h-full min-h-screen flex flex-col bg-calm-bg dark:bg-calm-darkBg overflow-y-auto select-none transition-colors duration-300">
      
      {/* Top Bar with Safe Area Inset */}
      <header 
        className="w-full flex items-center justify-between px-6 py-4 z-20"
        style={{
          paddingTop: 'calc(var(--sat, 0px) + 12px)',
          paddingLeft: 'calc(var(--sal, 0px) + 20px)',
          paddingRight: 'calc(var(--sar, 0px) + 20px)',
        }}
      >
        {/* App Title & Gentle Motif */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-300 to-teal-300 dark:from-sky-700 dark:to-indigo-800 flex items-center justify-center shadow-md p-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
              <path d="M12 3C10.5 7.5 8 11.5 8 15C8 17.5 9.8 19.5 12 19.5C14.2 19.5 16 17.5 16 15C16 11.5 13.5 7.5 12 3Z" fill="white" />
              <path d="M10 10C6.5 12 4 14.5 4 17C4 19.2 5.8 20.5 8 20.5C9.5 20.5 11 18.5 10.5 16.5C10.2 14.5 10 10 10 10Z" fill="white" fillOpacity="0.8" />
              <path d="M14 10C17.5 12 20 14.5 20 17C20 19.2 18.2 20.5 16 20.5C14.5 20.5 13 18.5 13.5 16.5C13.8 14.5 14 10 14 10Z" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Calm Corner
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/40" />
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
              A peaceful sensory sanctuary
            </p>
          </div>
        </div>

        {/* Top Right Controls: Timer Badge, Mute, Fullscreen, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active Session Timer Badge */}
          {settings.timerMinutes > 0 && sessionTimeRemaining > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 text-xs font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(sessionTimeRemaining)}</span>
            </div>
          )}

          {/* Background Sound Pill */}
          <button
            onClick={cycleBackgroundSound}
            aria-label={`Background Sound: ${getSoundLabel(backgroundSound)}. Tap to change`}
            className={`touch-btn flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-md transition-all active:scale-95 ${
              backgroundSound !== 'none' && settings.soundsEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-300/40'
                : 'bg-white/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="text-xl">{getSoundEmoji(backgroundSound)}</span>
            <span className="text-xs sm:text-sm font-extrabold hidden sm:inline max-w-[120px] truncate">
              {getSoundLabel(backgroundSound)}
            </span>
            <Music className={`w-3.5 h-3.5 ${backgroundSound !== 'none' && settings.soundsEnabled ? 'animate-bounce text-indigo-500' : 'text-slate-400'}`} />
          </button>

          {/* Quick Sound Mute */}
          <button
            onClick={() => {
              triggerHaptic(15);
              updateSettings({ soundsEnabled: !settings.soundsEnabled });
            }}
            aria-label={settings.soundsEnabled ? "Mute sounds" : "Unmute sounds"}
            className="touch-btn w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            {settings.soundsEnabled ? (
              <Volume2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            ) : (
              <VolumeX className="w-6 h-6 text-rose-500 dark:text-rose-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="touch-btn w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200/80 dark:border-slate-700 hidden sm:flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <Maximize2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </button>

          {/* Parent Settings Button */}
          <button
            onClick={() => {
              triggerHaptic(20);
              setIsParentSettingsOpen(true);
            }}
            aria-label="Parent Settings"
            className="touch-btn w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <Settings className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>

        </div>
      </header>

      {/* Optional Install Prompt for iPad/iPhone and Android */}
      <InstallPromptBanner />

      {/* Main Activity Grid */}
      <main 
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-center"
        style={{
          paddingBottom: 'calc(var(--sab, 0px) + 24px)',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleActivities.map((act) => (
            <button
              key={act.id}
              onClick={() => handleSelectActivity(act.id)}
              className={`touch-btn relative p-5 sm:p-7 rounded-3xl border-2 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-xl active:scale-95 ${act.cardColor} group`}
              aria-label={`Start activity ${act.name}`}
            >
              {/* Prominent Large Activity Illustration & Emoji */}
              <div className="mb-3 transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                <ActivityIcon id={act.id} size={76} />
              </div>

              {/* Activity Label */}
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                {act.name}
              </span>

              {/* Subtle gentle highlight dot */}
              <div 
                className="w-2.5 h-2.5 rounded-full mt-2.5 opacity-60 group-hover:opacity-100 transition-opacity" 
                style={{ backgroundColor: act.accentColor }} 
              />
            </button>
          ))}
        </div>
      </main>

    </div>
  );
};
