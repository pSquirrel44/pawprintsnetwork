import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Volume2, VolumeX, ChevronDown, ChevronUp, Repeat, Star, StarOff } from 'lucide-react';
import {
  playMeowSound, playCatHiss, playPurrSound, playCatChirp, playCatGrowl, playCatTrill,
  playWoofSound, playDogHowl, playDogWhine, playDogGrowl, playDogYip, playDogSniff,
  playTreatSound, playNotifSound,
  setMasterVolume,
} from '../utils/audio';

interface SoundEntry {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  fn: (pitch?: number) => void;
  hasPitch?: boolean;
  category: string;
}

const CAT_SOUNDS: SoundEntry[] = [
  { id: 'meow',   label: 'Meow',   emoji: '🐱', desc: 'Classic meow with formant vowel sweep',  fn: playMeowSound,  hasPitch: true, category: 'Vocalizations' },
  { id: 'trill',  label: 'Trill',  emoji: '😽', desc: 'Affectionate mrrp greeting sound',       fn: playCatTrill,   hasPitch: true, category: 'Vocalizations' },
  { id: 'chirp',  label: 'Chirp',  emoji: '🐦', desc: 'Bird-watching chatter stutter',          fn: playCatChirp,   hasPitch: true, category: 'Vocalizations' },
  { id: 'purr',   label: 'Purr',   emoji: '😸', desc: '25Hz amplitude-modulated chest purr',    fn: playPurrSound,  hasPitch: false, category: 'Vocalizations' },
  { id: 'hiss',   label: 'Hiss',   emoji: '😾', desc: 'Turbulent broadband territorial hiss',   fn: playCatHiss,    hasPitch: false, category: 'Warnings' },
  { id: 'growl',  label: 'Growl',  emoji: '😤', desc: 'Deep sub-bass territorial warning',      fn: playCatGrowl,   hasPitch: true,  category: 'Warnings' },
];

const DOG_SOUNDS: SoundEntry[] = [
  { id: 'woof',   label: 'Woof',   emoji: '🐶', desc: 'Full bark: noise burst + tonal + sub',   fn: playWoofSound,  hasPitch: true, category: 'Barks' },
  { id: 'yip',    label: 'Yip',    emoji: '🐕', desc: 'Excited triple yip bark',                fn: playDogYip,     hasPitch: true, category: 'Barks' },
  { id: 'howl',   label: 'Howl',   emoji: '🐺', desc: '2-second pitch-arc howl with tremolo',   fn: playDogHowl,    hasPitch: true, category: 'Vocalizations' },
  { id: 'whine',  label: 'Whine',  emoji: '🥺', desc: 'Soft nasal pleading whine',              fn: playDogWhine,   hasPitch: true, category: 'Vocalizations' },
  { id: 'growl',  label: 'Growl',  emoji: '😠', desc: 'Low chest growl with sub-octave',        fn: playDogGrowl,   hasPitch: true, category: 'Warnings' },
  { id: 'sniff',  label: 'Sniff',  emoji: '👃', desc: 'Triple-pulse nasal investigation',       fn: playDogSniff,   hasPitch: false, category: 'Ambient' },
];

