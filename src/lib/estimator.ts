import { Criteria, FunnelStep, RarityTier, EstimationResult, Scenario } from '../types';
import { generateRealityCheck } from './realityCheck';

export interface AICalibrationResult {
  criteria: Criteria;
  customMultipliers?: {
    edad?: number;
    estado?: number;
    hijos?: number;
    nacionalidad?: number;
    ingreso?: number;
    estatura?: number;
    escolaridad?: number;
  };
  realityCheckHeadline?: string;
  realityCheckDetail?: string;
  customWhatIfs?: Scenario[];
}

export interface CalibrationOverrides {
  basePopulations?: {
    [key: string]: { Mujer: number; Hombre: number; Persona: number };
  };
  maritalStatus?: {
    [key: string]: number;
  };
  children?: {
    "Sin hijos": number;
    "Con hijos": number;
  };
  nationality?: {
    [key: string]: number;
  };
  income?: { limit: number | null; ratio: number }[];
  height?: {
    [key: string]: { mean: number; stdDev: number };
  };
  education?: {
    [key: string]: number;
  };
}

// Standard normal cumulative distribution function
function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function loFmtNum(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 1 : 2).replace(/\.?0+$/, '') + "M";
  if (n >= 1000) return Math.round(n).toLocaleString("es-MX");
  return Math.round(n).toLocaleString("es-MX");
}

