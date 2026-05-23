import { Criteria } from '../types';

export interface RealityCheckOutput {
  headline: string;
  detail: string;
  points: { k: string; v: string }[];
}

export function generateRealityCheck(
  c: Criteria,
  pct: number,
  finalN: number,
  mostRestrictive: { label: string; dropPct: number } | null
): RealityCheckOutput {
  let headline = "";
  let detail = "";

  const humanEquivalence = pct >= 1 
    ? `${Math.round(pct)} de cada 100` 
    : pct >= 0.1 
    ? `${Math.round(pct * 10)} de cada 1,000` 
    : pct >= 0.01 
    ? `${Math.round(pct * 100)} de cada 10,000` 
    : `${Math.round(pct * 1000)} de cada 100,000`;

  if (pct >= 20) {
    headline = "Tu estándar romántico es amplio y estadísticamente común.";
    detail = "Tu búsqueda describe a un segmento de la población muy representativo en México. No existen filtros excesivamente restrictivos y la probabilidad de encontrar personas con estos criterios demográficos es sumamente alta.";
  } else if (pct >= 10) {
    headline = "Tu búsqueda tiene filtros claros, pero sigue siendo razonable.";
    detail = "Posees ciertas preferencias bien definidas, pero dejas un universo poblacional muy saludable. Aún estás dentro del espectro de búsqueda de fácil alcance en la población mexicana.";
  } else if (pct >= 5) {
    headline = "Tu estándar ya reduce bastante el universo disponible.";
    detail = "Empiezas a buscar dentro de un subgrupo más selectivo. La combinación de filtros de edad, estado civil e ingresos está filtrando a cerca del 90% o 95% de la población general.";
  } else if (pct >= 1) {
    headline = "Este perfil existe, pero el universo disponible es pequeño.";
    detail = "Tu búsqueda es específica. Aproximadamente " + humanEquivalence + " adultos cumplen tus requerimientos. Encontrar a alguien requiere ser más intencional en tus círculos sociales.";
  } else if (pct >= 0.2) {
    headline = "No es imposible, pero estás buscando una combinación poco común.";
    detail = "Estás en el rango de 'Aguja en un pajar'. " + (mostRestrictive ? `El filtro de ${mostRestrictive.label.toLowerCase()} es el principal factor reductor, recortando un ${mostRestrictive.dropPct.toFixed(0)}% del universo poblacional.` : "") + " Encontrar a alguien con estas características exactas requerirá tiempo y bastante azar.";
  } else {
    headline = "La combinación de criterios es extremadamente específica.";
    detail = "Has entrado al territorio de 'Unicornio demográfico'. Estadísticamente, esta combinación de estatura, altos ingresos, ausencia de hijos y soltería apenas existe de forma simultánea en la población censada en México. Ampliar ligeramente tus rangos de edad o flexibilizar el ingreso mínimo expandirá enormemente tus posibilidades.";
  }

  const points = [
    { k: "Equivalencia", v: `${humanEquivalence} adultos` },
    { k: "Filtro más restrictivo", v: mostRestrictive ? mostRestrictive.label : "Ninguno" },
    { k: "Volumen estimado", v: `${Math.round(finalN).toLocaleString("es-MX")} personas` },
    { k: "Confianza global", v: pct < 0.2 ? "Baja-Media (Alta incertidumbre)" : "Alta (Fuentes oficiales)" },
    { k: "Mayor incertidumbre", v: c.ingresoMin ? "Distribución del decil de ingreso alto" : "Filtro de nacionalidad extranjera" },
  ];

  return { headline, detail, points };
}
