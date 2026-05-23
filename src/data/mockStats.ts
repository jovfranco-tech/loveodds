import { Criteria, StatisticalSource } from '../types';

export const LO_SOURCES: StatisticalSource[] = [
  {
    id: "censo",
    name: "INEGI · Censo de Población y Vivienda",
    year: "2020",
    aporta: "Estructura de la población adulta por edad, sexo, ubicación geográfica y estado conyugal.",
    confianza: 96,
    status: "demo",
    limitation: "Muestra estática cada 10 años. No refleja cambios demográficos rápidos post-pandemia."
  },
  {
    id: "enigh",
    name: "INEGI · Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH)",
    year: "2024",
    aporta: "Distribución decílica de ingresos mensuales del hogar, ajustado por ingresos per cápita y ocupación.",
    confianza: 89,
    status: "demo",
    limitation: "Subreporte crónico en deciles altos (ingresos superiores a $100k MXN mensuales)."
  },
  {
    id: "enoe",
    name: "INEGI · Encuesta Nacional de Ocupación y Empleo (ENOE)",
    year: "2025 T2",
    aporta: "Estructura ocupacional, escolaridad (nivel licenciatura o superior) y tasas de participación económica.",
    confianza: 92,
    status: "ready",
    limitation: "No discrimina ingresos exactos por sector profesional informal."
  },
  {
    id: "ensanut",
    name: "INSP · Encuesta Nacional de Salud y Nutrición (ENSANUT)",
    year: "2022",
    aporta: "Distribución de estatura antropométrica promedio y desviación estándar por sexo y cohorte de edad.",
    confianza: 84,
    status: "demo",
    limitation: "La muestra antropométrica se sesga ligeramente hacia zonas urbanas."
  },
  {
    id: "enadid",
    name: "INEGI · Encuesta Nacional de la Dinámica Demográfica (ENADID)",
    year: "2023",
    aporta: "Fecundidad, paternidad, dinámica de hogares e hijos nacidos vivos registrados en el hogar.",
    confianza: 87,
    status: "demo",
    limitation: "Los datos de paternidad (hombres sin hijos) tienen menor cobertura metodológica."
  },
  {
    id: "segob",
    name: "SEGOB · Unidad de Política Migratoria / CONAPO",
    year: "2024",
    aporta: "Distribución de población extranjera residente legal en México por país de nacimiento.",
    confianza: 78,
    status: "demo",
    limitation: "Excluye estimaciones de flujos migratorios irregulares o de turismo temporal."
  },
];

export const LO_DEFAULT_CRITERIA: Criteria = {
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
  estiloVida: null,
};

export const LO_EXAMPLE_B: Criteria = {
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
  estiloVida: null,
};

export const PALETTES = [
  ["#7A1F3D", "#C0395E", "#E8AFA0"], // Wine + coral (default)
  ["#1B1F4B", "#6C4BB6", "#E94F7C"], // Indigo + violet + pink
  ["#0F1B3D", "#B23A6B", "#FF7E5F"], // Navy + magenta + sunset
  ["#2E1F47", "#A65DBD", "#F2C2D2"], // Plum + lilac + blush
  ["#1F3D2E", "#2A6B4F", "#D9A968"], // Forest + amber (calm)
];