const SHARED_SOUNDS: SoundEntry[] = [
  { id: 'treat',  label: 'Treat Chime', emoji: '🐟', desc: 'C5→E5→G5 bell chime reward sound', fn: playTreatSound,  hasPitch: true, category: 'UI' },
  { id: 'notif',  label: 'Notification', emoji: '🔔', desc: 'Soft two-note UI ping',           fn: playNotifSound,  hasPitch: false, category: 'UI' },
];

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDog?: boolean;
  onSelectSound?: (soundId: string, label: string) => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  isOpen, onClose, isDog = false, onSelectSound,
}) => {
  const [volume, setVolume]     = useState(0.85);
  const [muted, setMuted]       = useState(false);
  const [pitches, setPitches]   = useState<Record<string, number>>({});
  const [favorites, setFavs]    = useState<Set<string>>(new Set());
  const [playing, setPlaying]   = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const analyserRef = useRef<Record<string, AnalyserNode>>({});
  const animRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setMasterVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const getSounds = () => {
    const species = isDog ? DOG_SOUNDS : CAT_SOUNDS;
    return activeSection === 'favorites'
      ? [...species, ...SHARED_SOUNDS].filter(s => favorites.has(s.id))
      : activeSection === 'all'
      ? [...species, ...SHARED_SOUNDS]
      : [...species, ...SHARED_SOUNDS].filter(s => s.category === activeSection);
  };

  const getCategories = () => {
    const sounds = isDog ? DOG_SOUNDS : CAT_SOUNDS;
    const cats = [...new Set([...sounds, ...SHARED_SOUNDS].map(s => s.category))];
    return ['all', ...cats, 'favorites'];
  };

  const getOrCreateAnalyser = useCallback((id: string) => {
    if (analyserRef.current[id]) return analyserRef.current[id];
    const ctx2 = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    const a = ctx2.createAnalyser();
    a.fftSize = 128;
    a.connect(ctx2.destination);
    analyserRef.current[id] = a;
    return a;
  }, []);

  const drawViz = useCallback((id: string) => {
    const canvas = canvasRefs.current[id];
    const analyser = analyserRef.current[id];
    if (!canvas || !analyser) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      animRef.current[id] = requestAnimationFrame(loop);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      analyser.getByteTimeDomainData(data);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      const grad = isDog
        ? (() => { const g = ctx2d.createLinearGradient(0,0,canvas.width,0); g.addColorStop(0,'#0d9488'); g.addColorStop(1,'#fdb52a'); return g; })()
        : (() => { const g = ctx2d.createLinearGradient(0,0,canvas.width,0); g.addColorStop(0,'#8b30e8'); g.addColorStop(1,'#f07040'); return g; })();
      ctx2d.strokeStyle = grad;
      ctx2d.lineWidth = 1.5;
      ctx2d.beginPath();
      const sw = canvas.width / data.length;
      data.forEach((v, i) => {
        const y = (v / 128) * (canvas.height / 2);
        i === 0 ? ctx2d.moveTo(i * sw, y) : ctx2d.lineTo(i * sw, y);
      });
      ctx2d.stroke();
    };
    loop();
  }, [isDog]);

  useEffect(() => {
    return () => {
      Object.values(animRef.current).forEach((id: number) => cancelAnimationFrame(id));
    };
  }, []);

  const handlePlay = (sound: SoundEntry) => {
    if (muted) return;
    const pitch = pitches[sound.id] ?? 1.0;
    setPlaying(sound.id);
    sound.fn(pitch);
    setTimeout(() => setPlaying(null), 600);
    if (onSelectSound) onSelectSound(sound.id, sound.label);
    drawViz(sound.id);
  };

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const catGrad = 'linear-gradient(135deg,#8b30e8,#f050a0,#f07040)';
  const dogGrad = 'linear-gradient(135deg,#0d9488,#2ec4b6,#fdb52a)';
  const grad = isDog ? dogGrad : catGrad;
  const accent = isDog ? '#2ec4b6' : '#8b30e8';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${isDog ? 'rgba(13,148,136,.08)' : 'rgba(139,48,232,.08)'}, transparent)` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg shadow"
              style={{ background: grad }}>
              {isDog ? '🐶' : '🐱'}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isDog ? 'Dog Park Sound Library' : 'Catwalk Sound Library'}
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                {isDog ? '6 dog + 2 shared sounds' : '6 cat + 2 shared sounds'} · web audio synthesis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(!muted)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Volume */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider w-16">VOLUME</span>
          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={e => { setMuted(false); setVolume(parseFloat(e.target.value)); setMasterVolume(parseFloat(e.target.value)); }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: accent }} />
          <span className="text-[11px] font-mono text-zinc-500 w-8 text-right">{Math.round((muted ? 0 : volume) * 100)}%</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 py-2.5 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0 scrollbar-none">
          {getCategories().map(cat => (
            <button key={cat}
              onClick={() => setActiveSection(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border font-mono tracking-wide ${
                activeSection === cat
                  ? 'text-white border-transparent shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-transparent hover:border-zinc-300'
              }`}
              style={activeSection === cat ? { background: grad, borderColor: 'transparent' } : {}}>
              {cat === 'favorites' ? '⭐ Favs' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sound grid */}
        <div className="overflow-y-auto flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {getSounds().map(sound => {
            const pitch = pitches[sound.id] ?? 1.0;
            const isPlaying = playing === sound.id;
            const isFav = favorites.has(sound.id);

            return (
              <div key={sound.id}
                className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">

                {/* Sound header */}
                <div className="p-3 flex items-center gap-2.5">
                  <span className="text-2xl">{sound.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sound.label}</div>
                    <div className="text-[10px] text-zinc-400 truncate font-mono">{sound.desc}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleFav(sound.id)}
                      className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-400">
                      {isFav
                        ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        : <StarOff className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500">{sound.category}</span>
                  </div>
                </div>

                {/* Waveform visualizer */}
                <div className="mx-3 mb-2 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
                  <canvas
                    ref={el => { canvasRefs.current[sound.id] = el; }}
                    className="w-full h-full"
                    style={{ display: 'block' }}
                  />
                </div>

                {/* Pitch slider */}
                {sound.hasPitch && (
                  <div className="px-3 mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 w-10">PITCH</span>
                    <input type="range" min="0.5" max="2.0" step="0.05" value={pitch}
                      onChange={e => setPitches(prev => ({ ...prev, [sound.id]: parseFloat(e.target.value) }))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: accent }} />
                    <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{pitch.toFixed(2)}×</span>
                  </div>
                )}

                {/* Play button */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => handlePlay(sound)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${isPlaying ? 'opacity-70 scale-[0.98]' : 'hover:opacity-90 active:scale-[0.97]'}`}
                    style={{ background: grad }}>
                    <span>{isPlaying ? '▶ Playing...' : `▶ Play ${sound.label}`}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {getSounds().length === 0 && (
            <div className="col-span-2 text-center py-12 text-zinc-400 text-sm">
              No favorites yet — tap ⭐ on any sound to save it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
