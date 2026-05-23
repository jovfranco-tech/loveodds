import { Criteria, Scenario } from '../types';

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

export async function queryOpenAI(queryText: string, apiKey: string): Promise<AICalibrationResult> {
  const systemPrompt = `Eres un analista demográfico senior especializado en microdatos de México (INEGI, ENIGH, ENOE, ENSANUT, CONAPO).
Tu tarea es analizar la búsqueda romántica escrita en lenguaje natural por el usuario, interpretarla en criterios estructurados y calibrar multiplicadores de proporción reales e interpretaciones.

Debes responder ÚNICAMENTE con un objeto JSON que cumpla con la siguiente estructura estricta:
{
  "criteria": {
    "busca": "Hombre" | "Mujer" | "Persona",
    "ubicacion": "CDMX" | "ZMVM" | "Nacional",
    "edadMin": number (mínimo 18, si no se especifica usa 25),
    "edadMax": number (si no se especifica usa 40),
    "estado": "Soltero" | "Soltera" | "Divorciado" | "Divorciada" | "Soltero+Divorciado" | "Soltera+Divorciada" | "Cualquiera" (si no se especifica usa "Cualquiera"),
    "hijos": "Sin hijos" | "Con hijos" | null (usa null si no se especifica),
    "estaturaMin": number (en metros, e.g. 1.80, null si no se especifica),
    "ingresoMin": number (mensual en MXN, e.g. 80000, null si no se especifica),
    "nacionalidad": string (país de origen, e.g. "Colombia", null si no se especifica),
    "escolaridad": "Bachillerato+" | "Licenciatura+" | "Posgrado+" | null (usa null si no se especifica),
    "ocupacion": string (profesión, e.g. "Ingeniero", null si no se especifica),
    "estiloVida": "Fitness" | "Deportista" | "Cualquiera" | null (usa null si no se especifica, se detecta por palabras clave como fitness, deportista, nadador, atleta, etc.)
  },
  "customMultipliers": {
    // Proporción (entre 0.0 y 1.0) de personas que CUMPLEN este criterio específico en México.
    // Proporciona estimaciones demográficas realistas y conservadoras:
    "edad": number,         // Rango de edad (e.g. 5 años es aprox 0.10)
    "estado": number,       // Soltería (e.g. soltero/a es aprox 0.36)
    "hijos": number,        // Sin hijos (e.g. aprox 0.42)
    "nacionalidad": number, // Origen extranjero específico (e.g. colombiano en CDMX es aprox 0.004)
    "ingreso": number,      // Ingreso decílico (e.g. >$100k es aprox 0.015, >$80k es 0.035, >$50k es 0.10)
    "estatura": number,     // Estatura normalizada en México (e.g. hombre >= 1.80m es aprox 0.058, mujer >= 1.70m es 0.015)
    "escolaridad": number,  // Nivel educativo profesional (e.g. Licenciatura+ es aprox 0.34)
    "estiloVida": number    // Hábitos de estilo de vida/deporte (e.g. Fitness es aprox 0.25, Deportista es aprox 0.08)
  },
  "realityCheckHeadline": "Frase de síntesis estadística e ingeniosa corta (máx 15 palabras)",
  "realityCheckDetail": "Párrafo explicativo detallado y profesional (máx 60 palabras) del por qué la combinación es común o rara y qué factor impacta más de forma respetuosa.",
  "customWhatIfs": [
    // Máximo 3 sugerencias de escenarios alternativos útiles que multipliquen la población:
    {
      "label": "Título del ajuste (e.g. Bajar ingreso mínimo a $50k)",
      "exp": "Breve explicación demográfica",
      "mult": number (e.g. 2.4, debe ser mayor a 1.0),
      "level": "bajo" | "medio" | "alto",
      "mod": { // Objeto con las propiedades de "criteria" que se van a modificar
        "ingresoMin": 50000
      }
    }
  ]
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza la siguiente consulta y genera la respuesta JSON estructurada: "${queryText}"` }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawJSON = data.choices[0].message.content;
  return JSON.parse(rawJSON) as AICalibrationResult;
}
