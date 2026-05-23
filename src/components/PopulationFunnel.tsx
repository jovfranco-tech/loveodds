import React, { useEffect, useState } from 'react';
import { EstimationResult } from '../types';
import { loFmtNum } from '../lib/estimator';
import { LoIcon } from './Icons';

interface PopulationFunnelProps {
  result: EstimationResult;
}

const getStepIcon = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("universo") || l.includes("personas")) return "globe";
  if (l.includes("busca") || l.includes("edad")) return "user";
  if (l.includes("ubicación") || l.includes("estado") || l.includes("soltero") || l.includes("soltera") || l.includes("divorciado") || l.includes("divorciada")) return "pin";
  if (l.includes("hijos")) return "user";
  if (l.includes("estatura") || l.includes("altura")) return "ruler";
  if (l.includes("ingreso") || l.includes("ingresos")) return "wallet";
  if (l.includes("nacionalidad") || l.includes("origen")) return "globe";
  if (l.includes("escolaridad") || l.includes("educación")) return "edit";
  if (l.includes("hábitos") || l.includes("estilo de vida") || l.includes("fitness") || l.includes("deporte")) return "heart-line";
  if (l.includes("complexión") || l.includes("peso")) return "sparkle";
  return "sparkle";
};

export const PopulationFunnel: React.FC<PopulationFunnelProps> = ({ result }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const max = result.steps[0].n;

  return (
    <div className="flex flex-col gap-4 py-4 px-6 lo-fade-in">
      <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Reducción del universo</span>
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-normal leading-tight text-ink dark:text-ink-dark">
          De {loFmtNum(result.base)} <i className="font-serif italic font-normal text-ink-3 dark:text-ink-4">a</i> {loFmtNum(result.finalN)} personas.
        </h3>
        <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Cada filtro demográfico se aplica de manera acumulativa sobre el resultado anterior. Las cifras representan estimaciones de magnitudes agregadas.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {result.steps.map((step, idx) => {
          const isTerm = !!step.terminal;
          const isFirst = idx === 0;
          
          // Width based on proportions
          const barWidth = mounted ? Math.max(2, (step.n / max) * 100) : 100;

          return (
            <div key={idx} className="flex flex-col gap-1">
              {/* Row description */}
              <div className="flex justify-between items-baseline gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-[9px] tracking-wide text-ink-3 dark:text-ink-4">
                    {String(idx).padStart(2, '0')}
                  </span>
                  <LoIcon name={getStepIcon(step.label)} size={12} className="text-ink-3 dark:text-ink-4 shrink-0" />
                  <span className="text-[13.5px] font-semibold text-ink dark:text-ink-dark truncate">
                    {step.label}
                  </span>
                </div>
                <span className={`font-mono text-[13px] font-bold ${isTerm ? 'text-accent dark:text-accent-3' : 'text-ink dark:text-ink-dark'}`}>
                  {loFmtNum(step.n)}
                </span>
              </div>

              {/* Proportional horizontal bar */}
              <div className={`h-[6px] rounded-full bg-deep-light dark:bg-deep-dark overflow-hidden relative ${isTerm ? 'h-[8px]' : ''}`}>
                <div
                  style={{ 
                    width: `${barWidth}%`,
                    transitionDelay: mounted ? `${idx * 120}ms` : '0ms'
                  }}
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isTerm 
                      ? 'bg-accent dark:bg-accent-2' 
                      : isFirst 
                      ? 'bg-ink dark:bg-ink-dark' 
                      : 'bg-ink/80 dark:bg-ink-dark/85'
                  }`}
                />
              </div>

              {/* Sub-label and kept percentage */}
              {step.sub && !isTerm && (
                <div className="flex justify-between text-[9.5px] font-mono tracking-tight text-ink-4 dark:text-ink-3">
                  <span className="uppercase">{step.sub}</span>
                  {step.kept != null && idx > 0 && (
                    <span className="font-semibold text-accent/80 dark:text-accent-3/80">
                      ×{step.kept < 0.01 ? step.kept.toFixed(3) : step.kept.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PopulationFunnel;
