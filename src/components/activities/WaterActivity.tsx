import React, { useRef, useEffect } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';

export const WaterActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playWaterDrop, speedMultiplier, settings } = useApp();

  const lastDropSoundRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulation grid dimensions (downscaled for high-performance 60fps fluid simulation)
    const scale = 3;
    let simWidth = Math.floor(window.innerWidth / scale);
    let simHeight = Math.floor(window.innerHeight / scale);

    canvas.width = simWidth;
    canvas.height = simHeight;

    let buffer1 = new Int16Array(simWidth * simHeight);
    let buffer2 = new Int16Array(simWidth * simHeight);
    let imgData = ctx.createImageData(simWidth, simHeight);
    let pixels = imgData.data;

    const handleResize = () => {
      if (!canvas) return;
      simWidth = Math.floor(window.innerWidth / scale);
      simHeight = Math.floor(window.innerHeight / scale);
      canvas.width = simWidth;
      canvas.height = simHeight;
      buffer1 = new Int16Array(simWidth * simHeight);
      buffer2 = new Int16Array(simWidth * simHeight);
      imgData = ctx.createImageData(simWidth, simHeight);
      pixels = imgData.data;
    };

    window.addEventListener('resize', handleResize);

    // Disturb water surface at simulation coordinates
    const disturb = (x: number, y: number, radius = 4, strength = 450) => {
      const rx = Math.floor(x / scale);
      const ry = Math.floor(y / scale);

      for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
          const px = rx + i;
          const py = ry + j;
          if (px > 0 && px < simWidth - 1 && py > 0 && py < simHeight - 1) {
            const dist = Math.sqrt(i * i + j * j);
            if (dist <= radius) {
              const idx = py * simWidth + px;
              buffer1[idx] = Math.min(1000, buffer1[idx] + Math.floor(strength * (1 - dist / radius)));
            }
          }
        }
      }
    };

    // Trigger soft ambient random raindrops occasionally for peaceful liveliness
    let lastAutoDrop = Date.now();
    let animFrame: number | null = null;

    const loop = () => {
      const now = Date.now();
      if (now - lastAutoDrop > 3500 / speedMultiplier) {
        const randX = Math.random() * window.innerWidth;
        const randY = Math.random() * window.innerHeight;
        disturb(randX, randY, 3, 300);
        lastAutoDrop = now;
      }

      // 2D wave equation ripple update
      const dampingFactor = 0.975;
      let i = simWidth;
      const maxIdx = simWidth * (simHeight - 1);

      for (; i < maxIdx; i++) {
        // Skip borders
        if (i % simWidth === 0 || i % simWidth === simWidth - 1) continue;

        // Wave equation
        const wave = ((buffer1[i - 1] + buffer1[i + 1] + buffer1[i - simWidth] + buffer1[i + simWidth]) >> 1) - buffer2[i];
        buffer2[i] = wave * dampingFactor;
      }

      // Swap buffers
      const temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;

      // Render ripples to ImageData with serene oceanic / pool gradient
      const isDark = settings.theme === 'dark';
      const baseR = isDark ? 15 : 20;
      const baseG = isDark ? 35 : 120;
      const baseB = isDark ? 65 : 190;

      let pixelIdx = 0;
      for (let y = 0; y < simHeight; y++) {
        for (let x = 0; x < simWidth; x++) {
          const bufIdx = y * simWidth + x;

          // Compute shading / lighting gradient
          let xOffset = 0;
          let yOffset = 0;
          if (x > 0 && x < simWidth - 1 && y > 0 && y < simHeight - 1) {
            xOffset = buffer1[bufIdx - 1] - buffer1[bufIdx + 1];
            yOffset = buffer1[bufIdx - simWidth] - buffer1[bufIdx + simWidth];
          }

          const shading = Math.max(-60, Math.min(80, (xOffset + yOffset) >> 2));

          // Soft watercolor reflection
          pixels[pixelIdx] = Math.max(0, Math.min(255, baseR + shading * 1.2));
          pixels[pixelIdx + 1] = Math.max(0, Math.min(255, baseG + shading * 1.5));
          pixels[pixelIdx + 2] = Math.max(0, Math.min(255, baseB + shading * 1.8));
          pixels[pixelIdx + 3] = 255;

          pixelIdx += 4;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    // Attach disturbance methods to canvas DOM element for event handlers
    (canvas as unknown as { disturb: typeof disturb }).disturb = disturb;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [speedMultiplier, settings.theme]);

  // Touch handlers
  const handleTouch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const disturb = (canvas as unknown as { disturb: (x: number, y: number, r?: number, s?: number) => void }).disturb;
    if (disturb) {
      disturb(clientX, clientY, 5, 450);
    }

    const now = Date.now();
    if (now - lastDropSoundRef.current > 180) {
      playWaterDrop();
      lastDropSoundRef.current = now;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-teal-900">
      <ActivityHeader title="Water Ripples" emoji="🌊" />
      
      {/* Simulation Canvas with smooth CSS upscaling for silky water caustics */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          handleTouch(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) {
            handleTouch(e.clientX, e.clientY);
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          for (let i = 0; i < e.touches.length; i++) {
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          for (let i = 0; i < e.touches.length; i++) {
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
        }}
        className="activity-canvas absolute inset-0 w-full h-full object-cover filter contrast-125"
      />

      {/* Calming gentle water lilies floating on surface */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 animate-float-slow opacity-85 text-5xl">
          🪷
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-float-slow opacity-80 text-4xl" style={{ animationDelay: '2s' }}>
          🍃
        </div>
        <div className="absolute top-2/3 left-1/3 animate-float-slow opacity-75 text-3xl" style={{ animationDelay: '4s' }}>
          🪷
        </div>
      </div>
    </div>
  );
};
