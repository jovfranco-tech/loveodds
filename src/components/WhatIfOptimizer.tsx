import React from 'react';
import { Scenario, Criteria } from '../types';
import { LoIcon } from './Icons';

interface WhatIfOptimizerProps {
  scenarios: Scenario[];
  onApply: (mod: Partial<Criteria>) => void;
}

export const WhatIfOptimizer: React.FC<WhatIfOptimizerProps> = ({ scenarios, onApply }) => {
  return (
    <div className="flex flex-col gap-4 py-4 px-6 lo-fade-in">
      <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Escenarios alternativos</span>
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-normal leading-tight text-ink dark:text-ink-dark">
          Ajustes que <i className="font-serif italic font-normal text-accent dark:text-accent-3">amplían</i> tu universo.
        </h3>
        <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          No te aconsejamos rebajar tus expectativas. Estas simulaciones ilustran cómo cambios marginales en la rigidez de tus filtros aumentan tus probabilidades.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {scenarios.length === 0 ? (
          <div className="p-5 rounded-lg border border-dashed border-ink/20 dark:border-ink-dark/20 text-center select-none bg-elev-light dark:bg-elev-dark">
            <p className="text-[13.5px] text-ink-2 dark:text-ink-3">
              Tus filtros actuales ya son muy amplios. No encontramos sugerencias obvias de multiplicación demográfica.
            </p>
          </div>
        ) : (
          scenarios.map((sc, i) => (
            <ScenarioCard key={i} scenario={sc} onApply={() => onApply(sc.mod)} />
          ))

        )}
      </div>
    </div>
  );
};

interface ScenarioCardProps {
  scenario: Scenario;
  onApply: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onApply }) => {
  const s = scenario;
  const levelColor = s.level === "alto" ? "text-accent dark:text-accent-2" : s.level === "medio" ? "text-warn" : "text-ink-3 dark:text-ink-4";
  const bgLevelColor = s.level === "alto" ? "bg-accent dark:bg-accent-2" : s.level === "medio" ? "bg-warn" : "bg-ink-3 dark:bg-ink-4";
  const bars = s.level === "alto" ? 3 : s.level === "medio" ? 2 : 1;

  return (
    <div className="p-4 rounded-xl border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex flex-col gap-4 shadow-shd-1">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14.5px] font-bold text-ink dark:text-ink-dark leading-snug">
            {s.label}
          </h4>
          <p className="text-[12px] text-ink-3 dark:text-ink-4 leading-normal mt-1">
            {s.exp}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-display font-normal text-3xl text-ink dark:text-ink-dark leading-none tracking-tight">
            ×{s.mult >= 10 ? s.mult.toFixed(0) : s.mult.toFixed(1)}
          </div>
          <div className={`font-mono text-[9px] tracking-[0.14em] uppercase font-bold mt-1.5 ${levelColor}`}>
            impacto {s.level}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-ink/5 dark:border-ink-dark/5">
        {/* Bars visual indicators */}
        <div className="flex gap-1 items-center select-none" aria-label={`Impacto nivel ${s.level}`}>
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-1 rounded-full ${idx < bars ? bgLevelColor : 'bg-deep-light dark:bg-deep-dark'}`}
            />
          ))}
        </div>

        {/* Simulate button */}
        <button
          onClick={onApply}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-transparent border border-ink/15 dark:border-ink-dark/15 text-[12px] font-semibold text-ink-2 dark:text-ink-3 hover:bg-ink/5 dark:hover:bg-ink-dark/5 transition-all select-none"
        >
          Simular ajuste
          <LoIcon name="rotate" size={12} />
        </button>
      </div>
    </div>
  );
};
export default WhatIfOptimizer;
