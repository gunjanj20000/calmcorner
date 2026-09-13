import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { audioService } from './services/audioService';

import { HomeScreen } from './components/home/HomeScreen';
import { BubblesActivity } from './components/activities/BubblesActivity';
import { WaterActivity } from './components/activities/WaterActivity';
import { MagicTouchActivity } from './components/activities/MagicTouchActivity';
import { DrawActivity } from './components/activities/DrawActivity';
import { FirefliesActivity } from './components/activities/FirefliesActivity';
import { FloatingActivity } from './components/activities/FloatingActivity';
import { SoundsActivity } from './components/activities/SoundsActivity';
import { FavoritesActivity } from './components/activities/FavoritesActivity';

import { ParentSettingsModal } from './components/common/ParentSettingsModal';
import { BedtimeModal } from './components/common/BedtimeModal';

export const App: React.FC = () => {
  const { currentScreen, isParentSettingsOpen, setIsParentSettingsOpen } = useApp();

  // Unlock Web Audio API on first touch/pointerdown anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      audioService.unlock();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Render appropriate activity view
  const renderScreen = () => {
    switch (currentScreen) {
      case 'bubbles':
        return <BubblesActivity />;
      case 'water':
        return <WaterActivity />;
      case 'magic-touch':
        return <MagicTouchActivity />;
      case 'draw':
        return <DrawActivity />;
      case 'fireflies':
        return <FirefliesActivity />;
      case 'floating':
        return <FloatingActivity />;
      case 'sounds':
        return <SoundsActivity />;
      case 'favorites':
        return <FavoritesActivity />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Active Screen */}
      {renderScreen()}

      {/* Parent Settings Modal */}
      <ParentSettingsModal
        isOpen={isParentSettingsOpen}
        onClose={() => setIsParentSettingsOpen(false)}
      />

      {/* Gentle Bedtime / Session End Modal */}
      <BedtimeModal />
    </div>
  );
};
