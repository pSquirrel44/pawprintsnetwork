import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Download, Zap } from 'lucide-react';

// ─── Filter definitions ──────────────────────────────────────────────────────
// Each filter is a CSS filter string + canvas post-processing descriptor

interface FilterDef {
  id: string;
  label: string | ((isDog: boolean) => string);
  emoji: string;
  css: string;           // CSS filter applied to <video>
  overlay?: string;      // optional rgba overlay color
  overlayOpacity?: number;
  cat?: boolean;         // show on cat platform
  dog?: boolean;         // show on dog platform
}

const FILTERS: FilterDef[] = [
  {
    id: 'none',
    label: 'Normal',
    emoji: '📷',
    css: 'none',
    cat: true, dog: true,
  },
  {
    id: 'warm-glow',
    label: isDog => isDog ? 'Golden Hour' : 'Warm Loaf',
    emoji: '🌅',
    css: 'sepia(0.25) saturate(1.4) contrast(1.1) brightness(1.05) hue-rotate(-8deg)',
    overlay: '#ff9900',
    overlayOpacity: 0.06,
    cat: true, dog: true,
  },
  {
    id: 'vintage-whiskers',
    label: isDog => isDog ? 'Vintage Rover' : 'Vintage Whiskers',
    emoji: '📸',
    css: 'sepia(0.45) contrast(1.25) brightness(0.88) saturate(1.5)',
    overlay: '#8B4513',
    overlayOpacity: 0.08,
    cat: true, dog: true,
  },
  {
    id: 'cyber-cool',
    label: 'Cyber Neon',
    emoji: '🔮',
    css: 'hue-rotate(180deg) contrast(1.3) saturate(1.6) brightness(0.95)',
    overlay: '#0ff',
    overlayOpacity: 0.05,
    cat: true, dog: true,
  },
  {
    id: 'sepia-purr',
    label: isDog => isDog ? 'Sepia Snoot' : 'Sepia Purr',
    emoji: '🎞️',
    css: 'sepia(0.75) contrast(1.1) brightness(0.98)',
    cat: true, dog: true,
  },
  {
    id: 'black-white-paws',
    label: 'B&W Paws',
    emoji: '🖤',
    css: 'grayscale(1) contrast(1.5) brightness(1.02)',
    cat: true, dog: true,
  },
  {
    id: 'catwalk-editorial',
    label: 'Editorial',
    emoji: '👁️',
    css: 'contrast(1.4) saturate(0.6) brightness(0.92)',
    overlay: '#1a1e3c',
    overlayOpacity: 0.10,
    cat: true, dog: false,
  },
  {
    id: 'electric-purple',
    label: 'Electric',
    emoji: '⚡',
    css: 'saturate(2.0) contrast(1.2) hue-rotate(-30deg) brightness(1.08)',
    overlay: '#8b30e8',
    overlayOpacity: 0.08,
    cat: true, dog: false,
  },
  {
    id: 'dog-park-sunny',
    label: 'Dog Park',
    emoji: '☀️',
    css: 'saturate(1.6) contrast(1.1) brightness(1.12) hue-rotate(10deg)',
    overlay: '#fdb52a',
    overlayOpacity: 0.06,
    cat: false, dog: true,
  },
  {
    id: 'teal-dream',
    label: 'Teal Dream',
    emoji: '🌊',
    css: 'saturate(1.4) contrast(1.15) hue-rotate(160deg) brightness(0.98)',
    overlay: '#2ec4b6',
    overlayOpacity: 0.07,
    cat: false, dog: true,
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    emoji: '🌑',
    css: 'contrast(1.7) saturate(0.8) brightness(0.78)',
    overlay: '#000',
    overlayOpacity: 0.15,
    cat: true, dog: true,
  },
  {
    id: 'dreamy',
    label: 'Dreamy',
    emoji: '🌸',
    css: 'saturate(1.2) brightness(1.15) contrast(0.9) blur(0.5px)',
    overlay: '#f9a8d4',
    overlayOpacity: 0.08,
    cat: true, dog: true,
  },
];

