// demographics.jsx — INEGI-plausible numbers + funnel calc
// All numbers are illustrative but anchored on real magnitudes:
//   CDMX population (Censo 2020):     ~9,209,944
//   ZMVM:                              ~22,000,000
//   CDMX adults 18+:                   ~7,400,000
//   CDMX men 18+:                      ~3,420,000
//   Average male height (ENSANUT):     ~1.69 m
//   Median monthly income (ENIGH):     ~$8,000 MXN

const LO_SOURCES = [
  {
    id: "censo",
    name: "INEGI · Censo de Población y Vivienda",
    year: "2020",
    aporta: "Estructura por edad, sexo, ubicación y estado conyugal.",
    confianza: 96,
    status: "demo",
  },
  {
    id: "enigh",
    name: "INEGI · ENIGH",
    year: "2024",
    aporta: "Distribución de ingreso mensual del hogar y per cápita.",
    confianza: 89,
    status: "demo",
  },
  {
    id: "enoe",
    name: "INEGI · ENOE",
    year: "2025 T2",
    aporta: "Ocupación, escolaridad y condición laboral.",
    confianza: 92,
    status: "ready",
  },
  {
    id: "ensanut",
    name: "INSP · ENSANUT",
    year: "2022",
    aporta: "Distribución de estatura y peso por sexo y edad.",
    confianza: 84,
    status: "demo",
  },
  {
    id: "enadid",
    name: "INEGI · ENADID",
    year: "2023",
    aporta: "Fecundidad, paternidad y dinámica de hogares.",
    confianza: 87,
    status: "demo",
  },
  {
    id: "segob",
    name: "SEGOB · UPM / CONAPO",
    year: "2024",
    aporta: "Población residente por nacionalidad de origen.",
    confianza: 78,
    status: "demo",
  },
];

// Default parsed criteria — the canonical demo search
const LO_DEFAULT_CRITERIA = {
  busca: "Hombre",
  ubicacion: "CDMX",
  edadMin: 30,
  edadMax: 35,
  estado: "Soltero",
  hijos: "Sin hijos",
  estaturaMin: 1.80,
  ingresoMin: 80000,
  nacionalidad: null,
  escolaridad: "Licenciatura+",
  ocupacion: null,
};

// A second canned example for the "Mujer colombiana" chip
const LO_EXAMPLE_B = {
  busca: "Mujer",
  ubicacion: "CDMX",
  edadMin: 28,
  edadMax: 28,
  estado: "Soltera",
  hijos: "Sin hijos",
  estaturaMin: null,
  ingresoMin: null,
  nacionalidad: "Colombia",
  escolaridad: null,
  ocupacion: null,
};

function loFmtNum(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, '') + "M";
  if (n >= 1_000) return Math.round(n).toLocaleString("es-MX");
  return Math.round(n).toLocaleString("es-MX");
}

function loFmtExact(n) {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("es-MX");
}

