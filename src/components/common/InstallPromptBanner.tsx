import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPromptBanner: React.FC = () => {
  const { triggerHaptic } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed)
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isAppStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Do not show if installed or dismissed
  if (isStandalone || isDismissed) return null;

  // Show if deferredPrompt exists (Android/Chrome/Edge) or iOS Safari
  if (!deferredPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    triggerHaptic(20);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div 
        className="w-full max-w-lg mx-auto px-4 z-20 transition-all duration-300"
        style={{ marginBottom: '8px' }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-indigo-50/90 dark:bg-slate-800/90 backdrop-blur-md border border-indigo-200/80 dark:border-slate-700 rounded-2xl shadow-md">
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center gap-3 text-left touch-btn"
          >
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Install Calm Corner App
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full-screen, works 100% offline
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              triggerHaptic(10);
              setIsDismissed(true);
            }}
            aria-label="Dismiss banner"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Sheet */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Install on iPad / iPhone
            </h3>
            <ol className="text-sm text-slate-600 dark:text-slate-300 text-left space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">1.</span>
                <span>Tap the Safari <strong>Share button</strong> at the bottom or top of the screen (square with arrow up).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">2.</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">3.</span>
                <span>Tap <strong>"Add"</strong> in the top right. Done!</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="touch-btn w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
