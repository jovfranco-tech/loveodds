import React, { useState } from 'react';
import { Criteria } from '../types';
import { LoIcon } from './Icons';
import { loFmtMoney } from '../lib/estimator';

interface ParsedCriteriaPanelProps {
  criteria: Criteria;
  setCriteria: (c: Criteria) => void;
}

export const ParsedCriteriaPanel: React.FC<ParsedCriteriaPanelProps> = ({ criteria, setCriteria }) => {
  const c = criteria;
  const updateCriteria = (patch: Partial<Criteria>) => setCriteria({ ...c, ...patch });

  const items = [
    {
      k: "Busco",
      v: c.busca,
      icon: "user",
      pick: ["Hombre", "Mujer", "Persona"],
      set: (v: string) => updateCriteria({ busca: v as 'Hombre' | 'Mujer' | 'Persona' })
    },
    {
      k: "Ubicación",
      v: c.ubicacion,
      icon: "pin",
      pick: ["CDMX", "ZMVM", "Nacional"],
      set: (v: string) => updateCriteria({ ubicacion: v as 'CDMX' | 'ZMVM' | 'Nacional' })
    },
    {
      k: "Edad",
      v: c.edadMin === c.edadMax ? `${c.edadMin} años` : `${c.edadMin}–${c.edadMax} años`,
      icon: "user",
      pick: ["25–35", "30–35", "32–38", "25–40"],
      set: (v: string) => {
        const [a, b] = v.split("–").map(n => parseInt(n, 10));
        updateCriteria({ edadMin: a, edadMax: b });
      }
    },
    {
      k: "Estado Civil",
      v: c.estado || "Cualquiera",
      icon: "heart-line",
      pick: [
        c.busca === 'Mujer' ? "Soltera" : "Soltero",
        c.busca === 'Mujer' ? "Soltera+Divorciada" : "Soltero+Divorciado",
        "Cualquiera"
      ],
      set: (v: string) => updateCriteria({ estado: v === "Cualquiera" ? null : v })
    },
    {
      k: "Hijos",
      v: c.hijos || "Sin filtro",
      icon: "user",
      pick: ["Sin hijos", "Con hijos", "Sin filtro"],
      set: (v: string) => updateCriteria({ hijos: v === "Sin filtro" ? null : v as 'Sin hijos' | 'Con hijos' })
    },
    {
      k: "Estatura Mínima",
      v: c.estaturaMin ? `${c.estaturaMin.toFixed(2)} m` : "Sin filtro",
      icon: "ruler",
      pick: ["1.70", "1.75", "1.80", "Sin filtro"],
      set: (v: string) => updateCriteria({ estaturaMin: v === "Sin filtro" ? null : parseFloat(v) })
    },
    {
      k: "Ingreso Mensual Mínimo",
      v: c.ingresoMin ? `${loFmtMoney(c.ingresoMin)}` : "Sin filtro",
      icon: "wallet",
      pick: ["$30k", "$50k", "$80k", "$100k", "Sin filtro"],
      set: (v: string) => {
        if (v === "Sin filtro") {
          updateCriteria({ ingresoMin: null });
        } else {
          const val = parseInt(v.replace(/[^\d]/g, ""), 10) * 1000;
          updateCriteria({ ingresoMin: val });
        }
      }
    },
    {
      k: "Nacionalidad / Origen",
      v: c.nacionalidad || "Sin filtro",
      icon: "globe",
      pick: ["Sin filtro", "México", "Colombia", "Venezuela", "España", "Argentina"],
      set: (v: string) => updateCriteria({ nacionalidad: v === "Sin filtro" ? null : v })
    },
    {
      k: "Escolaridad Mínima",
      v: c.escolaridad || "Sin filtro",
      icon: "edit",
      pick: ["Sin filtro", "Bachillerato+", "Licenciatura+", "Posgrado+"],
      set: (v: string) => updateCriteria({ escolaridad: v === "Sin filtro" ? null : v as 'Bachillerato+' | 'Licenciatura+' | 'Posgrado+' })
    },
    {
      k: "Estilo de Vida y Hábitos",
      v: c.estiloVida || "Sin filtro",
      icon: "heart-line",
      pick: ["Sin filtro", "Fitness", "Deportista"],
      set: (v: string) => updateCriteria({ estiloVida: v === "Sin filtro" ? null : v as 'Fitness' | 'Deportista' })
    },
    {
      k: "Complexión / Peso",
      v: c.complexion || "Sin filtro",
      icon: "user",
      pick: ["Sin filtro", "Delgada/Normal", "Atlética", "Robusta"],
      set: (v: string) => updateCriteria({ complexion: v === "Sin filtro" ? null : v as 'Delgada/Normal' | 'Atlética' | 'Robusta' })
    },
  ];

  return (
    <div className="flex flex-col gap-5 py-4 px-6 lo-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl font-normal leading-tight text-ink dark:text-ink-dark">
          Esto fue lo que <i className="font-serif italic font-normal text-accent dark:text-accent-3">entendí</i>.
        </h2>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Los siguientes criterios fueron interpretados por IA simulada. Toca cualquiera para ajustarlo o refinarlo antes de calcular.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <EditableCriterion key={i} item={it} />
        ))}
      </div>

      <div className="p-4 rounded-lg bg-deep-light/40 dark:bg-deep-dark/40 border border-ink/5 dark:border-ink-dark/5 flex gap-3 items-start select-none">
        <LoIcon name="info" size={16} className="text-ink-3 dark:text-ink-4 mt-0.5" />
        <div className="text-[12px] leading-relaxed text-ink-2 dark:text-ink-3">
          La interpretación por lenguaje natural puede omitir matices abstractos (“que sea divertido”). Ajusta los valores para alinearse a tus preferencias duras.
        </div>
      </div>
    </div>
  );
};

interface EditableCriterionProps {
  item: {
    k: string;
    v: string;
    icon: string;
    pick: string[];
    set: (val: string) => void;
  };
}

const EditableCriterion: React.FC<EditableCriterionProps> = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="p-4 rounded-md border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex flex-col gap-3 transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:border-accent/40 dark:hover:border-accent-2/40 hover:shadow-sm active:scale-[0.995]"
      onClick={() => setOpen(!open)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}

    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <LoIcon name={item.icon} size={16} className="text-ink-3 dark:text-ink-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
              {item.k}
            </div>
            <div className="text-[15.5px] font-semibold text-ink dark:text-ink-dark truncate mt-0.5">
              {item.v}
            </div>
          </div>
        </div>

        <div className="text-ink-3 dark:text-ink-4 flex-shrink-0">
          <LoIcon name="edit" size={14} />
        </div>
      </div>

      {open && (
        <div 
          className="flex flex-wrap gap-2 pt-3 border-t border-ink/5 dark:border-ink-dark/5"
          onClick={(e) => e.stopPropagation()}
        >
          {item.pick.map((p) => (
            <button
              key={p}
              onClick={() => {
                item.set(p);
                setOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                item.v === p 
                  ? 'bg-ink text-bg-light dark:bg-ink-dark dark:text-bg-dark border border-ink dark:border-ink-dark' 
                  : 'bg-elev-light dark:bg-elev-dark border border-ink/10 dark:border-ink-dark/10 text-ink-2 dark:text-ink-3 hover:bg-ink/5 dark:hover:bg-ink-dark/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default ParsedCriteriaPanel;
