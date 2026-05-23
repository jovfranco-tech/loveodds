import React from 'react';
import { LoIcon } from './Icons';

export const EthicsDisclaimer: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 py-4 px-6 lo-fade-in select-none">
      <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4">
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Ética y privacidad</span>
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      <div className="p-5 rounded-xl border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex flex-col gap-4 shadow-shd-1">
        <div className="flex gap-3.5 items-start">
          <LoIcon name="lock" size={18} className="text-ink-3 dark:text-ink-4 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-3">
            <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
              LoveOdds MX <b className="text-ink dark:text-ink-dark">no mide el valor</b> intrínseco de un ser humano, no predice compatibilidad afectiva o emocional real, ni recopila datos que identifiquen individualmente a una persona.
            </p>
            <p className="text-[12px] leading-relaxed text-ink-3 dark:text-ink-4">
              Tus consultas se procesan localmente, no se asocian a cuentas personales ni perfiles de redes, y se eliminan inmediatamente de la memoria del navegador al reiniciar o cerrar el flujo de simulación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EthicsDisclaimer;
