import React, { useState } from 'react';
import { TweakConfig } from '../types';
import { PALETTES } from '../data/mockStats';
import { LoIcon } from './Icons';

interface TweaksPanelProps {
  t: TweakConfig;
  setTweak: <K extends keyof TweakConfig>(key: K, val: TweakConfig[K]) => void;
  screen: string;
  setScreen: (s: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const TweaksPanel: React.FC<TweaksPanelProps> = ({ t, setTweak, screen, setScreen, apiKey, setApiKey }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  const palettesList = PALETTES;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className="fixed right-4 bottom-4 z-[9999] w-12 h-12 rounded-full shadow-shd-2 bg-ink dark:bg-[#FFAF9E] text-bg-light dark:text-bg-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-all select-none"
        aria-label="Panel de Ajustes Visuales"
        title="Panel de Ajustes"
      >
        <LoIcon name="settings" size={20} className={open ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
      </button>

      {open && (
        <div className="fixed right-4 bottom-18 z-[9998] w-[290px] max-h-[calc(100vh-90px)] rounded-xl border border-white/60 dark:border-white/10 shadow-shd-2 overflow-hidden flex flex-col font-mono text-[11.5px] leading-relaxed text-[#29261b] dark:text-[#f4eeef] select-none bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-xl saturate-150 lo-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-ink/10 dark:border-white/10">
            <span className="font-bold tracking-wider">Ajustes del MVP</span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-md hover:bg-ink/5 dark:hover:bg-white/5 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Dark Mode Tweak */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Modo Oscuro</span>
              <button
                onClick={() => setTweak('dark', !t.dark)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  t.dark ? 'bg-pos' : 'bg-ink/15 dark:bg-white/15'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-shd-1 transition-transform ${
                    t.dark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Accent Palette Tweak */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Paleta de Colores</span>
              <div className="flex gap-1.5">
                {palettesList.map((palette, idx) => {
                  const [hero, sub, light] = palette;
                  const isSelected = JSON.stringify(t.palette) === JSON.stringify(palette);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setTweak('palette', palette)}
                      className={`flex-1 aspect-square rounded-md overflow-hidden border relative hover:scale-105 active:scale-95 transition-all ${
                        isSelected 
                          ? 'border-ink dark:border-white ring-2 ring-accent' 
                          : 'border-ink/10 dark:border-white/10'
                      }`}
                      style={{ background: hero }}
                      title={`Paleta ${idx + 1}`}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-1/2 flex">
                        <div className="flex-1" style={{ background: sub }} />
                        <div className="flex-1" style={{ background: light }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Headline Tweak */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Headline del Hero</span>
              <div className="flex bg-deep-light/40 dark:bg-deep-dark/40 p-0.5 rounded-lg border border-ink/5 dark:border-white/5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setTweak('headlineIdx', idx)}
                    className={`flex-1 py-1 rounded font-bold text-[10px] ${
                      t.headlineIdx === idx 
                        ? 'bg-elev-light dark:bg-elev-dark border border-ink/10 dark:border-white/10 text-ink dark:text-ink-dark' 
                        : 'text-ink-3 dark:text-ink-4 hover:text-ink dark:hover:text-ink-dark'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Jumping Screen Tweak */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Saltar a Pantalla</span>
              <select
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-ink/15 dark:border-white/15 bg-elev-light dark:bg-elev-dark text-[11.5px] outline-none text-ink dark:text-ink-dark"
              >
                <option value="hero">Hero / Landing</option>
                <option value="input">AI Input</option>
                <option value="parsing">Interpretando...</option>
                <option value="criteria">Criterios Detectados</option>
                <option value="calculating">Calculando...</option>
                <option value="result">Resultado</option>
                <option value="share">Share Card</option>
              </select>
            </div>

            {/* OpenAI API Key Settings Tweak */}
            <div className="flex flex-col gap-2 pt-2.5 border-t border-ink/10 dark:border-white/10">
              <div className="flex justify-between items-center select-none">
                <span className="font-semibold">OpenAI API Key</span>
                {apiKey && (
                  <span className="text-[9px] font-bold text-pos uppercase">Activa</span>
                )}
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full h-8 px-2.5 rounded border border-ink/15 dark:border-white/15 bg-elev-light dark:bg-elev-dark text-[11px] outline-none text-ink dark:text-ink-dark placeholder-ink-4 dark:placeholder-ink-3 font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default TweaksPanel;