function loFmtMoney(n) {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

function loFmtPct(p) {
  if (p == null) return "—";
  if (p >= 1) return p.toFixed(1) + "%";
  if (p >= 0.1) return p.toFixed(2) + "%";
  if (p >= 0.01) return p.toFixed(3) + "%";
  return p.toFixed(4) + "%";
}

// Apply rough filter ratios — anchored to public stats but smoothed for demo.
function loComputeFunnel(c) {
  // Base universe
  let base;
  if (c.ubicacion === "CDMX") {
    base = c.busca === "Mujer" ? 3_980_000 : 3_420_000;
  } else if (c.ubicacion === "ZMVM") {
    base = c.busca === "Mujer" ? 9_400_000 : 8_750_000;
  } else {
    base = c.busca === "Mujer" ? 51_200_000 : 47_800_000; // nacional
  }

  const steps = [{
    label: "Población base",
    sub: c.ubicacion === "CDMX" ? `Adultos en CDMX · INEGI 2020` :
         c.ubicacion === "ZMVM" ? `Adultos en ZMVM · INEGI 2020` :
                                   `Adultos a nivel nacional · INEGI 2020`,
    n: base,
    kept: 1,
  }];

  let cur = base;

  // Age filter
  if (c.edadMin != null && c.edadMax != null) {
    // approx % per year of life in adult population
    const yrs = Math.max(1, c.edadMax - c.edadMin + 1);
    // adults aged 18-65; pop density per yr ≈ 1/47
    const ratio = Math.min(0.98, yrs / 47);
    cur = cur * ratio;
    steps.push({
      label: c.edadMin === c.edadMax ? `Edad exacta ${c.edadMin}` : `Edad ${c.edadMin}–${c.edadMax}`,
      sub: "INEGI · Pirámide poblacional",
      n: cur, kept: ratio,
    });
  }

  // Marital status (soltero ~35% for 25-39 adults nationally; lower for older)
  if (c.estado === "Soltero" || c.estado === "Soltera") {
    const r = 0.36;
    cur = cur * r;
    steps.push({ label: "Nunca casado/a", sub: "INEGI · Estado conyugal", n: cur, kept: r });
  } else if (c.estado === "Divorciado" || c.estado === "Divorciada") {
    const r = 0.06;
    cur = cur * r;
    steps.push({ label: "Divorciado/a", sub: "INEGI · Estado conyugal", n: cur, kept: r });
  }

  // Sin hijos
  if (c.hijos === "Sin hijos") {
    const r = 0.42;
    cur = cur * r;
    steps.push({ label: "Sin hijos registrados", sub: "ENADID 2023", n: cur, kept: r });
  }

  // Nacionalidad
  if (c.nacionalidad) {
    // very approximate — colombianos en CDMX ~0.4% of adults
    const r = 0.004;
    cur = cur * r;
    steps.push({
      label: `Origen: ${c.nacionalidad}`,
      sub: "SEGOB · UPM 2024", n: cur, kept: r,
    });
  }

  // Income
  if (c.ingresoMin) {
    // log-style cutoff: $50k ≈ 12%, $80k ≈ 4%, $100k ≈ 2%, $150k ≈ 0.8%
    let r;
    if (c.ingresoMin <= 30_000) r = 0.30;
    else if (c.ingresoMin <= 50_000) r = 0.12;
    else if (c.ingresoMin <= 80_000) r = 0.045;
    else if (c.ingresoMin <= 100_000) r = 0.022;
    else if (c.ingresoMin <= 150_000) r = 0.009;
    else r = 0.004;
    cur = cur * r;
    steps.push({
      label: `Ingreso ≥ ${loFmtMoney(c.ingresoMin)} / mes`,
      sub: "ENIGH 2024 · ingreso ocupado",
      n: cur, kept: r,
    });
  }

  // Estatura
  if (c.estaturaMin) {
    // male height ENSANUT: mean ~169cm, sd ~7. P(h≥180) ≈ 5.8%
    // female: mean ~157, P(h≥170) ≈ 4%
    let r;
    if (c.busca === "Mujer") {
      const dz = (c.estaturaMin * 100 - 157) / 6;
      r = Math.max(0.001, 1 - normCdf(dz));
    } else {
      const dz = (c.estaturaMin * 100 - 169) / 7;
      r = Math.max(0.001, 1 - normCdf(dz));
    }
    cur = cur * r;
    steps.push({
      label: `Estatura ≥ ${c.estaturaMin.toFixed(2)} m`,
      sub: "ENSANUT · distribución antropométrica",
      n: cur, kept: r,
    });
  }

  // Education
  if (c.escolaridad === "Licenciatura+") {
    const r = 0.34;
    cur = cur * r;
    steps.push({ label: "Licenciatura o más", sub: "ENOE · escolaridad", n: cur, kept: r });
  }

  steps.push({
    label: "Universo resultante",
    sub: "Personas que cumplen todos los criterios",
    n: cur, kept: cur / base, terminal: true,
  });

  const pct = (cur / base) * 100;
  return { steps, pct, finalN: cur, base };
}

// Standard normal CDF approximation
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// Rareness tier
function loRarityTier(pct) {
  if (pct >= 8)    return { name: "Común",                    rank: 1, blurb: "Tu búsqueda describe a un grupo amplio de la población." };
  if (pct >= 2)    return { name: "Selectivo",                rank: 2, blurb: "Tu estándar es claro, pero deja un universo razonable." };
  if (pct >= 0.5)  return { name: "Muy selectivo",            rank: 3, blurb: "Empiezas a buscar dentro de un subgrupo pequeño." };
  if (pct >= 0.1)  return { name: "Estadísticamente raro",    rank: 4, blurb: "No es imposible, pero ya es un perfil poco común." };
  if (pct >= 0.01) return { name: "Aguja en un pajar",        rank: 5, blurb: "El universo disponible es minúsculo dentro de los criterios analizados." };
  return            { name: "Unicornio demográfico",          rank: 6, blurb: "Estadísticamente, esta combinación apenas existe en los datos." };
}

// Identify the filter that cut the universe the most
function loMostRestrictive(steps) {
  const cuts = steps
    .filter((s, i) => i > 0 && !s.terminal && s.kept != null)
    .map(s => ({ label: s.label, kept: s.kept, dropPct: (1 - s.kept) * 100 }))
    .sort((a, b) => a.kept - b.kept);
  return cuts[0];
}

// "What-if" optimization scenarios
function loScenarios(c) {
  const base = loComputeFunnel(c).finalN;
  const out = [];

  const tweak = (label, mod, exp, level) => {
    const c2 = { ...c, ...mod };
    const f = loComputeFunnel(c2);
    const mult = f.finalN / Math.max(1, base);
    if (mult > 1.05) {
      out.push({ label, exp, mult, level, mod });
    }
  };

  if (c.edadMax - c.edadMin < 8) {
    tweak("Ampliar rango de edad",
          { edadMin: Math.max(22, c.edadMin - 3), edadMax: c.edadMax + 3 },
          `De ${c.edadMin}–${c.edadMax} a ${Math.max(22, c.edadMin - 3)}–${c.edadMax + 3} años.`,
          "medio");
  }
  if (c.ubicacion === "CDMX") {
    tweak("Buscar en toda la ZMVM",
          { ubicacion: "ZMVM" },
          "Incluye Edomex y municipios conurbados.",
          "alto");
  }
  if (c.ingresoMin && c.ingresoMin > 30_000) {
    const newIng = Math.max(30_000, c.ingresoMin - 30_000);
    tweak(`Bajar ingreso mínimo a ${loFmtMoney(newIng)}`,
          { ingresoMin: newIng },
          "El ingreso es típicamente el filtro más restrictivo en CDMX.",
          "alto");
  }
  if (c.estado === "Soltero" || c.estado === "Soltera") {
    tweak("Aceptar personas divorciadas",
          { estado: c.estado === "Soltero" ? "Soltero+Divorciado" : "Soltera+Divorciada" },
          "Suma cohortes de 35+ con experiencia previa.",
          "bajo");
  }
  if (c.nacionalidad) {
    tweak("Sin filtro de nacionalidad",
          { nacionalidad: null },
          "Mantén el resto del perfil; abre origen.",
          "alto");
  }
  if (c.estaturaMin) {
    const newH = Math.max(1.65, c.estaturaMin - 0.05);
    tweak(`Bajar estatura mínima a ${newH.toFixed(2)} m`,
          { estaturaMin: newH },
          "Cinco centímetros mueven mucho la curva normal.",
          "medio");
  }

  // Custom: handle the divorced+single case for funnel
  return out.slice(0, 5).sort((a, b) => b.mult - a.mult);
}

// Patch loComputeFunnel to recognize combined states
const _loOrigCompute = loComputeFunnel;
function loComputeFunnelCombined(c) {
  if (c.estado === "Soltero+Divorciado" || c.estado === "Soltera+Divorciada") {
    const a = _loOrigCompute({ ...c, estado: c.estado.startsWith("Soltero") ? "Soltero" : "Soltera" });
    const b = _loOrigCompute({ ...c, estado: c.estado.startsWith("Soltero") ? "Divorciado" : "Divorciada" });
    // merge by summing N at terminal step; rebuild a synthetic chain from `a`
    const steps = a.steps.map((s, i) => {
      if (s.terminal) return { ...s, n: a.finalN + b.finalN };
      const bS = b.steps[i];
      return bS ? { ...s, n: (s.n || 0) + (bS.n || 0) } : s;
    });
    return { steps, pct: (a.finalN + b.finalN) / a.base * 100, finalN: a.finalN + b.finalN, base: a.base };
  }
  return _loOrigCompute(c);
}

Object.assign(window, {
  LO_SOURCES, LO_DEFAULT_CRITERIA, LO_EXAMPLE_B,
  loFmtNum, loFmtExact, loFmtMoney, loFmtPct,
  loComputeFunnel: loComputeFunnelCombined,
  loRarityTier, loMostRestrictive, loScenarios,
});
