import React from 'react';
import { LoIcon } from './Icons';

interface EmptyResultStateProps {
  onRestart: () => void;
}

export const EmptyResultState: React.FC<EmptyResultStateProps> = ({ onRestart }) => {
  return (
    <div className="flex flex-col gap-6 py-12 px-6 lo-fade-in text-center select-none">
      <div className="flex justify-center mb-2">
        <span className="w-12 h-12 rounded-full border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex items-center justify-center text-ink-3 dark:text-ink-4">
          <LoIcon name="info" size={24} />
        </span>
      </div>

      <div className="flex flex-col gap-2 max-w-sm mx-auto">
        <h3 className="font-display text-3xl font-normal leading-tight text-ink dark:text-ink-dark">
          No pude estructurar <i className="font-serif italic font-normal text-accent dark:text-accent-3">criterios</i>.
        </h3>
        <p className="text-[14.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Tu consulta en lenguaje natural no incluyó suficientes filtros demográficos explícitos (como ubicación, edad, ingresos, hijos o estatura) para calibrar el funnel.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4 max-w-xs mx-auto w-full">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-md font-semibold text-[14.5px] bg-ink dark:bg-ink-dark text-bg-light dark:text-bg-dark hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Reescribir búsqueda
          <LoIcon name="rotate" size={14} />
        </button>
      </div>
    </div>
  );
};
export default EmptyResultState;
