import React, { useState } from 'react';
import { LoIcon } from './Icons';

interface AIQueryInputProps {
  onSubmit: (text: string) => void;
  onExample: (prompt: string, presetName: string) => void;
}

export const AIQueryInput: React.FC<AIQueryInputProps> = ({ onSubmit, onExample }) => {
  const [text, setText] = useState("");

  const examples = [
    {
      label: "Hombre 32 · 1.80 m · $100k",
      prompt: "Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y que gane 100,000 MXN mensuales.",
      preset: "A"
    },
    {
      label: "Mujer colombiana 28 · CDMX",
      prompt: "Busco una mujer colombiana de 28 años en CDMX, soltera y sin hijos.",
      preset: "B"
    },
    {
      label: "Profesionista 30–35 · sin hijos",
      prompt: "Busco una persona profesionista, entre 30 y 35 años, soltera, sin hijos, graduada de universidad y que viva en Monterrey.",
      preset: "A"
    }
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 300) {
      setText(e.target.value);
    }
  };

  const handleInterpret = () => {
    if (text.trim().length >= 10) {
      onSubmit(text);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 px-6 lo-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl font-normal leading-tight text-ink dark:text-ink-dark">
          Cuéntale al <i className="font-serif italic font-normal text-accent dark:text-accent-3">analista</i> qué buscas.
        </h2>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Escribe tus preferencias en lenguaje natural. El analista demográfico las interpretará al instante para calcular la rareza estadística de tu pareja ideal.
        </p>
      </div>

      {/* Modern AI Input Card */}
      <div className="flex flex-col gap-3 p-5 rounded-lg border border-ink/15 dark:border-ink-dark/15 bg-elev-light dark:bg-elev-dark shadow-shd-1 relative z-10">
        <div className="flex items-center gap-2 mb-1 select-none">
          <span className="w-5.5 h-5.5 rounded-full bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark flex items-center justify-center">
            <LoIcon name="sparkle" size={12} />
          </span>
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
            Analista AI LoveOdds
          </span>
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y que gane $100,000 MXN al mes..."
          rows={5}
          className="w-full border-0 outline-none resize-none bg-transparent font-display text-[22px] leading-[1.3] tracking-[-0.01em] text-ink dark:text-ink-dark placeholder-ink-4 dark:placeholder-ink-3 p-0"
        />

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-ink/5 dark:border-ink-dark/5">
          <span className="font-mono text-[10px] tracking-wide text-ink-3 dark:text-ink-4 select-none">
            {text.length} / 300 caracteres
          </span>
          <button
            onClick={handleInterpret}
            disabled={text.trim().length < 10}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-[13.5px] transition-all select-none ${
              text.trim().length >= 10
                ? 'bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-ink/5 dark:bg-ink-dark/5 text-ink-3 dark:text-ink-4 cursor-not-allowed'
            }`}
          >
            Interpretar búsqueda
            <LoIcon name="sparkle" size={13} />
          </button>
        </div>
      </div>

      {/* Examples Chips Section */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 select-none">
          Ejemplos rápidos
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setText(ex.prompt);
                onExample(ex.prompt, ex.preset);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-elev-light dark:bg-elev-dark border border-ink/10 dark:border-ink-dark/10 text-[12.5px] font-semibold text-ink-2 dark:text-ink-3 hover:bg-ink/5 dark:hover:bg-ink-dark/5 active:scale-95 transition-all"
            >
              <span className="font-mono text-[10px] text-accent dark:text-accent-3 font-bold">
                0{i + 1}
              </span>
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detections Capabilities list */}
      <div className="mt-2 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4 select-none">
          <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">El analista detecta</span>
          <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "pin", label: "Ubicación geográfica" },
            { icon: "user", label: "Edad y género" },
            { icon: "heart-line", label: "Estado civil conyugal" },
            { icon: "wallet", label: "Ingreso mensual" },
            { icon: "ruler", label: "Estatura antropométrica" },
            { icon: "globe", label: "País de origen" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-deep-light/40 dark:bg-deep-dark/40 border border-ink/5 dark:border-ink-dark/5 select-none"
            >
              <LoIcon name={item.icon} size={14} className="text-ink-3 dark:text-ink-4" />
              <span className="text-[13px] text-ink-2 dark:text-ink-3 truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AIQueryInput;
