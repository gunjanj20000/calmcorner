import React, { useRef, useEffect } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  hue: number;
  popped: boolean;
}

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const BubblesActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { speedMultiplier, playBubblePop, settings } = useApp();

  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const nextBubbleIdRef = useRef(1);

  // Initialize and run Canvas loop
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

    // Initial bubbles population
    const spawnBubble = (initialY?: number): Bubble => {
      const radius = 35 + Math.random() * 55; // 35px to 90px
      const hues = [190, 210, 270, 320, 160, 45]; // gentle pastel hues
      return {
        id: nextBubbleIdRef.current++,
        x: Math.random() * (width - radius * 2) + radius,
        y: initialY !== undefined ? initialY : height + radius + Math.random() * 80,
        radius,
        baseRadius: radius,
        speedY: (0.7 + Math.random() * 1.0) * speedMultiplier,
        speedX: (Math.random() - 0.5) * 0.5 * speedMultiplier,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobblePhase: Math.random() * Math.PI * 2,
        hue: hues[Math.floor(Math.random() * hues.length)],
        popped: false,
      };
    };

    // Pre-populate screen with bubbles
    bubblesRef.current = [];
    const count = Math.min(18, Math.max(8, Math.floor(width / 70)));
    for (let i = 0; i < count; i++) {
      bubblesRef.current.push(spawnBubble(Math.random() * height));
    }

    let lastSpawn = Date.now();

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw soft gradient ambient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (settings.theme === 'dark') {
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(1, '#1E1B4B');
      } else if (settings.theme === 'twilight') {
        bgGrad.addColorStop(0, '#CBD5E1');
        bgGrad.addColorStop(1, '#E2E8F0');
      } else {
        bgGrad.addColorStop(0, '#E0F2FE');
        bgGrad.addColorStop(0.5, '#F0F9FF');
        bgGrad.addColorStop(1, '#EDE9FE');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const now = Date.now();
      // Periodically spawn new bubbles if under limit
      if (bubblesRef.current.length < count && now - lastSpawn > 600 / speedMultiplier) {
        bubblesRef.current.push(spawnBubble());
        lastSpawn = now;
      }

      // Update and draw bubbles
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        b.wobblePhase += b.wobbleSpeed * speedMultiplier;
        b.y -= b.speedY;
        b.x += Math.sin(b.wobblePhase) * 0.8 + b.speedX;

        // Reset if float off top
        if (b.y < -b.radius * 2) {
          bubblesRef.current.splice(i, 1);
          continue;
        }

        // Draw bubble body with gentle iridescent sheen
        ctx.save();
        ctx.translate(b.x, b.y);

        // Bubble slight wobble deformation
        const scaleX = 1 + Math.sin(b.wobblePhase) * 0.06;
        const scaleY = 1 + Math.cos(b.wobblePhase) * 0.06;
        ctx.scale(scaleX, scaleY);

        // Bubble fill
        const bubbleGrad = ctx.createRadialGradient(
          -b.radius * 0.3,
          -b.radius * 0.3,
          b.radius * 0.1,
          0,
          0,
          b.radius
        );
        bubbleGrad.addColorStop(0, `hsla(${b.hue}, 80%, 95%, 0.5)`);
        bubbleGrad.addColorStop(0.6, `hsla(${b.hue}, 70%, 80%, 0.25)`);
        bubbleGrad.addColorStop(0.9, `hsla(${b.hue}, 80%, 75%, 0.6)`);
        bubbleGrad.addColorStop(1, `hsla(${b.hue + 40}, 90%, 85%, 0.8)`);

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGrad;
        ctx.fill();

        // Bubble soft border outline
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `hsla(${b.hue}, 90%, 85%, 0.75)`;
        ctx.stroke();

        // Bubble specular shine highlight (soft curved crescent)
        ctx.beginPath();
        ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.45, Math.PI * 1.05, Math.PI * 1.75);
        ctx.lineWidth = Math.max(3, b.radius * 0.08);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Secondary bottom soft rim reflection
        ctx.beginPath();
        ctx.arc(b.radius * 0.2, b.radius * 0.2, b.radius * 0.65, Math.PI * 0.1, Math.PI * 0.4);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsla(${b.hue + 50}, 80%, 90%, 0.5)`;
        ctx.stroke();

        ctx.restore();
      }

      // Update and draw pop sparkles/droplets
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // tiny gentle gravity
        p.alpha -= 0.035;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('ALPHA', p.alpha.toString());
        ctx.fill();
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

  // Touch & Pointer Hit Detection for popping
  const popAt = (clientX: number, clientY: number) => {
    let poppedAny = false;

    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const dx = clientX - b.x;
      const dy = clientY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Generous hitbox (radius + 20px) makes popping effortless for children with motor challenges
      if (dist < b.radius + 20) {
        // Pitch inversely related to bubble size (big bubble = low pop, small bubble = higher pop)
        const pitchMod = Math.max(0.6, Math.min(1.8, 60 / b.radius));
        playBubblePop(pitchMod);

        // Spawn gentle shimmering droplets
        const numParticles = 8 + Math.floor(Math.random() * 5);
        for (let k = 0; k < numParticles; k++) {
          const angle = (Math.PI * 2 * k) / numParticles + (Math.random() - 0.5) * 0.4;
          const speed = (2 + Math.random() * 3.5) * speedMultiplier;
          particlesRef.current.push({
            x: b.x + Math.cos(angle) * (b.radius * 0.8),
            y: b.y + Math.sin(angle) * (b.radius * 0.8),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random() * 3.5,
            alpha: 0.9,
            color: `hsla(${b.hue}, 80%, 75%, ALPHA)`,
          });
        }

        bubblesRef.current.splice(i, 1);
        poppedAny = true;
        break; // Pop one bubble per touch point for precision, or keep going
      }
    }

    return poppedAny;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    popAt(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      popAt(t.clientX, t.clientY);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-sky-50 dark:bg-slate-900">
      <ActivityHeader title="Bubbles" emoji="🫧" />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onTouchStart={(e) => {
          e.preventDefault();
          for (let i = 0; i < e.touches.length; i++) {
            popAt(e.touches[i].clientX, e.touches[i].clientY);
          }
        }}
        onTouchMove={handleTouchMove}
        className="activity-canvas absolute inset-0 w-full h-full cursor-pointer"
      />
    </div>
  );
};
