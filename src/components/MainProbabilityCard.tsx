import React from 'react';
import { EstimationResult } from '../types';


interface MainProbabilityCardProps {
  result: EstimationResult;
}

export const MainProbabilityCard: React.FC<MainProbabilityCardProps> = ({ result }) => {
  const pct = result.pct;
  const tier = result.rarityLevel;
  const most = result.mostRestrictiveFilter;

  // Format percent digits based on scale
  const formattedPct = pct >= 1 ? pct.toFixed(1)
                      : pct >= 0.1 ? pct.toFixed(2)
                      : pct >= 0.01 ? pct.toFixed(3)
                      : pct.toFixed(4);

  // Human ratios equivalence text
  const humanRatio = pct >= 1 ? `${Math.round(pct)} de cada 100`
                   : pct >= 0.1 ? `${Math.round(pct * 10)} de cada 1,000`
                   : pct >= 0.01 ? `${Math.round(pct * 100)} de cada 10,000`
                   : `${Math.round(pct * 1000)} de cada 100,000`;
  // Scale levels for rarity visual checklist
  const tierRank = tier.rank; // 1 to 6
  const tierTiers = ["Común", "Selectivo", "Muy Selectivo", "Estad. Raro", "Aguja", "Unicornio"];

  // Dynamic font sizing for long percentage numbers
  const numLen = formattedPct.length;
  const fontSizeClass = numLen > 7 ? 'text-[64px]'
                      : numLen > 5 ? 'text-[82px]'
                      : numLen > 4 ? 'text-[96px]'
                      : 'text-[114px]';
  const percentTranslateClass = numLen > 7 ? 'translate-y-[-8px]'
                              : numLen > 5 ? 'translate-y-[-12px]'
                              : 'translate-y-[-18px]';

  return (
    <div className="lo-card relative overflow-hidden p-6 rounded-xl bg-elev-light dark:bg-elev-dark border border-ink/10 dark:border-ink-dark/10 shadow-shd-2 select-none lo-fade-in">
      <div className="lo-grain animate-pulse" />
      <div className="relative flex flex-col gap-4">
        {/* Card Header metadata */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
            Probabilidad estimada
          </span>
          <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-3 dark:text-ink-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pos animate-pulse" />
            alta confianza
          </div>
        </div>

        {/* Large Numeral */}
        <div className="flex items-baseline gap-1.5 my-1">
          <span className={`font-display font-normal tracking-[-0.045em] text-ink dark:text-ink-dark ${fontSizeClass} leading-[0.85]`}>
            {formattedPct}
          </span>
          <span className={`font-display text-[44px] text-ink-3 dark:text-ink-4 select-none ${percentTranslateClass}`}>
            %
          </span>
        </div>

        {/* Human Equivalences */}
        <div className="text-[14.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Aproximadamente <b className="text-ink dark:text-ink-dark font-mono font-semibold">{humanRatio}</b> personas adultas cumplen con tus criterios en el universo analizado.
          <span className="block text-[12px] text-ink-3 dark:text-ink-4 mt-1 font-mono">
            {Math.round(result.finalN).toLocaleString("es-MX")} personas estimadas en total.
          </span>
        </div>

        {/* Tier scale */}
        <div className="mt-2 pt-3 border-t border-ink/5 dark:border-ink-dark/5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-mono text-[9px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
              Nivel de rareza
            </span>
            <span className="font-display text-lg font-normal italic text-ink dark:text-ink-dark">
              {tier.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {tierTiers.map((t, i) => {
              const active = i + 1 === tierRank;
              const passed = i + 1 <= tierRank;
              return (
                <div
                  key={i}
                  title={t}
                  className={`flex-1 rounded-sm transition-all duration-500 ${
                    active 
                      ? 'h-3.5 bg-accent dark:bg-accent-2' 
                      : passed 
                      ? 'h-1.5 bg-ink dark:bg-ink-dark opacity-90' 
                      : 'h-1.5 bg-deep-light dark:bg-deep-dark'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[9px] font-mono tracking-widest text-ink-3 dark:text-ink-4 uppercase">
            <span>Común</span>
            <span>Unicornio</span>
          </div>
        </div>

        {/* Cita interpretativa */}
        <p className="text-[15.5px] leading-relaxed text-ink-2 dark:text-ink-3 font-serif italic mt-1">
          <span className="text-accent dark:text-accent-3 text-xl font-bold font-mono mr-1">“</span>
          {tier.blurb}
          <span className="text-accent dark:text-accent-3 text-xl font-bold font-mono ml-1">”</span>
        </p>

        {/* Most Restrictive Filter Callout */}
        {most && (
          <div className="mt-2 p-3.5 rounded-lg bg-deep-light/40 dark:bg-deep-dark/40 border border-ink/5 dark:border-ink-dark/5 flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 mb-0.5">
                Filtro más restrictivo
              </div>
              <div className="text-[13px] font-semibold text-ink dark:text-ink-dark truncate">
                {most.label}
              </div>
            </div>
            <div className="font-mono text-[14px] font-bold text-accent dark:text-accent-2">
              −{most.dropPct.toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MainProbabilityCard;
