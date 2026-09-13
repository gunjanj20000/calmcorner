import React, { useRef, useEffect } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  isDragging: boolean;
  dragPointerId: number | null;
  dragOffsetX: number;
  dragOffsetY: number;
  swayPhase: number;
  swaySpeed: number;
}

export const FloatingActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { speedMultiplier, playChime, triggerHaptic, settings } = useApp();

  const itemsRef = useRef<FloatingItem[]>([]);
  const animFrameRef = useRef<number | null>(null);

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

    // Friendly, soothing floating items
    const floatingTypes = ['🪶', '🍃', '🎈', '⭐', '☁️', '🌸', '🍂', '✨', '🎈', '🪶'];
    const count = Math.min(16, Math.max(8, Math.floor(width / 75)));

    itemsRef.current = [];
    for (let i = 0; i < count; i++) {
      const emoji = floatingTypes[i % floatingTypes.length];
      const isBalloon = emoji === '🎈';
      const isCloud = emoji === '☁️';
      const isLeaf = emoji === '🍃' || emoji === '🍂';

      // Balloons drift slightly upward, leaves drift gently downward/sideways, clouds drift horizontal
      const baseVy = isBalloon ? -0.4 : isLeaf ? 0.35 : 0.05;
      const baseVx = isCloud ? 0.4 : (Math.random() - 0.5) * 0.3;

      itemsRef.current.push({
        id: i,
        emoji,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 150) + 75,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: isCloud ? 58 : isBalloon ? 52 : 46,
        rotation: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        isDragging: false,
        dragPointerId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02,
      });
    }

    const loop = () => {
      // Clear with soft pastel sky gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (settings.theme === 'dark') {
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(1, '#0F172A');
      } else if (settings.theme === 'twilight') {
        bgGrad.addColorStop(0, '#CBD5E1');
        bgGrad.addColorStop(1, '#F1F5F9');
      } else {
        bgGrad.addColorStop(0, '#FFF1F2');
        bgGrad.addColorStop(0.5, '#F0FDF4');
        bgGrad.addColorStop(1, '#F0F9FF');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and render floating items
      itemsRef.current.forEach((item) => {
        if (!item.isDragging) {
          item.swayPhase += item.swaySpeed * speedMultiplier;
          const sway = Math.sin(item.swayPhase) * 0.5;

          // Damping of drag velocity back to ambient floating velocity
          item.vx += (item.baseVx + sway - item.vx) * 0.02;
          item.vy += (item.baseVy - item.vy) * 0.02;

          item.x += item.vx * speedMultiplier;
          item.y += item.vy * speedMultiplier;
          item.rotation += item.rotSpeed * speedMultiplier;

          // Wrap edges smoothly
          const margin = 80;
          if (item.x < -margin) item.x = width + margin;
          if (item.x > width + margin) item.x = -margin;
          if (item.y < -margin) item.y = height + margin;
          if (item.y > height + margin) item.y = -margin;
        }

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        // Soft shadow underneath item
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw ambient glow if dragging
        if (item.isDragging) {
          ctx.beginPath();
          ctx.arc(0, 0, item.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        }

        // Draw emoji
        ctx.fillText(item.emoji, 0, 0);

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [speedMultiplier, settings.theme]);

  // Pointer & Drag handling
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointerX = e.clientX;
    const pointerY = e.clientY;

    // Search in reverse so top-most item is grabbed
    for (let i = itemsRef.current.length - 1; i >= 0; i--) {
      const item = itemsRef.current[i];
      const dx = pointerX - item.x;
      const dy = pointerY - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Generous grab radius (size * 1.2) for motor ease
      if (dist < item.size * 1.2 && !item.isDragging) {
        item.isDragging = true;
        item.dragPointerId = e.pointerId;
        item.dragOffsetX = dx;
        item.dragOffsetY = dy;
        item.vx = 0;
        item.vy = 0;

        triggerHaptic(20);
        playChime();

        // Bring to front
        itemsRef.current.splice(i, 1);
        itemsRef.current.push(item);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    itemsRef.current.forEach((item) => {
      if (item.isDragging && item.dragPointerId === e.pointerId) {
        const newX = e.clientX - item.dragOffsetX;
        const newY = e.clientY - item.dragOffsetY;

        // Calculate velocity based on movement
        item.vx = (newX - item.x) * 0.3;
        item.vy = (newY - item.y) * 0.3;

        item.x = newX;
        item.y = newY;
      }
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    itemsRef.current.forEach((item) => {
      if (item.isDragging && item.dragPointerId === e.pointerId) {
        item.isDragging = false;
        item.dragPointerId = null;
        triggerHaptic(10);
      }
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-rose-50/50 dark:bg-slate-900">
      <ActivityHeader title="Floating" emoji="🪶" />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="activity-canvas absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
