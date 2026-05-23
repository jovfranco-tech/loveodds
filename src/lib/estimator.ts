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
  customMultipliers?: AICalibrationResult['customMultipliers']
): { steps: FunnelStep[]; pct: number; finalN: number; base: number } {
  // Base population of adults (18+)
  let base = 0;
  if (c.ubicacion === 'CDMX') {
    base = c.busca === 'Mujer' ? 3980000 
         : c.busca === 'Hombre' ? 3420000 
         : 7400000;
  } else if (c.ubicacion === 'ZMVM') {
    base = c.busca === 'Mujer' ? 9400000 
         : c.busca === 'Hombre' ? 8750000 
         : 18150000;
  } else {
    base = c.busca === 'Mujer' ? 51200000 
         : c.busca === 'Hombre' ? 47800000 
         : 99000000;
  }

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
    if (c.estado === 'Soltero' || c.estado === 'Soltera') {
      r = 0.36;
    } else if (c.estado === 'Divorciado' || c.estado === 'Divorciada') {
      r = 0.06;
    } else if (c.estado === 'Soltero+Divorciado' || c.estado === 'Soltera+Divorciada') {
      r = 0.42;
    }
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
    const ratio = customMultipliers?.hijos ?? 0.42;
    cur = cur * ratio;
    steps.push({
      label: "Sin hijos en el hogar",
      sub: "INEGI · ENADID 2023",
      n: cur,
      kept: ratio,
    });
  } else if (c.hijos === 'Con hijos') {
    const ratio = customMultipliers?.hijos ?? 0.58;
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
    let r = 0.004;
    if (c.nacionalidad === 'EEUU') r = 0.008;
    if (c.nacionalidad === 'Colombia') r = 0.004;
    if (c.nacionalidad === 'Argentina') r = 0.003;
    if (c.nacionalidad === 'Venezuela') r = 0.005;
    if (c.nacionalidad === 'México') r = 0.985;
    
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
    let r = 1.0;
    if (c.ingresoMin <= 15000) r = 0.55;
    else if (c.ingresoMin <= 30000) r = 0.28;
    else if (c.ingresoMin <= 50000) r = 0.12;
    else if (c.ingresoMin <= 80000) r = 0.045;
    else if (c.ingresoMin <= 100000) r = 0.022;
    else if (c.ingresoMin <= 150000) r = 0.009;
    else r = 0.004;

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
    if (c.busca === 'Mujer') {
      const z = (c.estaturaMin * 100 - 157) / 6;
      r = Math.max(0.001, 1 - normCdf(z));
    } else if (c.busca === 'Hombre') {
      const z = (c.estaturaMin * 100 - 169) / 7;
      r = Math.max(0.001, 1 - normCdf(z));
    } else {
      const z = (c.estaturaMin * 100 - 163) / 8;
      r = Math.max(0.001, 1 - normCdf(z));
    }
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
    if (c.escolaridad === 'Licenciatura+') {
      r = 0.34;
    } else if (c.escolaridad === 'Posgrado+') {
      r = 0.06;
    } else if (c.escolaridad === 'Bachillerato+') {
      r = 0.70;
    }
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

export function loScenarios(c: Criteria): Scenario[] {
  const baseFunnel = loComputeFunnel(c);
  const baseN = baseFunnel.finalN;
  const out: Scenario[] = [];

  const addScenario = (label: string, mod: Partial<Criteria>, exp: string, level: 'bajo' | 'medio' | 'alto') => {
    const patch = { ...c, ...mod };
    const f = loComputeFunnel(patch);
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

  return out.sort((a, b) => b.mult - a.mult);
}

export function estimatePopulation(criteria: Criteria, aiData?: AICalibrationResult): EstimationResult {
  const { steps, pct, finalN, base } = loComputeFunnel(criteria, aiData?.customMultipliers);
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

  const whatIfSuggestions = aiData?.customWhatIfs || loScenarios(criteria);

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
