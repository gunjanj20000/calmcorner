import React, { useState, useEffect } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';
import { audioService, AmbientSoundType } from '../../services/audioService';
import { Play, Pause, Volume2, VolumeX, Square } from 'lucide-react';

interface SoundOption {
  type: AmbientSoundType;
  emoji: string;
  name: string;
  description: string;
  color: string;
  borderActive: string;
  bgActive: string;
}

export const SoundsActivity: React.FC = () => {
  const { settings, updateSettings, triggerHaptic } = useApp();
  const [activeSounds, setActiveSounds] = useState<AmbientSoundType[]>(() => audioService.getPlayingAmbients());

  const soundOptions: SoundOption[] = [
    {
      type: 'rain',
      emoji: '🌧️',
      name: 'Gentle Rain',
      description: 'Soft rhythmic raindrops',
      color: 'text-sky-600 dark:text-sky-400',
      borderActive: 'border-sky-500 ring-4 ring-sky-200 dark:ring-sky-900/60',
      bgActive: 'bg-sky-50 dark:bg-sky-950/60',
    },
    {
      type: 'ocean',
      emoji: '🌊',
      name: 'Ocean Waves',
      description: 'Slow soothing rolling surf',
      color: 'text-teal-600 dark:text-teal-400',
      borderActive: 'border-teal-500 ring-4 ring-teal-200 dark:ring-teal-900/60',
      bgActive: 'bg-teal-50 dark:bg-teal-950/60',
    },
    {
      type: 'birds',
      emoji: '🐦',
      name: 'Peaceful Birds',
      description: 'Morning woodland chirps',
      color: 'text-amber-600 dark:text-amber-400',
      borderActive: 'border-amber-500 ring-4 ring-amber-200 dark:ring-amber-900/60',
      bgActive: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      type: 'forest',
      emoji: '🌲',
      name: 'Pine Forest',
      description: 'Whispering pine breeze',
      color: 'text-emerald-600 dark:text-emerald-400',
      borderActive: 'border-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-900/60',
      bgActive: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      type: 'tones',
      emoji: '🎵',
      name: 'Soft Tones',
      description: '432Hz calming ambient pad',
      color: 'text-indigo-600 dark:text-indigo-400',
      borderActive: 'border-indigo-500 ring-4 ring-indigo-200 dark:ring-indigo-900/60',
      bgActive: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      type: 'bells',
      emoji: '🔔',
      name: 'Gentle Bells',
      description: 'Singing bowls & wind chimes',
      color: 'text-purple-600 dark:text-purple-400',
      borderActive: 'border-purple-500 ring-4 ring-purple-200 dark:ring-purple-900/60',
      bgActive: 'bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  // Keep state in sync with audioService
  useEffect(() => {
    setActiveSounds(audioService.getPlayingAmbients());
  }, []);

  const handleToggleSound = (type: AmbientSoundType) => {
    triggerHaptic(20);
    // Unmute if muted
    if (!settings.soundsEnabled) {
      updateSettings({ soundsEnabled: true });
    }
    audioService.toggleAmbient(type);
    setActiveSounds(audioService.getPlayingAmbients());
  };

  const handleStopAll = () => {
    triggerHaptic(25);
    audioService.stopAllAmbients();
    setActiveSounds([]);
  };

  const anyPlaying = activeSounds.length > 0;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <ActivityHeader title="Calming Sounds" emoji="🎵" />

      {/* Main Container with safe area padding */}
      <main 
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-between"
        style={{
          paddingTop: 'calc(var(--sat, 0px) + 80px)',
          paddingBottom: 'calc(var(--sab, 0px) + 30px)',
        }}
      >
        {/* Breathing Rhythm Circle & Visualizer */}
        <div className="flex flex-col items-center my-4 select-none">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Breathing Ring */}
            <div 
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-1000 ${
                anyPlaying 
                  ? 'bg-gradient-to-tr from-sky-400/20 via-indigo-400/20 to-teal-400/20 animate-pulse-slow' 
                  : 'bg-slate-200/50 dark:bg-slate-800/50'
              }`}
            >
              <div 
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-inner transition-transform duration-700 ${
                  anyPlaying ? 'scale-105 bg-white dark:bg-slate-800' : 'bg-white/80 dark:bg-slate-800/80'
                }`}
              >
                <span className="text-4xl sm:text-5xl mb-1">
                  {activeSounds.length > 0 ? soundOptions.find(s => s.type === activeSounds[0])?.emoji || '🎵' : '🕊️'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {anyPlaying ? 'Playing' : 'Tap a sound'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Sound Option Grid with Large Touch Targets */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 my-2">
          {soundOptions.map((opt) => {
            const isPlaying = activeSounds.includes(opt.type);

            return (
              <button
                key={opt.type}
                onClick={() => handleToggleSound(opt.type)}
                className={`touch-btn p-5 sm:p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all active:scale-95 select-none ${
                  isPlaying
                    ? `${opt.borderActive} ${opt.bgActive} shadow-lg scale-102`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                }`}
                aria-label={`Toggle sound ${opt.name}`}
              >
                <div className="text-4xl sm:text-5xl mb-2.5 transform transition-transform">
                  {opt.emoji}
                </div>
                <div className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-slate-100">
                  {opt.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                  {opt.description}
                </div>

                {/* Status indicator */}
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-900/60 shadow-xs">
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="text-teal-700 dark:text-teal-300">Playing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400">Play</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Master Audio Controls Bar at Bottom */}
        <div className="w-full max-w-xl mt-6 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Stop All Button */}
          <button
            onClick={handleStopAll}
            disabled={!anyPlaying}
            className={`touch-btn px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
              anyPlaying
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Stop All Sounds</span>
          </button>

          {/* Master Volume Slider */}
          <div className="flex items-center gap-3 w-full sm:w-60">
            <button
              onClick={() => updateSettings({ soundsEnabled: !settings.soundsEnabled })}
              className="touch-btn p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400"
              aria-label="Toggle Mute"
            >
              {settings.soundsEnabled ? <Volume2 className="w-6 h-6 text-teal-600" /> : <VolumeX className="w-6 h-6 text-rose-500" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundsEnabled ? settings.soundVolume : 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateSettings({ soundVolume: val, soundsEnabled: val > 0 });
              }}
              className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              aria-label="Volume slider"
            />
          </div>

        </div>

      </main>
    </div>
  );
};