export function loFmtMoney(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

export function loComputeFunnel(
  c: Criteria,
  customMultipliers?: AICalibrationResult['customMultipliers'],
  calibrations?: CalibrationOverrides
): { steps: FunnelStep[]; pct: number; finalN: number; base: number } {
  // Base population of adults (18+)
  let base = 0;
  const pMap = calibrations?.basePopulations ?? {
    CDMX: { Mujer: 3980000, Hombre: 3420000, Persona: 7400000 },
    ZMVM: { Mujer: 9400000, Hombre: 8750000, Persona: 18150000 },
    Nacional: { Mujer: 51200000, Hombre: 47800000, Persona: 99000000 }
  };
  const loc = c.ubicacion === 'CDMX' ? 'CDMX' : c.ubicacion === 'ZMVM' ? 'ZMVM' : 'Nacional';
  const gender = c.busca === 'Mujer' ? 'Mujer' : c.busca === 'Hombre' ? 'Hombre' : 'Persona';
  base = pMap[loc]?.[gender] ?? 99000000;

  const steps: FunnelStep[] = [{
    label: "Población base",
    sub: c.ubicacion === "CDMX" ? `Adultos en CDMX · Censo 2020` :
         c.ubicacion === "ZMVM" ? `Adultos en ZMVM · Censo 2020` :
                                   `Adultos a nivel nacional · Censo 2020`,
    n: base,
    kept: 1,
  }];

  let cur = base;

  // 1. Age Filter
  if (c.edadMin != null && c.edadMax != null) {
    const yrs = Math.max(1, c.edadMax - c.edadMin + 1);
    const ratio = customMultipliers?.edad ?? Math.min(0.98, yrs / 47);
    cur = cur * ratio;
    steps.push({
      label: c.edadMin === c.edadMax ? `Edad exacta: ${c.edadMin} años` : `Rango de edad: ${c.edadMin}–${c.edadMax} años`,
      sub: "INEGI · Pirámide Poblacional",
      n: cur,
      kept: ratio,
    });
  }

  // 2. Marital Status
  if (c.estado && c.estado !== 'Cualquiera') {
    let r = 1.0;
    const mStatus = calibrations?.maritalStatus ?? {
      "Soltero": 0.36,
      "Soltera": 0.36,
      "Divorciado": 0.06,
      "Divorciada": 0.06,
      "Soltero+Divorciado": 0.42,
      "Soltera+Divorciada": 0.42
    };
    r = mStatus[c.estado] ?? 1.0;
    const ratio = customMultipliers?.estado ?? r;
    cur = cur * ratio;
    steps.push({
      label: `Estado civil: ${c.estado}`,
      sub: "INEGI · Censo Conyugal",
      n: cur,
      kept: ratio,
    });
  }

  // 3. Children (Sin Hijos)
  if (c.hijos === 'Sin hijos') {
    const r = calibrations?.children?.["Sin hijos"] ?? 0.42;
    const ratio = customMultipliers?.hijos ?? r;
    cur = cur * ratio;
    steps.push({
      label: "Sin hijos en el hogar",
      sub: "INEGI · ENADID 2023",
      n: cur,
      kept: ratio,
    });
  } else if (c.hijos === 'Con hijos') {
    const r = calibrations?.children?.["Con hijos"] ?? 0.58;
    const ratio = customMultipliers?.hijos ?? r;
    cur = cur * ratio;
    steps.push({
      label: "Con hijos en el hogar",
      sub: "INEGI · ENADID 2023",
      n: cur,
      kept: ratio,
    });
  }

  // 4. Nationality / Origin
  if (c.nacionalidad) {
    let r = calibrations?.nationality?.["default"] ?? 0.004;
    const nMap = calibrations?.nationality ?? {
      "EEUU": 0.008,
      "Colombia": 0.004,
      "Argentina": 0.003,
      "Venezuela": 0.005,
      "México": 0.985
    };
    r = nMap[c.nacionalidad] ?? r;
    
    const ratio = customMultipliers?.nacionalidad ?? r;
    cur = cur * ratio;
    steps.push({
      label: `Nacionalidad: ${c.nacionalidad}`,
      sub: "SEGOB · Unidad de Política Migratoria",
      n: cur,
      kept: ratio,
    });
  }

  // 5. Income (ENIGH distribution)
  if (c.ingresoMin != null && c.ingresoMin > 0) {
    let r = 0.004;
    if (calibrations?.income) {
      const match = calibrations.income.find(item => item.limit === null || c.ingresoMin! <= item.limit);
      r = match ? match.ratio : 0.004;
    } else {
      if (c.ingresoMin <= 15000) r = 0.55;
      else if (c.ingresoMin <= 30000) r = 0.28;
      else if (c.ingresoMin <= 50000) r = 0.12;
      else if (c.ingresoMin <= 80000) r = 0.045;
      else if (c.ingresoMin <= 100000) r = 0.022;
      else if (c.ingresoMin <= 150000) r = 0.009;
      else r = 0.004;
    }

    const ratio = customMultipliers?.ingreso ?? r;
    cur = cur * ratio;
    steps.push({
      label: `Ingresos ocupacionales ≥ ${loFmtMoney(c.ingresoMin)} / mes`,
      sub: "INEGI · ENIGH 2024",
      n: cur,
      kept: ratio,
    });
  }

  // 6. Height (ENSANUT CDF)
  if (c.estaturaMin != null && c.estaturaMin > 0) {
    let r = 1.0;
    const hMap = calibrations?.height ?? {
      "Mujer": { mean: 157, stdDev: 6 },
      "Hombre": { mean: 169, stdDev: 7 },
      "Persona": { mean: 163, stdDev: 8 }
    };
    const key = c.busca === 'Mujer' ? 'Mujer' : c.busca === 'Hombre' ? 'Hombre' : 'Persona';
    const params = hMap[key] ?? { mean: 163, stdDev: 8 };
    const z = (c.estaturaMin * 100 - params.mean) / params.stdDev;
    r = Math.max(0.001, 1 - normCdf(z));

    const ratio = customMultipliers?.estatura ?? r;
    cur = cur * ratio;
    steps.push({
      label: `Estatura ≥ ${c.estaturaMin.toFixed(2)} m`,
      sub: "INSP · ENSANUT distribución física",
      n: cur,
      kept: ratio,
    });
  }

  // 7. Education
  if (c.escolaridad) {
    let r = 1.0;
    const eMap = calibrations?.education ?? {
      "Licenciatura+": 0.34,
      "Posgrado+": 0.06,
      "Bachillerato+": 0.70
    };
    r = eMap[c.escolaridad] ?? 1.0;

    const ratio = customMultipliers?.escolaridad ?? r;
    cur = cur * ratio;
    steps.push({
      label: `Escolaridad: ${c.escolaridad}`,
      sub: "INEGI · ENOE 2025",
      n: cur,
      kept: ratio,
    });
  }

  // Final Universo
  steps.push({
    label: "Universo resultante",
    sub: "Adultos que cumplen con todos los criterios",
    n: cur,
    kept: cur / base,
    terminal: true,
  });

  const pct = (cur / base) * 100;
  return { steps, pct, finalN: cur, base };
}

export function loRarityTier(pct: number): RarityTier {
  if (pct >= 20) {
    return { name: "Común", rank: 1, blurb: "Tu búsqueda es amplia y estadísticamente común." };
  } else if (pct >= 10) {
    return { name: "Selectivo", rank: 2, blurb: "Tu búsqueda tiene filtros claros, pero sigue siendo razonablemente amplia." };
  } else if (pct >= 5) {
    return { name: "Muy selectivo", rank: 3, blurb: "Tu estándar ya reduce bastante el universo disponible." };
  } else if (pct >= 1) {
    return { name: "Estadísticamente raro", rank: 4, blurb: "Este perfil existe, pero el universo disponible es pequeño." };
  } else if (pct >= 0.2) {
    return { name: "Aguja en un pajar", rank: 5, blurb: "No es imposible, pero estás buscando una combinación poco común." };
  } else {
    return { name: "Unicornio demográfico", rank: 6, blurb: "La combinación de criterios es extremadamente específica." };
  }
}

export function loMostRestrictive(steps: FunnelStep[]): { label: string; kept: number; dropPct: number } | null {
  const cuts = steps
    .filter((s, i) => i > 0 && !s.terminal && s.kept != null)
    .map(s => ({ label: s.label, kept: s.kept, dropPct: (1 - s.kept) * 100 }))
    .sort((a, b) => a.kept - b.kept);
  return cuts.length > 0 ? cuts[0] : null;
}

export function loScenarios(c: Criteria, calibrations?: CalibrationOverrides): Scenario[] {
  const baseFunnel = loComputeFunnel(c, undefined, calibrations);
  const baseN = baseFunnel.finalN;
  const out: Scenario[] = [];

  const addScenario = (label: string, mod: Partial<Criteria>, exp: string, level: 'bajo' | 'medio' | 'alto') => {
    const patch = { ...c, ...mod };
    const f = loComputeFunnel(patch, undefined, calibrations);
    const mult = f.finalN / Math.max(1, baseN);
    if (mult > 1.05) {
      out.push({ label, exp, mult, level, mod });
    }
  };

  if (c.edadMax - c.edadMin < 8) {
    addScenario(
      "Ampliar rango de edad",
      { edadMin: Math.max(18, c.edadMin - 3), edadMax: Math.min(65, c.edadMax + 3) },
      `Amplía de ${c.edadMin}–${c.edadMax} a ${Math.max(18, c.edadMin - 3)}–${Math.min(65, c.edadMax + 3)} años.`,
      "medio"
    );
  }

  if (c.ubicacion === "CDMX") {
    addScenario(
      "Buscar en toda la ZMVM",
      { ubicacion: "ZMVM" },
      "Incluye Estado de México y municipios conurbados de la Zona Metropolitana.",
      "alto"
    );
  }

  if (c.ingresoMin && c.ingresoMin > 30000) {
    const newIng = Math.max(30000, c.ingresoMin - 30000);
    addScenario(
      `Bajar ingreso mínimo a ${loFmtMoney(newIng)}`,
      { ingresoMin: newIng },
      "El ingreso alto es uno de los limitantes más drásticos en la demografía del país.",
      "alto"
    );
  }

  if (c.estado === "Soltero" || c.estado === "Soltera") {
    const stateVal = c.busca === 'Mujer' ? "Soltera+Divorciada" : "Soltero+Divorciado";
    addScenario(
      "Aceptar personas divorciadas",
      { estado: stateVal },
      "Suma cohortes con experiencia civil previa que se encuentran solteros/as de nuevo.",
      "bajo"
    );
  }

  if (c.nacionalidad) {
    addScenario(
      "Sin filtro de nacionalidad",
      { nacionalidad: null },
      "Amplía la búsqueda a residentes nacionales de cualquier origen.",
      "alto"
    );
  }

  if (c.estaturaMin && c.estaturaMin > 1.65) {
    const newH = Math.max(1.60, c.estaturaMin - 0.05);
    addScenario(
      `Bajar estatura mínima a ${newH.toFixed(2)} m`,
      { estaturaMin: newH },
      "Cinco centímetros de holgura multiplican exponencialmente el universo normal.",
      "medio"
    );
  }

  // Gamificación sarcástica / Reality Check extrema para perfiles hiper-específicos
  const pct = baseFunnel.pct;
  if (pct < 0.2) {
    out.push({
      label: "Comprar un boleto de lotería",
      exp: "Estadísticamente, tienes más posibilidades de ganar el premio mayor de la Lotería Nacional que de encontrar este perfil exacto de forma casual en la calle hoy.",
      mult: 15.0,
      level: "alto",
      mod: {}
    });
    out.push({
      label: "Ampliar búsqueda a la Estación Espacial",
      exp: "Con 7 astronautas en promedio flotando en órbita, expandir tu rango al espacio exterior ofrece un nivel de probabilidad absoluta muy similar.",
      mult: 5.0,
      level: "medio",
      mod: {}
    });
  }

  return out.sort((a, b) => b.mult - a.mult);
}

export function estimatePopulation(
  criteria: Criteria,
  aiData?: AICalibrationResult,
  calibrations?: CalibrationOverrides
): EstimationResult {
  const { steps, pct, finalN, base } = loComputeFunnel(criteria, aiData?.customMultipliers, calibrations);
  const rarityLevel = loRarityTier(pct);
  const mostRestrictiveFilter = loMostRestrictive(steps);
  const confidenceLevel: 'Alta' | 'Media' | 'Baja' | 'Demo' = pct < 0.2 ? 'Baja' : pct < 2 ? 'Media' : 'Alta';

  let realityCheck = generateRealityCheck(criteria, pct, finalN, mostRestrictiveFilter);
  if (aiData?.realityCheckHeadline && aiData?.realityCheckDetail) {
    realityCheck = {
      headline: aiData.realityCheckHeadline,
      detail: aiData.realityCheckDetail,
      points: realityCheck.points
    };
  }

  const whatIfSuggestions = aiData?.customWhatIfs || loScenarios(criteria, calibrations);

  return {
    steps,
    pct,
    finalN,
    base,
    rarityLevel,
    mostRestrictiveFilter,
    confidenceLevel,
    realityCheck,
    whatIfSuggestions,
  };
}
