import React, { useEffect, useState } from 'react';
import { LoIcon } from './Icons';

interface LoadingStateProps {
  type: 'parsing' | 'calculating';
  queryText?: string;
  hasRealAI?: boolean;
  onDone: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type, queryText, hasRealAI = false, onDone }) => {
  const [stage, setStage] = useState(0);

  const localParsingStages = [
    "Limpiando consulta de búsqueda",
    "Identificando ubicación geográfica",
    "Detectando edad y género objetivo",
    "Mapeando ingreso y estatura",
    "Consultando bases demográficas de fuentes",
  ];

  const realAIParsingStages = [
    "Iniciando conexión cifrada con OpenAI API",
    "Analizando intenciones semánticas con GPT-4o-mini",
    "Calibrando multiplicadores en base a INEGI y ENIGH",
    "Estructurando criterios demográficos cruzados",
    "Redactando Reality Check personalizado e ingenioso",
  ];

  const calculatingStages = [
    "Cargando microdatos · INEGI Censo 2020",
    "Ponderando estatura normal · ENSANUT 2022",
    "Ajustando deciles · ENIGH 2024",
    "Validando residencia legal · CONAPO 2024",
  ];

  const currentStages = type === 'parsing' 
    ? (hasRealAI ? realAIParsingStages : localParsingStages) 
    : calculatingStages;
    
  const tickMs = type === 'parsing' ? (hasRealAI ? 580 : 420) : 350;

  useEffect(() => {
    setStage(0);
    const id = setInterval(() => {
      setStage((s) => {
        if (s + 1 >= currentStages.length) {
          clearInterval(id);
          setTimeout(onDone, 300);
          return s + 1;
        }
        return s + 1;
      });
    }, tickMs);

    return () => clearInterval(id);
  }, [type, hasRealAI]);

  return (
    <div className="flex flex-col gap-8 py-10 px-6 lo-fade-in text-center">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 select-none">
          {type === 'parsing' ? 'Interpretando consulta' : 'Procesando estimación'}
        </span>
      </div>

      {type === 'parsing' && queryText && (
        <div className="p-4 rounded-xl bg-elev-light dark:bg-elev-dark border border-ink/5 dark:border-ink-dark/5 text-left shadow-shd-1 select-none">
          <span className="font-mono text-[9px] tracking-wide text-ink-3 dark:text-ink-4 block mb-1">
            Texto recibido
          </span>
          <p className="font-display text-[17px] font-normal leading-relaxed italic text-ink-2 dark:text-ink-3">
            “{queryText}”
          </p>
        </div>
      )}

      {/* Pulsing rings sparkle element */}
      <div className="flex justify-center my-4 select-none">
        <div className="relative w-28 h-28">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              style={{
                animation: `lo-ring 2.4s ease-out ${idx * 0.7}s infinite`,
              }}
              className="absolute inset-0 rounded-full border border-accent/70 dark:border-accent-2/70 opacity-0"
            />
          ))}
          <div className="absolute inset-9 rounded-full bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark flex items-center justify-center shadow-shd-1">
            <LoIcon name="sparkle" size={18} />
          </div>
        </div>
      </div>

      {/* Progress checkmarks list */}
      <div className="flex flex-col gap-3.5 text-left max-w-sm mx-auto w-full select-none">
        {currentStages.map((s, i) => {
          const finished = i < stage;
          const processing = i === stage;
          
          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                finished || processing ? 'opacity-100' : 'opacity-35'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {finished ? (
                  <LoIcon name="check" size={14} className="text-pos" stroke={2.5} />
                ) : processing ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-accent-2 animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-4 dark:bg-ink-3" />
                )}
              </div>
              <span className={`text-[13.5px] ${finished ? 'text-ink-2 dark:text-ink-3' : processing ? 'text-ink dark:text-ink-dark font-semibold' : 'text-ink-3 dark:text-ink-4'}`}>
                {s}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes lo-ring {
          0% { opacity: 0; transform: scale(.3); }
          20% { opacity: .6; }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
export default LoadingState;
