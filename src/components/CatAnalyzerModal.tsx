import React, { useState } from 'react';
import { X, Sparkles, Upload, RefreshCw, Eye } from 'lucide-react';
import { CatAnalysisResult } from '../types';
import { playMeowSound, playPurrSound, playWoofSound } from '../utils/audio';
import { useAuthenticatedApi } from '../auth/useAuthenticatedApi';

interface CatAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDog?: boolean;
}

const SAMPLE_CAT_IMAGES = [
  { label: 'Judging Tuxedo',  url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80' },
  { label: 'Supreme Loaf',    url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80' },
  { label: 'Staring Void',    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80' },
];

const SAMPLE_DOG_IMAGES = [
  { label: 'Maximum Zoomies', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Good Boy Sit',    url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80' },
  { label: 'Snoot Champion',  url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80' },
];

export const CatAnalyzerModal: React.FC<CatAnalyzerModalProps> = ({ isOpen, onClose, isDog = false }) => {
  const samples = isDog ? SAMPLE_DOG_IMAGES : SAMPLE_CAT_IMAGES;
  const playSound = isDog ? playWoofSound : playMeowSound;
  const apiRequest = useAuthenticatedApi();

  const [imageUrl, setImageUrl] = useState(samples[0].url);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CatAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setImageBase64(event.target.result as string);
          setAnalysisResult(null);
          playSound(1.1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    playPurrSound();
    try {
      const data = await apiRequest<CatAnalysisResult>('/api/gemini/cat-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || null,
          isDog,
          description: isDog
            ? `A good dog photo analysis for The Dog Park: ${imageUrl}`
            : `A majestic cat photo analysis for The Catwalk: ${imageUrl}`,
        }),
      });
      setAnalysisResult(data);
      playSound(1.3);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisResult(
        isDog
          ? {
              judgementLevel: 12,
              loafFormRating: 'N/A — too wiggly to loaf',
              innerMonologue: 'BALL. BALL BALL BALL. IS THAT A SQUIRREL.',
              breedEstimate: 'Certified Good Boy (Mixed)',
              moodTag: 'Maximum Excitement',
              whiskersScore: 'Eyebrows: 10/10 Expressive',
              funFact: 'Dogs can smell your emotions and will sit on you until you feel better.',
            }
          : {
              judgementLevel: 96,
              loafFormRating: '9.9 / 10 Flawless Tuck',
              innerMonologue: 'I am judging your life choices from this sunbeam.',
              breedEstimate: 'Majestic Domestic Short Hair',
              moodTag: 'Supreme Monarch',
              whiskersScore: '10/10 Perfect Symmetry',
              funFact: 'Cats spend 70% of their lives sleeping and 30% judging humans.',
            }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Labels swap based on species
  const modalTitle   = isDog ? 'AI Dog Vision & Good Boy Meter' : 'AI Cat Vision & Judgement Meter';
  const modalSub     = isDog ? 'Gemini Multimodal Dog Zoomie & Goodness Rating' : 'Gemini Multimodal Cat Judgement & Loaf Rating';
  const uploadLabel  = isDog ? 'Upload Your Dog Photo' : 'Upload Your Cat Photo';
  const sampleLabel  = isDog ? 'Select Sample Dog:' : 'Select Sample Cat:';
  const analyzeLabel = isDog ? 'Analyze Zoomies & Goodness' : 'Analyze Judgement & Loaf';
  const loadingLabel = isDog ? 'Analyzing Dog Energy...' : 'Analyzing Cat Eyes & Loaf...';
  const meter1Label  = isDog ? 'Goodness Level' : 'Judgement Level';
  const stat1Label   = isDog ? 'Zoomie Rating' : 'Loaf Form';
  const stat4Label   = isDog ? 'Eyebrow Score' : 'Whiskers Score';
  const monologueLabel = isDog ? 'Inner Monologue' : 'Inner Monologue';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">

        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between brand-muted-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl brand-bg-solid text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{modalTitle}</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{modalSub}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">

            {/* Image preview */}
            <div className="relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
              <img src={imageUrl} alt="Pet to analyze" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">{uploadLabel}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Sample selector + analyze button */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{sampleLabel}</p>
              <div className="space-y-2">
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setImageUrl(sample.url); setImageBase64(null); setAnalysisResult(null); playSound(1.0); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                      imageUrl === sample.url
                        ? 'brand-muted-border brand-muted-bg brand-muted-text border'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="w-8 h-8 rounded-lg object-cover" />
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full py-3 brand-bg text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /><span>{loadingLabel}</span></>
                ) : (
                  <><Sparkles className="w-4 h-4" /><span>{analyzeLabel}</span></>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {analysisResult && (
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/80 rounded-3xl border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in duration-300">

              {/* Meter bar */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="flex items-center gap-1 brand-color">
                    <Eye className="w-4 h-4" />{meter1Label}:
                  </span>
                  <span className="brand-color">{analysisResult.judgementLevel}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full brand-bg transition-all duration-700 ease-out"
                    style={{ width: `${analysisResult.judgementLevel}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 font-medium block text-[10px] uppercase">{stat1Label}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{analysisResult.loafFormRating}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 font-medium block text-[10px] uppercase">Mood Tag</span>
                  <span className="font-bold brand-color">{analysisResult.moodTag}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 font-medium block text-[10px] uppercase">Breed Estimate</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{analysisResult.breedEstimate}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 font-medium block text-[10px] uppercase">{stat4Label}</span>
                  <span className="font-bold text-amber-500">{analysisResult.whiskersScore}</span>
                </div>
              </div>

              {/* Inner monologue */}
              <div className="p-3.5 brand-muted-bg rounded-2xl brand-muted-border border text-xs brand-muted-text">
                <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider brand-color">{monologueLabel}:</span>
                <p className="italic">"{analysisResult.innerMonologue}"</p>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center italic">💡 {analysisResult.funFact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
