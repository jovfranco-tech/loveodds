import React from 'react';
import { LoIcon } from './Icons';

interface HeroSectionProps {
  onStart: () => void;
  onExample: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onExample }) => {
  return (
    <div className="flex flex-col gap-6 py-6 px-6 lo-fade-in">
      {/* Editorial Category Tag */}
      <div className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 flex items-center gap-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-accent-2 animate-pulse" />
        Análisis Demográfico Electoral · México
      </div>

      {/* Main Headline */}
      <h1 className="font-display text-5xl sm:text-6xl font-normal leading-[0.94] tracking-[-0.02em] text-ink-light dark:text-ink-dark">
        ¿Qué tan raro<br />
        es tu estándar<br />
        <i className="font-serif italic font-normal text-accent dark:text-accent-3">romántico?</i>
      </h1>

      {/* Subtitle */}
      <p className="font-ui text-[15px] sm:text-base leading-[1.45] text-ink-2 dark:text-ink-3 max-w-sm">
        Convierte tus preferencias de pareja en un reality check estadístico con microdatos del Censo, ENIGH, ENOE y ENSANUT de México.
      </p>

      {/* Mock Pre-rendered Preview Card */}
      <div className="lo-card relative overflow-hidden p-6 rounded-xl bg-elev-light dark:bg-elev-dark border border-ink/5 dark:border-ink-dark/5 shadow-shd-1 select-none">
        <div className="lo-grain" />
        <div className="relative flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
              Resultado · Demo
            </span>
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 dark:text-ink-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pos animate-pulse" />
              alta confianza
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-4 mt-2">
            <div>
              <div className="font-display text-6xl leading-[0.9] tracking-[-0.03em] font-normal text-ink dark:text-ink-dark">
                0.8<span className="text-2xl text-ink-3 dark:text-ink-4 ml-1">%</span>
              </div>
              <div className="text-[12px] text-ink-3 dark:text-ink-4 mt-1 font-mono tracking-tight">
                ≈ 8 de cada 1,000 adultos en CDMX
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] tracking-tight bg-accent/8 dark:bg-accent-3/8 text-accent dark:text-accent-3 border border-accent/15 dark:border-accent-3/15 font-medium select-none">
              aguja en un pajar
            </div>
          </div>

          {/* Micro Funnel Bars */}
          <div className="flex flex-col gap-2 mt-2">
            {[
              { l: "Adultos CDMX", w: "100%", active: false },
              { l: "30–35 años", w: "72%", active: false },
              { l: "Soltero, sin hijos", w: "30%", active: false },
              { l: "Ingreso ≥ $80k MXN", w: "8%", active: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-[10px] text-ink-3 dark:text-ink-4 font-mono tracking-tight truncate">
                  {s.l}
                </div>
                <div className="flex-1 h-1.5 bg-deep-light dark:bg-deep-dark rounded-full overflow-hidden">
                  <div
                    style={{ width: s.w }}
                    className={`h-full rounded-full ${s.active ? 'bg-accent dark:bg-accent-2' : 'bg-ink/80 dark:bg-ink-dark/85'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[13px] leading-relaxed text-ink-2 dark:text-ink-3 font-serif italic mt-2 border-t border-ink/5 dark:border-ink-dark/5 pt-2">
            “Tu búsqueda no es imposible — solo es estadísticamente exigente.”
          </p>
        </div>
      </div>

      {/* Primary and Secondary CTA Buttons */}
      <div className="flex flex-col gap-2.5 mt-2">
        <button
          onClick={onStart}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-md font-semibold text-[15px] bg-ink dark:bg-ink-dark text-bg-light dark:text-bg-dark active:scale-[0.985] hover:opacity-90 transition-all select-none"
        >
          Calcular mi probabilidad
          <LoIcon name="arrow-right" size={16} />
        </button>
        <button
          onClick={onExample}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-md font-semibold text-[15px] border border-ink/15 dark:border-ink-dark/15 text-ink-2 dark:text-ink-3 bg-transparent active:scale-[0.985] hover:bg-ink/5 dark:hover:bg-ink-dark/5 transition-all select-none"
        >
          Ver un ejemplo rápido
        </button>
      </div>

      {/* Value Propositions */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
          <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Cómo funciona</span>
          <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        </div>

        <div className="flex flex-col gap-5">
          {[
            { k: "01", t: "Análisis en lenguaje natural", d: "Escribe libremente las cualidades demográficas que buscas y nuestra IA las estructurará." },
            { k: "02", t: "Datos públicos integrados", d: "Estimación calibrada con microdatos oficiales de INEGI Censo, ENIGH, ENOE y ENSANUT." },
            { k: "03", t: "Enfoque ético y serio", d: "Medimos la rareza matemática agregada. Nunca juzgamos tu valor humano ni compatibilidad sentimental." },
          ].map(it => (
            <div key={it.k} className="flex gap-4">
              <div className="font-mono text-[11px] text-ink-3 dark:text-ink-4 tracking-wider w-6 pt-1 select-none">
                {it.k}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="font-display text-xl text-ink dark:text-ink-dark leading-tight font-normal">
                  {it.t}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
                  {it.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethics Disclaimer Standalone Callout */}
      <div className="mt-6 p-4 rounded-lg border border-dashed border-ink/20 dark:border-ink-dark/20 bg-transparent flex gap-3.5 items-start">
        <LoIcon name="lock" size={18} className="text-ink-3 dark:text-ink-4 flex-shrink-0 mt-0.5" />
        <div className="text-[12px] leading-[1.5] text-ink-2 dark:text-ink-3 font-ui">
          🔒 <b className="text-ink dark:text-ink-dark">Compromiso ético:</b> LoveOdds MX es una herramienta con fines educativos que estima frecuencias estadísticas. Tus consultas son 100% privadas, se procesan únicamente en tu navegador y no se asocian con tu identidad.
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
