import React, { useState } from 'react';
import { X, MessageSquare, Sparkles, Volume2, RefreshCw, Copy, Check } from 'lucide-react';
import { playMeowSound, playPurrSound, playWoofSound } from '../utils/audio';
import { useAuthenticatedApi } from '../auth/useAuthenticatedApi';

interface MeowTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDog?: boolean;
}

const HUMAN_TO_CAT_PRESETS = [
  'I love you sweet kitty! Time for dinner.',
  'Please stop knocking glasses off the table.',
  'Why are you staring into the empty corner at 3 AM?',
  'Get down from the refrigerator right now.',
];
const CAT_PRESETS = [
  'Meow meow prrrrr *slow blink*',
  'Meow meow *stares at bowl that is 50% empty*',
  'Hiss meow prrr *zoomies at Mach 2*',
  'Mew meow *sits directly on laptop keyboard*',
];
const HUMAN_TO_DOG_PRESETS = [
  'Who wants to go for a walk?!',
  'Please stop barking at the mailman.',
  'Drop it! That is not yours!',
  'Get off the couch right now.',
];
const DOG_PRESETS = [
  'Woof woof WOOF *spins in circles*',
  'Bork bork *stares at leash intensely*',
  'Arf arf *brings you a shoe as a gift*',
  'Whimper woof *sits on your feet*',
];

export const MeowTranslatorModal: React.FC<MeowTranslatorModalProps> = ({ isOpen, onClose, isDog = false }) => {
  const playSound = isDog ? playWoofSound : playMeowSound;
  const apiRequest = useAuthenticatedApi();
  const humanPresets   = isDog ? HUMAN_TO_DOG_PRESETS : HUMAN_TO_CAT_PRESETS;
  const petPresets     = isDog ? DOG_PRESETS : CAT_PRESETS;
  const petEmoji       = isDog ? '🐶' : '🐱';
  const petSpeakLabel  = isDog ? 'Dog Speak' : 'Cat Speak';
  const soundLabel     = isDog ? 'Dog Sounds / Barks' : 'Cat Sound / Meows';
  const petMoodLabel   = isDog ? 'Dog Mood' : 'Cat Mood';
  const toHumanTab     = isDog ? '🐶 Bark ➔ 👤 Human Thoughts' : '🐱 Cat Meow ➔ 👤 Human Thoughts';
  const toPetTab       = isDog ? '🗣️ Human ➔ 🐶 Dog Speak' : '🗣️ Human ➔ 🐱 Cat Speak';
  const titleText      = isDog ? 'Gemini AI Bark Translator' : 'Gemini AI Meow Translator';
  const subtitleText   = isDog ? 'Bridge the canine-human language barrier' : 'Bridge the feline-human language barrier';

  const [mode, setMode] = useState<'human-to-cat' | 'cat-to-human'>('human-to-cat');
  const [inputText, setInputText] = useState(humanPresets[0]);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [petMood, setPetMood] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    playPurrSound();
    try {
      const data = await apiRequest<{
        translatedText?: string;
        catMood?: string;
        actionNote?: string;
      }>('/api/gemini/meow-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, text: inputText, isDog }),
      });
      setTranslatedResult(data.translatedText || (isDog ? 'Woof! *tail wags*' : 'Meow prrr *slow blink*'));
      setPetMood(data.catMood || (isDog ? 'Very Excited' : 'Mildly Intrigued'));
      setActionNote(data.actionNote || (isDog ? '*spins in a circle*' : '*Tail flicks once*'));
      playSound(1.2);
    } catch (err) {
      setTranslatedResult(
        mode === 'human-to-cat'
          ? isDog
            ? 'WOOF WOOF *zooms around the yard* (I understood ONE word and it was walk).'
            : 'Meow prrrr *slow blink* (I acknowledge your request for treats).'
          : isDog
            ? 'Translation: "Did you say walk? I think you said walk. WALK."'
            : 'Translation: "Fill my bowl immediately or face midnight corridor zoomies."'
      );
      setPetMood(isDog ? 'Maximum Enthusiasm' : 'Regal Sovereign');
      setActionNote(isDog ? '*vibrates with excitement*' : '*Tail flicks majestically*');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedResult) return;
    navigator.clipboard?.writeText?.(translatedResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const switchMode = (newMode: 'human-to-cat' | 'cat-to-human') => {
    setMode(newMode);
    setInputText(newMode === 'human-to-cat' ? humanPresets[0] : petPresets[0]);
    setTranslatedResult(null);
    playSound(1.0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">

        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between brand-muted-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl brand-bg-solid text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{titleText}</span>
                <Sparkles className="w-4 h-4 brand-color" />
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitleText}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Mode tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
            <button
              onClick={() => switchMode('human-to-cat')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'human-to-cat'
                  ? 'bg-white dark:bg-zinc-900 brand-muted-text shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {toPetTab}
            </button>
            <button
              onClick={() => switchMode('cat-to-human')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'cat-to-human'
                  ? 'bg-white dark:bg-zinc-900 brand-muted-text shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {toHumanTab}
            </button>
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quick Presets</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(mode === 'human-to-cat' ? humanPresets : petPresets).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInputText(preset); playSound(1.0); }}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:brand-muted-border shrink-0 transition-colors"
                >
                  "{preset.length > 25 ? preset.slice(0, 25) + '...' : preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              {mode === 'human-to-cat' ? 'Your Human Phrase' : soundLabel}
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'human-to-cat' ? 'Type human text...' : `Type ${isDog ? 'dog barks or sounds' : 'cat meows or sounds'}...`}
              className="w-full px-4 py-3 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none brand-focus"
            />
          </div>

          {/* Translate button */}
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 brand-bg text-white font-bold text-sm rounded-2xl shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>Translating with Gemini AI...</span></>
            ) : (
              <><Sparkles className="w-4 h-4" /><span>Translate to {mode === 'human-to-cat' ? petSpeakLabel : 'Human Thoughts'}</span></>
            )}
          </button>

          {/* Result */}
          {translatedResult && (
            <div className="p-5 brand-muted-bg rounded-3xl brand-muted-border border space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{petEmoji}</span>
                  <span className="text-xs font-bold brand-muted-text uppercase tracking-wider">Translation Result</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => playSound(1.3)} className="p-1.5 brand-muted-text hover:brand-muted-bg rounded-full transition-colors" title={isDog ? 'Play Woof SFX' : 'Play Meow SFX'}>
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleCopy} className="p-1.5 brand-muted-text hover:brand-muted-bg rounded-full transition-colors" title="Copy Translation">
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">"{translatedResult}"</p>

              {petMood && (
                <div className="flex items-center justify-between pt-2 border-t brand-muted-border text-xs">
                  <span className="brand-muted-text font-semibold">
                    {petMoodLabel}: <strong className="text-zinc-900 dark:text-zinc-100">{petMood}</strong>
                  </span>
                  {actionNote && <span className="brand-muted-text italic text-[11px]">{actionNote}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
