import React from 'react';
import { LoIcon } from './Icons';

interface AppHeaderProps {
  onBack?: () => void;
  onRestart?: () => void;
  title?: string;
  accessory?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onBack,
  title,
  accessory,
}) => {
  return (
    <header className="flex items-center justify-between px-6 pt-12 pb-3 relative z-10 w-full select-none">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex items-center justify-center text-ink-2 dark:text-ink-3 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Regresar"
        >
          <LoIcon name="chevron-left" size={16} />
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 font-display text-[19px] tracking-tight text-ink-light dark:text-ink-dark">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent dark:bg-accent-2 translate-y-[-1px]" />
          <span>
            Love<em className="font-serif italic font-normal">Odds</em>
          </span>
          <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-ink-3 dark:text-ink-4 ml-0.5 px-1.5 py-0.5 border border-ink/10 dark:border-ink-dark/10 rounded">
            MX
          </span>
        </div>
      )}

      {title && (
        <div className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
          {title}
        </div>
      )}

      {accessory || (
        <div className="w-9 h-9 rounded-full border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex items-center justify-center text-ink-2 dark:text-ink-3">
          <LoIcon name="dot-grid" size={14} />
        </div>
      )}
    </header>
  );
};
export default AppHeader;
