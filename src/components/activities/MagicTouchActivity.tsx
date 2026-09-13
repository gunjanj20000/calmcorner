import React, { useRef, useEffect, useState } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';

type EffectMode = 'stars' | 'circles' | 'trails' | 'petals' | 'sparkles';

interface MagicParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  type: EffectMode;
  decay: number;
}

export const MagicTouchActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playChime, speedMultiplier, triggerHaptic, settings } = useApp();

  const [activeEffect, setActiveEffect] = useState<EffectMode>('stars');
  const particlesRef = useRef<MagicParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const chimeIndexRef = useRef<number>(0);
  const lastChimeTimeRef = useRef<number>(0);

  const effectOptions: { mode: EffectMode; emoji: string; label: string }[] = [
    { mode: 'stars', emoji: '✨', label: 'Stars' },
    { mode: 'circles', emoji: '🫧', label: 'Circles' },
    { mode: 'trails', emoji: '🌈', label: 'Trails' },
    { mode: 'petals', emoji: '🌸', label: 'Petals' },
    { mode: 'sparkles', emoji: '🌟', label: 'Sparkles' },
  ];

  // Palette of soft dreamy pastels
  const colors = [
    'hsl(280, 85%, 75%)', // Lavender
    'hsl(200, 90%, 75%)', // Sky blue
    'hsl(330, 85%, 78%)', // Rose
    'hsl(165, 80%, 75%)', // Mint
    'hsl(45, 95%, 75%)',  // Warm gold
    'hsl(25, 95%, 78%)',  // Peach
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const loop = () => {
      // Clear with soft persistence (slight trail fade)
      ctx.fillStyle = settings.theme === 'dark' 
        ? 'rgba(15, 23, 42, 0.25)' 
        : settings.theme === 'twilight' 
          ? 'rgba(226, 232, 240, 0.25)' 
          : 'rgba(248, 250, 252, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Render and update all active particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        p.rotation += p.rotationSpeed * speedMultiplier;
        p.alpha -= p.decay * speedMultiplier;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        switch (p.type) {
          case 'stars': {
            // Draw 4-pointed or 5-pointed glowing star
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const spikes = 4;
            const outerR = p.size;
            const innerR = p.size * 0.35;
            for (let s = 0; s < spikes * 2; s++) {
              const r = s % 2 === 0 ? outerR : innerR;
              const angle = (Math.PI / spikes) * s;
              const sx = Math.cos(angle) * r;
              const sy = Math.sin(angle) * r;
              if (s === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();
            break;
          }
          case 'circles': {
            // Soft expanding concentric circle ring
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * (1.5 - p.alpha * 0.5), 0, Math.PI * 2);
            ctx.stroke();

            // Inner soft dot
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'trails': {
            // Glowing smooth light orb
            const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            radGrad.addColorStop(0, '#FFFFFF');
            radGrad.addColorStop(0.3, p.color);
            radGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'petals': {
            // Soft floating blossom petal
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'sparkles': {
            // Tiny cross sparkle
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.moveTo(0, -p.size);
            ctx.lineTo(0, p.size);
            ctx.stroke();

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [speedMultiplier, settings.theme]);

  // Spawn particles at coordinates
  const spawnParticlesAt = (x: number, y: number, count = 4) => {
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 2.5);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (activeEffect === 'petals' ? -0.5 : 0),
        size: activeEffect === 'trails' ? 18 + Math.random() * 12 : 12 + Math.random() * 14,
        alpha: 1.0,
        maxAlpha: 1.0,
        color: selectedColor,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        type: activeEffect,
        decay: activeEffect === 'trails' ? 0.04 : 0.018,
      });
    }

    // Limit maximum particles for fluid 60fps
    if (particlesRef.current.length > 250) {
      particlesRef.current.splice(0, 30);
    }

    // Play soothing pentatonic chime
    const now = Date.now();
    if (now - lastChimeTimeRef.current > 140) {
      playChime(chimeIndexRef.current);
      chimeIndexRef.current = (chimeIndexRef.current + 1) % 8;
      lastChimeTimeRef.current = now;
    }
  };

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    spawnParticlesAt(e.clientX, e.clientY, 5);
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      spawnParticlesAt(t.clientX, t.clientY, 3);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-50 dark:bg-slate-950">
      <ActivityHeader title="Magic Touch" emoji="✨" />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointer}
        onPointerMove={(e) => {
          if (e.buttons > 0) handlePointer(e);
        }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        className="activity-canvas absolute inset-0 w-full h-full cursor-pointer"
      />

      {/* Bottom Large Effect Switcher Bar */}
      <div 
        className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-3 px-4 pointer-events-none"
        style={{ paddingBottom: 'calc(var(--sab, 0px) + 8px)' }}
      >
        <div className="pointer-events-auto flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-xl border border-white/40 dark:border-slate-700">
          {effectOptions.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => {
                triggerHaptic(15);
                setActiveEffect(opt.mode);
              }}
              className={`touch-btn px-4 py-3 rounded-full flex items-center gap-2 text-base font-bold transition-all ${
                activeEffect === opt.mode
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
