export interface Criteria {
  busca: 'Hombre' | 'Mujer' | 'Persona';
  ubicacion: 'CDMX' | 'ZMVM' | 'Nacional';
  edadMin: number;
  edadMax: number;
  estado: string | null; // e.g. 'Soltero' | 'Soltera' | 'Divorciado' | 'Divorciada' | 'Soltero+Divorciado' | 'Soltera+Divorciada' | 'Cualquiera'
  hijos: 'Sin hijos' | 'Con hijos' | null;
  estaturaMin: number | null;
  ingresoMin: number | null;
  nacionalidad: string | null;
  escolaridad: 'Bachillerato+' | 'Licenciatura+' | 'Posgrado+' | null;
  ocupacion: string | null;
  estiloVida: 'Fitness' | 'Deportista' | 'Cualquiera' | null;
}

export interface FunnelStep {
  label: string;
  sub?: string;
  n: number;
  kept: number;
  terminal?: boolean;
}

export interface RarityTier {
  name: string;
  rank: number;
  blurb: string;
}

export interface EstimationResult {
  steps: FunnelStep[];
  pct: number;
  finalN: number;
  base: number;
  rarityLevel: RarityTier;
  mostRestrictiveFilter: { label: string; kept: number; dropPct: number } | null;
  confidenceLevel: 'Alta' | 'Media' | 'Baja' | 'Demo';
  realityCheck: {
    headline: string;
    detail: string;
    points: { k: string; v: string }[];
  };
  whatIfSuggestions: Scenario[];
}

export interface Scenario {
  label: string;
  exp: string;
  mult: number;
  level: 'bajo' | 'medio' | 'alto';
  mod: Partial<Criteria>;
}

export interface StatisticalSource {
  id: string;
  name: string;
  year: string;
  aporta: string;
  confianza: number;
  status: 'demo' | 'ready' | 'live';
  limitation?: string;
}

export interface TweakConfig {
  dark: boolean;
  palette: string[];
  headlineIdx: number;
  showKeyboard: boolean;
  startScreen: string;
}
