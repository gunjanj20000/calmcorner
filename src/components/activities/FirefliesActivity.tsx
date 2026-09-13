import React, { useRef, useEffect } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';

interface Firefly {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  glowRadius: number;
  basePulseSpeed: number;
  pulsePhase: number;
  brightness: number; // 0.3 to 1.0
  targetBrightness: number;
  hue: number;
}

export const FirefliesActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { speedMultiplier, playFireflyGlow, settings } = useApp();

  const firefliesRef = useRef<Firefly[]>([]);
  const touchPointsRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastSoundRef = useRef<number>(0);

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

    // Populate tranquil fireflies
    const count = Math.min(30, Math.max(15, Math.floor(width / 50)));
    firefliesRef.current = [];

    for (let i = 0; i < count; i++) {
      firefliesRef.current.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 3 + Math.random() * 2.5,
        glowRadius: 24 + Math.random() * 20,
        basePulseSpeed: 0.02 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        brightness: 0.4 + Math.random() * 0.4,
        targetBrightness: 0.5,
        hue: 55 + Math.random() * 25, // warm golden yellow to gentle lime glow
      });
    }

    const loop = () => {
      // Clear with soothing deep twilight/midnight background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (settings.theme === 'dark') {
        bgGrad.addColorStop(0, '#090D16');
        bgGrad.addColorStop(0.7, '#0D1B2A');
        bgGrad.addColorStop(1, '#05131E');
      } else {
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.7, '#1E293B');
        bgGrad.addColorStop(1, '#0F2634');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant stars / soft sparkles in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let s = 0; s < 40; s++) {
        const sx = ((s * 137.5) % width);
        const sy = ((s * 271.3) % (height * 0.7));
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Update and draw fireflies
      firefliesRef.current.forEach((f) => {
        // Natural wandering physics with gentle random wandering forces
        f.vx += (Math.random() - 0.5) * 0.08 * speedMultiplier;
        f.vy += (Math.random() - 0.5) * 0.08 * speedMultiplier;

        // Gentle drag / damping to prevent frantic motion
        f.vx *= 0.96;
        f.vy *= 0.96;

        // Interaction with active touch points: fireflies drift softly towards touch or flutter
        touchPointsRef.current.forEach((tp) => {
          const dx = tp.x - f.x;
          const dy = tp.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            // Soft attraction
            const force = (1 - dist / 180) * 0.25 * speedMultiplier;
            f.vx += (dx / dist) * force;
            f.vy += (dy / dist) * force;

            // Make it glow brighter!
            f.targetBrightness = 1.0;
          }
        });

        f.x += f.vx * speedMultiplier;
        f.y += f.vy * speedMultiplier;

        // Screen wrap-around with smooth margins
        if (f.x < -30) f.x = width + 30;
        if (f.x > width + 30) f.x = -30;
        if (f.y < -30) f.y = height + 30;
        if (f.y > height + 30) f.y = -30;

        // Breathing pulse animation
        f.pulsePhase += f.basePulseSpeed * speedMultiplier;
        const pulse = (Math.sin(f.pulsePhase) + 1) * 0.5; // 0 to 1

        // Smoothly interpolate brightness back to gentle ambient level
        f.brightness += (f.targetBrightness - f.brightness) * 0.04;
        f.targetBrightness = 0.4 + pulse * 0.35;

        // Draw soft bioluminescent glow aura
        const currentGlow = f.glowRadius * (0.8 + f.brightness * 0.6);
        const glowGrad = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          currentGlow
        );
        glowGrad.addColorStop(0, `hsla(${f.hue}, 95%, 70%, ${f.brightness * 0.8})`);
        glowGrad.addColorStop(0.3, `hsla(${f.hue}, 90%, 65%, ${f.brightness * 0.35})`);
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, currentGlow, 0, Math.PI * 2);
        ctx.fill();

        // Firefly core body
        ctx.fillStyle = `hsla(${f.hue + 10}, 100%, 92%, ${0.7 + f.brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (0.9 + f.brightness * 0.3), 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [speedMultiplier, settings.theme]);

  // Touch handlers
  const handleTouch = (clientX: number, clientY: number) => {
    touchPointsRef.current = [{ x: clientX, y: clientY }];

    // Check if directly touched any firefly
    firefliesRef.current.forEach((f) => {
      const dx = clientX - f.x;
      const dy = clientY - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        f.targetBrightness = 1.2;
        f.brightness = 1.0;
        // Gentle nudge
        f.vx += (Math.random() - 0.5) * 1.5;
        f.vy += (Math.random() - 0.5) * 1.5;

        const now = Date.now();
        if (now - lastSoundRef.current > 300) {
          playFireflyGlow();
          lastSoundRef.current = now;
        }
      }
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <ActivityHeader title="Fireflies" emoji="🪲" />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          handleTouch(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) handleTouch(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          touchPointsRef.current = [];
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const points = [];
          for (let i = 0; i < e.touches.length; i++) {
            points.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
          touchPointsRef.current = points;
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const points = [];
          for (let i = 0; i < e.touches.length; i++) {
            points.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
          touchPointsRef.current = points;
        }}
        onTouchEnd={() => {
          touchPointsRef.current = [];
        }}
        className="activity-canvas absolute inset-0 w-full h-full cursor-pointer"
      />

      {/* Calming grassy meadow silhouette at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-emerald-950/80 to-transparent" />
    </div>
  );
};
