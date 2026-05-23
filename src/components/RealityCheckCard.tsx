import React from 'react';
import { EstimationResult } from '../types';
import { LoIcon } from './Icons';

interface RealityCheckCardProps {
  result: EstimationResult;
}

export const RealityCheckCard: React.FC<RealityCheckCardProps> = ({ result }) => {
  const check = result.realityCheck;

  return (
    <div className="flex flex-col gap-4 py-4 px-6 lo-fade-in">
      <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Reality Check</span>
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      {/* Main card */}
      <div className="p-6 rounded-xl border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark shadow-shd-1 relative">
        <div className="flex items-center gap-2.5 mb-4 select-none">
          <span className="w-6.5 h-6.5 rounded-full bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark flex items-center justify-center">
            <LoIcon name="sparkle" size={13} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-ink dark:text-ink-dark">
              Analista AI LoveOdds
            </div>
            <div className="text-[10px] text-ink-3 dark:text-ink-4 font-mono tracking-tight uppercase">
              Síntesis demográfica · México
            </div>
          </div>
        </div>

        {/* Headline display */}
        <h4 className="font-display text-2xl font-normal leading-tight text-ink dark:text-ink-dark mb-3 tracking-tight">
          {check.headline}
        </h4>

        {/* Body detail */}
        <p className="text-[14px] leading-relaxed text-ink-2 dark:text-ink-3 mb-5">
          {check.detail}
        </p>

        {/* KV Pairs table */}
        <div className="flex flex-col border-t border-ink/5 dark:border-ink-dark/5">
          {check.points.map((p, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-ink/5 dark:border-ink-dark/5">
              <span className="font-mono text-[10px] tracking-wide text-ink-3 dark:text-ink-4 uppercase">
                {p.k}
              </span>
              <span className="text-[13.5px] font-semibold text-ink dark:text-ink-dark text-right">
                {p.v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical warning card */}
      <div className="p-4 rounded-lg border border-dashed border-ink/20 dark:border-ink-dark/20 bg-transparent flex gap-3 items-start select-none">
        <LoIcon name="info" size={16} className="text-ink-3 dark:text-ink-4 flex-shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed text-ink-2 dark:text-ink-3">
          <b className="text-ink dark:text-ink-dark">Lo que NO se puede concluir:</b> Este reporte mide únicamente la rareza agregada de criterios. No predice compatibilidad sentimental, no mide el valor intrínseco de un ser humano, ni afirma que una persona ideal para ti sea inalcanzable. El amor real trasciende la estadística.
        </div>
      </div>
    </div>
  );
};
export default RealityCheckCard;
