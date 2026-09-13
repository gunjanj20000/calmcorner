import React, { useState } from 'react';
import { Moon, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BedtimeModal: React.FC = () => {
  const { isSessionExpired, dismissSessionExpired, triggerHaptic } = useApp();
  const [holdCount, setHoldCount] = useState(0);

  if (!isSessionExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 text-slate-100 select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm text-center space-y-6">
        
        {/* Calming sleeping moon animation */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-indigo-900/40 flex items-center justify-center animate-pulse-slow">
            <Moon className="w-20 h-20 text-amber-200 fill-amber-200/40" />
          </div>
          <Sparkles className="w-8 h-8 text-indigo-300 absolute -top-2 -right-2 animate-bounce" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-1 -left-2" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-wide text-slate-100">Rest Time ☁️</h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            Time to take a peaceful breath and rest your eyes.
          </p>
        </div>

        {/* Parent unlock button: requires 3 gentle taps */}
        <div className="pt-8">
          <button
            onClick={() => {
              triggerHaptic(20);
              const next = holdCount + 1;
              setHoldCount(next);
              if (next >= 3) {
                dismissSessionExpired();
                setHoldCount(0);
              }
            }}
            className="touch-btn px-6 py-3 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>
              {holdCount === 0 ? 'Parent: Tap 3 times to continue' : `Tap ${3 - holdCount} more times`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
