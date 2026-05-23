import { Criteria } from '../types';

export function parseNaturalLanguageQuery(query: string): Criteria {
  const q = query.toLowerCase();

  // 1. Target Gender
  let busca: 'Hombre' | 'Mujer' | 'Persona' = 'Persona';
  if (/\b(hombre|chico|varon|masculino)\b/.test(q)) {
    busca = 'Hombre';
  } else if (/\b(mujer|chica|dama|femenino)\b/.test(q)) {
    busca = 'Mujer';
  }

  // 2. Location
  let ubicacion: 'CDMX' | 'ZMVM' | 'Nacional' = 'Nacional';
  if (/\b(cdmx|ciudad de m[eé]xico|df|distrito federal|capital)\b/.test(q)) {
    ubicacion = 'CDMX';
  } else if (/\b(zmvm|edomex|estado de m[eé]xico|monterrey|mty|guadalajara|gdl|jalisco|nuevo le[oó]n|nl)\b/.test(q)) {
    ubicacion = 'ZMVM';
  }

  // 3. Age (Exact or Range)
  let edadMin = 25;
  let edadMax = 40;
  
  // Look for ranges: e.g. "30-35", "30 a 35", "entre 30 y 35"
  const rangeMatch = q.match(/\b(entre\s+)?(\d{2})\s*(?:-|a|y)\s*(\d{2})\s*(?:a[ñn]os)?\b/);
  if (rangeMatch) {
    edadMin = parseInt(rangeMatch[2], 10);
    edadMax = parseInt(rangeMatch[3], 10);
  } else {
    // Look for exact age: e.g. "32 años", "mide 32", "de 32"
    const exactMatch = q.match(/\b(?:de\s+)?(\d{2})\s*(?:a[ñn]os)\b/) || q.match(/\b(?:edad\s+de\s+)?(\d{2})\b/);
    if (exactMatch) {
      const age = parseInt(exactMatch[1], 10);
      if (age >= 18 && age <= 99) {
        edadMin = age;
        edadMax = age;
      }
    }
  }

  // 4. Marital Status
  let estado: string | null = 'Cualquiera';
  if (/\b(soltero|soltera|sin casar)\b/.test(q)) {
    estado = busca === 'Mujer' ? 'Soltera' : busca === 'Hombre' ? 'Soltero' : 'Soltero';
  } else if (/\b(divorciado|divorciada)\b/.test(q)) {
    estado = busca === 'Mujer' ? 'Divorciada' : busca === 'Hombre' ? 'Divorciado' : 'Divorciado';
  }

  // 5. Children
  let hijos: 'Sin hijos' | 'Con hijos' | null = null;
  if (/\b(sin hijos|no tenga hijos|cero hijos|0 hijos)\b/.test(q)) {
    hijos = 'Sin hijos';
  } else if (/\b(con hijos|tenga hijos|padre|madre)\b/.test(q)) {
    hijos = 'Con hijos';
  }

  // 6. Height (Formats: 1.80 m, 180 cm, mide 1.80, 1.80)
  let estaturaMin: number | null = null;
  // Regex to find 1.70, 1.80, 180, etc.
  const heightMatch = q.match(/\b(mide|mida|estatura|altura|de\s+)?(1\.\d{2}|2\.\d{2}|1\d{2})\s*(?:m|cm|metros)?\b/);
  if (heightMatch) {
    const val = parseFloat(heightMatch[2]);
    if (val > 100) {
      estaturaMin = val / 100; // 180 -> 1.80
    } else if (val >= 1.2 && val <= 2.2) {
      estaturaMin = val;
    }
  }

  // 7. Income (Formats: 100000, 100,000, $100k, 100k, 100 mil)
  let ingresoMin: number | null = null;
  // Match e.g. "$100k", "100k", "100 mil", "100,000", "100000"
  const incomeMatch = q.match(/(?:\$)?\s*(\d+(?:[.,]\d{3})*)\s*(k|mil|mxn|pesos)?\b/i);
  if (incomeMatch) {
    let baseVal = parseFloat(incomeMatch[1].replace(/[,.]/g, ''));
    const unit = incomeMatch[2]?.toLowerCase();
    if (unit === 'k') {
      baseVal *= 1000;
    } else if (unit === 'mil') {
      baseVal *= 1000;
    }
    
    // Safety boundaries for realistic income search
    if (baseVal >= 2000 && baseVal <= 1000000) {
      ingresoMin = baseVal;
    }
  }

  // 8. Nationality / Origin
  let nacionalidad: string | null = null;
  if (/\b(colombiana|colombiano|colombia)\b/.test(q)) {
    nacionalidad = 'Colombia';
  } else if (/\b(argentina|argentino|argentina)\b/.test(q)) {
    nacionalidad = 'Argentina';
  } else if (/\b(venezolana|venezolano|venezuela)\b/.test(q)) {
    nacionalidad = 'Venezuela';
  } else if (/\b(espa[nñ]ol|espa[nñ]ola|espa[nñ]a)\b/.test(q)) {
    nacionalidad = 'España';
  } else if (/\b(estadounidense|gringo|gringa|usa|eeuu)\b/.test(q)) {
    nacionalidad = 'EEUU';
  } else if (/\b(mexicana|mexicano|m[eé]xico)\b/.test(q)) {
    nacionalidad = 'México';
  }

  // 9. Education
  let escolaridad: 'Bachillerato+' | 'Licenciatura+' | 'Posgrado+' | null = null;
  if (/\b(posgrado|maestr[ií]a|doctorado|phd)\b/.test(q)) {
    escolaridad = 'Posgrado+';
  } else if (/\b(licenciatura|universidad|carrera|profesionista|profesional|ing|lic)\b/.test(q)) {
    escolaridad = 'Licenciatura+';
  } else if (/\b(bachillerato|preparatoria|prepa|secundaria)\b/.test(q)) {
    escolaridad = 'Bachillerato+';
  }

  // 10. Occupation if found
  let ocupacion: string | null = null;
  if (/\b(ingeniero|ingeniera|m[eé]dico|m[eé]dica|doctor|doctora|abogado|abogada|dise[ñn]ador|dise[ñn]adora|desarrollador|desarrolladora|dev|arquitecto|arquitecta)\b/.test(q)) {
    const match = q.match(/\b(ingeniero|ingeniera|m[eé]dico|m[eé]dica|doctor|doctora|abogado|abogada|dise[ñn]ador|dise[ñn]adora|desarrollador|desarrolladora|dev|arquitecto|arquitecta)\b/);
    if (match) {
      ocupacion = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  return {
    busca,
    ubicacion,
    edadMin,
    edadMax,
    estado,
    hijos,
    estaturaMin,
    ingresoMin,
    nacionalidad,
    escolaridad,
    ocupacion,
  };
}
