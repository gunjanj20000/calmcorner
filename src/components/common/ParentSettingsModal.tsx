import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Volume2, 
  VolumeX, 
  Zap, 
  ZapOff, 
  Eye, 
  Sun, 
  Moon, 
  Clock, 
  RotateCcw, 
  Download, 
  Check, 
  Heart,
  Sliders,
  Sparkles,
  Music,
  RefreshCw,
  Upload,
  Trash2,
  FileMusic
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACTIVITIES, AnimationSpeed, Theme, BackgroundSoundType } from '../../types';
import kjLogo from '../../assets/kj-logo.png';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    resetAllSettings, 
    triggerHaptic,
    customTrack,
    uploadCustomTrack,
    removeCustomTrack
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parent Gate state: requires 3-second hold to unlock
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const isHoldingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  // App update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const handleUpdateApp = async () => {
    triggerHaptic(20);
    setIsUpdating(true);
    setUpdateStatus('Checking for latest code changes...');

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      setUpdateStatus('Applying updates and reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.warn('Update failed:', err);
      window.location.reload();
    }
  };

  // Reset unlock state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setHoldProgress(0);
      isHoldingRef.current = false;
      if (holdTimerRef.current) {
        cancelAnimationFrame(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }
  }, [isOpen]);

  const startHolding = () => {
    if (isUnlocked || isHoldingRef.current) return;
    isHoldingRef.current = true;
    triggerHaptic(15);
    holdStartTimeRef.current = Date.now();

    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
    }

    const checkHold = () => {
      if (!isHoldingRef.current) return;
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / 2500) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        isHoldingRef.current = false;
        setIsUnlocked(true);
        setHoldProgress(100);
        triggerHaptic([30, 50, 40]);
      } else {
        holdTimerRef.current = requestAnimationFrame(checkHold);
      }
    };

    holdTimerRef.current = requestAnimationFrame(checkHold);
  };

  const stopHolding = () => {
    isHoldingRef.current = false;
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isUnlocked) {
      setHoldProgress(0);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isUnlocked) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    startHolding();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    stopHolding();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    stopHolding();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Parent Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customized sensory environment</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {isUnlocked && (
              <button
                onClick={handleUpdateApp}
                disabled={isUpdating}
                title="Update app to recent changes in code"
                className="touch-btn px-3.5 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 shadow-xs transition-all active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Updating...' : 'Update App'}</span>
              </button>
            )}

            {/* Small Brand Icon */}
            <div 
              className="w-10 h-10 rounded-full p-0.5 bg-white shadow-xs border border-slate-200/90 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0" 
              title="KJ"
            >
              <img 
                src={kjLogo} 
                alt="KJ Logo" 
                className="w-full h-full object-contain rounded-full select-none" 
              />
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="touch-btn p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isUnlocked ? (
          /* PARENT GATE */
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-6">
            <div className="p-4 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400">
              <Lock className="w-12 h-12" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Parent Protection Gate</h3>
              <p className="text-slate-600 dark:text-slate-400 text-base">
                To prevent accidental changes, press and hold the button below for <strong>3 seconds</strong> to unlock settings.
              </p>
            </div>

            {/* Hold Button with circular fill */}
            <div className="relative flex items-center justify-center my-2 select-none">
              <svg 
                viewBox="0 0 128 128" 
                width="128" 
                height="128" 
                className="w-32 h-32 transform -rotate-90 pointer-events-none select-none"
              >
                {/* Background Ring Track */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#cbd5e1"
                  strokeWidth="8"
                  fill="transparent"
                  className="stroke-slate-300 dark:stroke-slate-700"
                />
                {/* Active Vibrant Blue/Indigo Progress Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  fill="transparent"
                  className="stroke-indigo-600 dark:stroke-indigo-400"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - holdProgress / 100)}
                  strokeLinecap="round"
                  style={{
                    filter: holdProgress > 0 ? 'drop-shadow(0 0 6px rgba(79, 70, 229, 0.7))' : 'none'
                  }}
                />
              </svg>

              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startHolding();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopHolding();
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  stopHolding();
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                className="absolute w-24 h-24 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white flex flex-col items-center justify-center font-bold text-sm shadow-xl active:scale-95 transition-transform select-none cursor-pointer before:absolute before:-inset-3 before:rounded-full"
                aria-label="Hold for 3 seconds to unlock parent settings"
              >
                <Lock className={`w-7 h-7 mb-1 transition-transform ${holdProgress > 0 ? 'scale-110 text-amber-300' : 'text-white'}`} />
                <span className="font-extrabold tracking-wider">
                  {holdProgress > 0 ? `${Math.round(holdProgress)}%` : 'HOLD'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED SETTINGS PANEL */
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 1. Animation Speed */}
            <section className="space-y-3">
              <label className="block text-lg font-bold text-slate-800 dark:text-slate-200">
                Animation Speed (Slow & Calming is Recommended)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['slow', 'medium', 'fast'] as AnimationSpeed[]).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      triggerHaptic(15);
                      updateSettings({ animationSpeed: spd });
                    }}
                    className={`touch-btn py-3 px-4 rounded-2xl font-bold text-lg capitalize border-2 transition-all ${
                      settings.animationSpeed === spd
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {spd === 'slow' ? '🌱 Slow' : spd === 'medium' ? '🌿 Medium' : '⚡ Fast'}
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Sound Controls */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Sound Effects & Audio</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gentle synthesized tones without startling bursts</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    updateSettings({ soundsEnabled: !settings.soundsEnabled });
                  }}
                  className={`touch-btn px-5 py-2.5 rounded-full font-bold flex items-center gap-2 border-2 transition-all ${
                    settings.soundsEnabled
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {settings.soundsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span>{settings.soundsEnabled ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {settings.soundsEnabled && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Volume Level</span>
                    <span>{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              )}
            </section>

            {/* 2b. Custom Calming Music Upload */}
            <section className="space-y-3 p-4 sm:p-5 rounded-3xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                    <FileMusic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Custom Calming Music (Offline)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload your child's favorite calming songs or gentle voice recordings to play anywhere
                  </p>
                </div>
              </div>

              {customTrack ? (
                <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 gap-3">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {customTrack.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(customTrack.size / (1024 * 1024)).toFixed(1)} MB • Stored locally
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        triggerHaptic(15);
                        updateSettings({ backgroundSound: 'custom', soundsEnabled: true });
                      }}
                      className={`touch-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        settings.backgroundSound === 'custom'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200'
                      }`}
                    >
                      {settings.backgroundSound === 'custom' ? 'Active Playing' : 'Set as Background'}
                    </button>

                    <label className="touch-btn p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer" title="Replace file">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadCustomTrack(file);
                        }}
                      />
                    </label>

                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${customTrack.name}"?`)) {
                          removeCustomTrack();
                        }
                      }}
                      title="Delete track"
                      className="touch-btn p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="touch-btn border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30 transition-all group">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Upload Calming Audio File
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports MP3, WAV, M4A, AAC, OGG • Saved offline on device
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCustomTrack(file);
                    }}
                  />
                </label>
              )}
            </section>

            {/* 2c. Background Music & Ambience across All Activities */}
            <section className="space-y-3">
              <div>
                <label className="block text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-500" />
                  Background Soundtrack (Plays across all activities)
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Continuous soothing acoustic masking while exploring Bubbles, Water, Drawing, etc.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'custom', emoji: '🎶', name: customTrack ? `Custom: ${customTrack.name}` : 'Upload Music...' },
                  { id: 'tones', emoji: '🎵', name: 'Soft Tones' },
                  { id: 'ocean', emoji: '🌊', name: 'Ocean Waves' },
                  { id: 'rain', emoji: '🌧️', name: 'Gentle Rain' },
                  { id: 'forest', emoji: '🌲', name: 'Pine Forest' },
                  { id: 'birds', emoji: '🐦', name: 'Peaceful Birds' },
                  { id: 'bells', emoji: '🔔', name: 'Gentle Bells' },
                  { id: 'none', emoji: '🔇', name: 'No Ambience' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      triggerHaptic(15);
                      if (s.id === 'custom' && !customTrack) {
                        fileInputRef.current?.click();
                      } else {
                        updateSettings({ backgroundSound: s.id as BackgroundSoundType });
                      }
                    }}
                    className={`touch-btn p-3 rounded-2xl border-2 flex items-center gap-2.5 font-bold text-sm transition-all ${
                      settings.backgroundSound === s.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="flex-1 text-left truncate">{s.name}</span>
                    {settings.backgroundSound === s.id && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Sensory Toggles: Vibration & Reduce Motion */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vibration / Haptics */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {settings.vibrationEnabled ? <Zap className="w-5 h-5 text-amber-500" /> : <ZapOff className="w-5 h-5 text-slate-400" />}
                    Touch Vibration
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tactile haptic clicks</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
                  }}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.vibrationEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Reduce Motion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    Reduce Motion
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">For vestibular sensitivity</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    updateSettings({ reduceMotion: !settings.reduceMotion });
                  }}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.reduceMotion ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.reduceMotion ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </section>

            {/* 4. Theme Selection */}
            <section className="space-y-3">
              <label className="block text-lg font-bold text-slate-800 dark:text-slate-200">
                Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['soft', 'twilight', 'dark'] as Theme[]).map((th) => (
                  <button
                    key={th}
                    onClick={() => {
                      triggerHaptic(15);
                      updateSettings({ theme: th });
                    }}
                    className={`touch-btn py-3 px-4 rounded-2xl font-bold text-base capitalize border-2 flex items-center justify-center gap-2 transition-all ${
                      settings.theme === th
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {th === 'soft' && <Sun className="w-5 h-5 text-amber-500" />}
                    {th === 'twilight' && <Sparkles className="w-5 h-5 text-purple-500" />}
                    {th === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                    <span>{th}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 5. Select Favorite Activities */}
            <section className="space-y-3">
              <div>
                <label className="block text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Child's Favorite Activities
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pinned to the Favorites screen for instant access</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ACTIVITIES.filter(a => a.id !== 'favorites').map((act) => {
                  const isFav = settings.favoriteActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        triggerHaptic(15);
                        const newFavs = isFav
                          ? settings.favoriteActivities.filter((id) => id !== act.id)
                          : [...settings.favoriteActivities, act.id];
                        updateSettings({ favoriteActivities: newFavs });
                      }}
                      className={`touch-btn p-3 rounded-2xl border-2 flex items-center gap-2.5 font-bold text-sm transition-all ${
                        isFav
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-2xl">{act.emoji}</span>
                      <span className="flex-1 text-left truncate">{act.name}</span>
                      {isFav && <Check className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 6. Enable / Disable Individual Activities */}
            <section className="space-y-3">
              <div>
                <label className="block text-lg font-bold text-slate-800 dark:text-slate-200">
                  Visible Activities
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hide any activity that may be overstimulating</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ACTIVITIES.map((act) => {
                  const isEnabled = settings.enabledActivities[act.id] ?? true;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        triggerHaptic(15);
                        updateSettings({
                          enabledActivities: {
                            ...settings.enabledActivities,
                            [act.id]: !isEnabled,
                          },
                        });
                      }}
                      className={`touch-btn p-3 rounded-2xl border-2 flex items-center gap-2.5 font-bold text-sm transition-all ${
                        isEnabled
                          ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-800 opacity-40 bg-slate-50 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-2xl">{act.emoji}</span>
                      <span className="flex-1 text-left truncate">{act.name}</span>
                      <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 7. Optional Session Timer */}
            <section className="space-y-3">
              <div>
                <label className="block text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Gentle Session Timer
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Soft bedtime fade screen when time concludes (no jarring alarms)</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      triggerHaptic(15);
                      updateSettings({ timerMinutes: mins });
                    }}
                    className={`touch-btn py-3 px-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                      settings.timerMinutes === mins
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {mins === 0 ? 'Off' : `${mins}m`}
                  </button>
                ))}
              </div>
            </section>

            {/* 8. Install to iPad/iPhone & Android */}
            <section className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Install as Standalone Fullscreen App
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>iPhone & iPad (Safari):</strong> Tap the <em>Share button</em> (square with arrow up), scroll down and choose <strong>"Add to Home Screen"</strong>.<br />
                <strong>Android (Chrome):</strong> Tap the <em>three dots menu</em> or the install banner, and choose <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
              </p>
            </section>

            {/* 9. Update to Recent Code Changes */}
            <section className="p-4 sm:p-5 rounded-3xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-center sm:justify-start gap-2">
                  <RefreshCw className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${isUpdating ? 'animate-spin' : ''}`} />
                  Update App to Recent Code Changes
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {updateStatus || 'Fetch the latest code and clear offline cached files'}
                </p>
              </div>
              <button
                onClick={handleUpdateApp}
                disabled={isUpdating}
                className="touch-btn px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 transition-all w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Updating...' : 'Update App'}</span>
              </button>
            </section>

            {/* 10. Reset Settings */}
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerHaptic([30, 30]);
                  if (window.confirm('Reset all settings to default calm recommendations?')) {
                    resetAllSettings();
                  }
                }}
                className="touch-btn w-full py-3.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset All Settings to Defaults</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