// Runtime label resolver
function getLabel(f: FilterDef, isDog: boolean): string {
  if (typeof f.label === 'function') return (f.label as (d: boolean) => string)(isDog);
  return f.label as string;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface LiveFilterCameraProps {
  isDog?: boolean;
  onCapture: (dataUrl: string, filterId: string) => void;
  onClose: () => void;
}

export const LiveFilterCamera: React.FC<LiveFilterCameraProps> = ({
  isDog = false,
  onCapture,
  onClose,
}) => {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number>(0);

  const [activeFilter, setActiveFilter] = useState('none');
  const [facing, setFacing]             = useState<'user' | 'environment'>('environment');
  const [permission, setPermission]     = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [captured, setCaptured]         = useState<string | null>(null);
  const [flash, setFlash]               = useState(false);

  const availableFilters = FILTERS.filter(f => isDog ? f.dog : f.cat);

  // Start camera stream
  const startCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermission('granted');
    } catch (err: unknown) {
      const error = err as { name?: string };
      setPermission(error?.name === 'NotAllowedError' ? 'denied' : 'denied');
    }
  }, []);

  useEffect(() => {
    startCamera(facing);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, [facing, startCamera]);

  // Apply filter overlay on canvas (for the live preview overlay canvas)
  const currentFilter = availableFilters.find(f => f.id === activeFilter) ?? availableFilters[0];

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d')!;

    // Draw video frame
    ctx.filter = currentFilter.css !== 'none' ? currentFilter.css : '';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = '';

    // Apply colour overlay if defined
    if (currentFilter.overlay && currentFilter.overlayOpacity) {
      ctx.fillStyle = currentFilter.overlay;
      ctx.globalAlpha = currentFilter.overlayOpacity;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  }, [currentFilter]);

  const handleAccept = () => {
    if (captured) {
      onCapture(captured, activeFilter);
      onClose();
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const isDogGrad = 'linear-gradient(135deg,#0d9488,#2ec4b6,#fdb52a)';
  const isCatGrad = 'linear-gradient(135deg,#8b30e8,#f050a0,#f07040)';
  const accentGrad = isDog ? isDogGrad : isCatGrad;
  const accentColor = isDog ? '#2ec4b6' : '#8b30e8';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-safe-top pt-4 pb-3">
        <button onClick={onClose}
          className="w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
          <X className="w-5 h-5" />
        </button>

        <div className="text-white text-sm font-bold px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
          {isDog ? '🐶 The Dog Park' : '🐱 The Catwalk'} · {getLabel(currentFilter, isDog)}
        </div>

        <button onClick={() => setFacing(f => f === 'user' ? 'environment' : 'user')}
          className="w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Camera / Preview */}
      <div className="flex-1 relative overflow-hidden">
        {!captured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: currentFilter.css !== 'none' ? currentFilter.css : undefined }}
            />
            {currentFilter.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: currentFilter.overlay, opacity: currentFilter.overlayOpacity }}
              />
            )}
            {flash && (
              <div className="absolute inset-0 bg-white z-30 animate-ping" style={{ animationDuration: '150ms', animationIterationCount: 1 }} />
            )}
            {permission === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white text-center p-8">
                <Camera className="w-12 h-12 opacity-40" />
                <p className="text-sm opacity-60">Camera access denied.<br />Enable it in your browser settings.</p>
              </div>
            )}
          </>
        ) : (
          <img src={captured} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Filter strip */}
      {!captured && (
        <div className="absolute bottom-28 left-0 right-0 z-20">
          <div className="flex gap-2 px-4 overflow-x-auto pb-1 scrollbar-none">
            {availableFilters.map(f => {
              const active = f.id === activeFilter;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${active ? 'scale-110' : 'opacity-70'}`}
                    style={{
                      borderColor: active ? accentColor : 'rgba(255,255,255,0.3)',
                      background: 'rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(8px)',
                      filter: f.css !== 'none' ? f.css : undefined,
                    }}
                  >
                    {f.emoji}
                  </div>
                  <span className={`text-[10px] font-bold text-white ${active ? 'opacity-100' : 'opacity-50'}`}>
                    {getLabel(f, isDog)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around px-8 pb-safe-bottom pb-8 pt-4">
        {!captured ? (
          <>
            <div className="w-10" />
            {/* Shutter */}
            <button
              onClick={handleCapture}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center shadow-xl transition-transform active:scale-95"
              style={{ width: 72, height: 72 }}>
              <div className="w-14 h-14 rounded-full" style={{ background: accentGrad }} />
            </button>
            <div className="w-10" />
          </>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="flex flex-col items-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Retake</span>
            </button>

            <button
              onClick={handleAccept}
              className="flex flex-col items-center gap-1">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: accentGrad }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-[11px] font-bold text-white">Use Photo</span>
            </button>

            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = captured!;
                link.download = `pawprint-${Date.now()}.jpg`;
                link.click();
              }}
              className="flex flex-col items-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Save</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
