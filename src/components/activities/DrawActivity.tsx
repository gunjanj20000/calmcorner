import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ActivityHeader } from '../common/ActivityHeader';
import { useApp } from '../../context/AppContext';
import { Eraser, Trash2, RotateCcw, Paintbrush } from 'lucide-react';

export const DrawActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playDrawingStroke, triggerHaptic } = useApp();

  const [currentColor, setCurrentColor] = useState<string>('#60A5FA'); // Soft blue
  const [brushSize, setBrushSize] = useState<number>(24); // Large, easy touch
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isHoldingClear, setIsHoldingClear] = useState<boolean>(false);
  const [clearProgress, setClearProgress] = useState<number>(0);

  // Undo history
  const undoStackRef = useRef<ImageData[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const clearTimerRef = useRef<number | null>(null);

  // Calming pastel & friendly primary palette
  const colors = [
    '#60A5FA', // Sky Blue
    '#34D399', // Mint Teal
    '#A78BFA', // Lavender
    '#F472B6', // Soft Rose
    '#FBBF24', // Warm Amber
    '#FB923C', // Soft Peach
    '#38BDF8', // Cyan
    '#334155', // Deep Slate
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fill white background initially
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state for undo
    undoStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];

    const handleResize = () => {
      if (!canvas) return;
      // Preserve drawing on resize
      const prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(prevData, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
  }, []);

  const handleUndo = () => {
    triggerHaptic(15);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (undoStackRef.current.length > 1) {
      undoStackRef.current.pop(); // Pop current
      const previous = undoStackRef.current[undoStackRef.current.length - 1];
      ctx.putImageData(previous, 0, 0);
    }
  };

  // Draw stroke line between points
  const drawSegment = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.strokeStyle = '#FFFFFF';
    } else {
      ctx.strokeStyle = currentColor;
    }

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastXRef.current = x;
    lastYRef.current = y;

    playDrawingStroke();
  };

  // Touch & Pointer handlers
  const startDrawing = (x: number, y: number) => {
    isDrawingRef.current = true;
    lastXRef.current = x;
    lastYRef.current = y;
    drawSegment(x, y);
  };

  const continueDrawing = (x: number, y: number) => {
    if (!isDrawingRef.current) return;
    drawSegment(x, y);
  };

  const endDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveHistory();
    }
  };

  // Clear Canvas with gentle hold safeguard
  const startHoldClear = () => {
    triggerHaptic(15);
    setIsHoldingClear(true);
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / 1200) * 100);
      setClearProgress(progress);

      if (progress >= 100) {
        clearCanvas();
        setIsHoldingClear(false);
        setClearProgress(0);
      } else {
        clearTimerRef.current = requestAnimationFrame(update);
      }
    };

    clearTimerRef.current = requestAnimationFrame(update);
  };

  const stopHoldClear = () => {
    if (clearTimerRef.current) cancelAnimationFrame(clearTimerRef.current);
    setIsHoldingClear(false);
    setClearProgress(0);
  };

  const clearCanvas = () => {
    triggerHaptic([20, 40]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-white">
      <ActivityHeader title="Free Draw" emoji="🎨" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          startDrawing(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) continueDrawing(e.clientX, e.clientY);
        }}
        onPointerUp={endDrawing}
        onPointerCancel={endDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          startDrawing(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          continueDrawing(t.clientX, t.clientY);
        }}
        onTouchEnd={endDrawing}
        className="activity-canvas absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* Drawing Toolbar at Bottom */}
      <div 
        className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-3 px-4 pointer-events-none"
        style={{ paddingBottom: 'calc(var(--sab, 0px) + 8px)' }}
      >
        {/* Colors and Tools Bar */}
        <div className="pointer-events-auto flex flex-wrap justify-center items-center gap-2.5 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-full">
          
          {/* Color palette blobs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  triggerHaptic(15);
                  setCurrentColor(c);
                  setIsEraser(false);
                }}
                style={{ backgroundColor: c }}
                className={`touch-btn w-12 h-12 rounded-full transition-transform border-4 ${
                  currentColor === c && !isEraser
                    ? 'border-indigo-600 scale-110 shadow-lg'
                    : 'border-white/80 dark:border-slate-700'
                }`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>

          <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Brush sizes */}
          <div className="flex items-center gap-2">
            {[14, 26, 42].map((size) => (
              <button
                key={size}
                onClick={() => {
                  triggerHaptic(15);
                  setBrushSize(size);
                }}
                className={`touch-btn w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  brushSize === size
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 border-2 border-indigo-600 text-indigo-700'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                }`}
                aria-label={`Brush size ${size}`}
              >
                <div 
                  className="rounded-full bg-current" 
                  style={{ width: `${Math.max(6, size * 0.45)}px`, height: `${Math.max(6, size * 0.45)}px` }} 
                />
              </button>
            ))}
          </div>

          <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Action Buttons: Eraser, Undo, Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(15);
                setIsEraser(!isEraser);
              }}
              className={`touch-btn w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                isEraser
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              aria-label="Eraser tool"
            >
              {isEraser ? <Paintbrush className="w-6 h-6" /> : <Eraser className="w-6 h-6" />}
            </button>

            <button
              onClick={handleUndo}
              className="touch-btn w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
              aria-label="Undo"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            {/* Clear Screen with Hold Animation Safeguard */}
            <button
              onMouseDown={startHoldClear}
              onMouseUp={stopHoldClear}
              onMouseLeave={stopHoldClear}
              onTouchStart={startHoldClear}
              onTouchEnd={stopHoldClear}
              onTouchCancel={stopHoldClear}
              className="touch-btn relative px-4 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-800 flex items-center gap-2 font-bold overflow-hidden select-none"
              aria-label="Hold to Clear canvas"
            >
              {isHoldingClear && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-rose-200 dark:bg-rose-900/80 transition-all duration-75"
                  style={{ width: `${clearProgress}%` }}
                />
              )}
              <Trash2 className="w-5 h-5 relative z-10" />
              <span className="relative z-10 text-sm">{isHoldingClear ? 'Holding...' : 'Clear'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
