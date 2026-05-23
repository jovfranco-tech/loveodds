import React from 'react';
import { LO_SOURCES } from '../data/mockStats';


export const StatisticalSourcesPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 py-4 px-6 lo-fade-in">
      <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Base estadística</span>
        <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-normal leading-tight text-ink dark:text-ink-dark">
          De dónde <i className="font-serif italic font-normal text-accent dark:text-accent-3">vienen</i> los datos.
        </h3>
        <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Cada filtro de búsqueda se ancla en metodologías y microdatos públicos de México.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {LO_SOURCES.map((source) => {
          const isDemo = source.status === "demo";
          const statusText = isDemo ? "Datos Demo / Simulación" : "Listo para Integrar";
          const badgeClass = isDemo 
            ? "border-warn/25 bg-warn/5 text-warn" 
            : "border-pos/25 bg-pos/5 text-pos";

          return (
            <div key={source.id} className="p-4 rounded-xl border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex flex-col gap-3.5 shadow-shd-1">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13.5px] font-bold text-ink dark:text-ink-dark leading-snug">
                    {source.name}
                  </h4>
                  <p className="text-[12px] text-ink-3 dark:text-ink-4 leading-normal mt-1">
                    {source.aporta}
                  </p>
                </div>
                <span className={`inline-block px-2.5 py-1 border rounded-full font-mono text-[9px] font-semibold tracking-tight uppercase flex-shrink-0 select-none ${badgeClass}`}>
                  {statusText}
                </span>
              </div>

              {/* Limitation callout */}
              {source.limitation && (
                <div className="text-[11px] leading-relaxed text-ink-3 dark:text-ink-3 italic border-l-2 border-accent/20 dark:border-accent-3/20 pl-2">
                  <span className="font-semibold text-ink-2 dark:text-ink-4 font-mono not-italic text-[9.5px]">LIMITANTE:</span> {source.limitation}
                </div>
              )}

              {/* Meter confidence indicator */}
              <div className="flex items-center justify-between gap-4 mt-1">
                <span className="font-mono text-[10px] text-ink-3 dark:text-ink-4 tracking-wider select-none uppercase">
                  Año de publicación: {source.year}
                </span>

                <div className="flex items-center gap-2.5 flex-1 max-w-[140px] select-none" aria-label={`Metodología con certeza ${source.confianza}%`}>
                  <div className="flex-1 h-1 bg-deep-light dark:bg-deep-dark rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${source.confianza}%` }}
                      className="h-full bg-ink dark:bg-ink-dark rounded-full" 
                    />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-ink-2 dark:text-ink-3">
                    {source.confianza}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-deep-light/40 dark:bg-deep-dark/40 border border-ink/5 dark:border-ink-dark/5 select-none">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 mb-1">
          Nota metodológica
        </div>
        <p className="text-[12px] leading-relaxed text-ink-2 dark:text-ink-3">
          Este MVP opera con modelos de distribución calibrados artificialmente a partir de los cubos y tabulados dinámicos publicados de las encuestas nacionales. Las integraciones de bases cruzadas reales requieren técnicas estadísticas de copula o microdatos crudos directos.
        </p>
      </div>
    </div>
  );
};
export default StatisticalSourcesPanel;
