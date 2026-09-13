import React from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';
import { ACTIVITIES, ActivityId } from '../../types';
import { Heart, Sparkles } from 'lucide-react';
import { ActivityIcon } from '../common/ActivityIcon';

export const FavoritesActivity: React.FC = () => {
  const { settings, setCurrentScreen, triggerHaptic } = useApp();

  // Filter activities by favorites list
  const favoriteItems = ACTIVITIES.filter(
    (a) => a.id !== 'favorites' && settings.favoriteActivities.includes(a.id)
  );

  const handleOpenActivity = (id: ActivityId) => {
    triggerHaptic(20);
    setCurrentScreen(id);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-rose-50/40 dark:bg-slate-900 overflow-y-auto">
      <ActivityHeader title="Favorites" emoji="❤️" />

      <main 
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center"
        style={{
          paddingTop: 'calc(var(--sat, 0px) + 80px)',
          paddingBottom: 'calc(var(--sab, 0px) + 30px)',
        }}
      >
        <div className="text-center mb-8 select-none">
          <div className="inline-flex items-center justify-center p-3 mb-2 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
            Child's Favorites
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            The sensory activities loved most
          </p>
        </div>

        {favoriteItems.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
            {favoriteItems.map((act) => (
              <button
                key={act.id}
                onClick={() => handleOpenActivity(act.id)}
                className={`touch-btn p-8 rounded-3xl border-2 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 ${act.cardColor} select-none`}
                aria-label={`Open ${act.name}`}
              >
                <div className="mb-4 transform transition-transform hover:scale-110 flex items-center justify-center">
                  <ActivityIcon id={act.id} size={84} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                  {act.name}
                </div>
                <div className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/70 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Tap to Play</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Favorites Selected Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Parents can choose favorite activities in the Settings menu (gear icon in the top right).
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
