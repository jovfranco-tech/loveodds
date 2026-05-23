# LoveOdds MX · ¿Qué tan raro es tu estándar?

LoveOdds MX es un **MVP responsivo y mobile-first** diseñado para estimar la rareza demográfica y estadística de un estándar o perfil de pareja en México a partir de búsquedas en lenguaje natural.

Establecido bajo una estética premium, de revista editorial de datos y analista de relaciones con enfoque ético, este producto busca educar estadísticamente al usuario brindándole un "reality check" matemático basado en las realidades del país.

---

## 🔒 Compromiso de Ética y Privacidad

- **No medimos el valor humano:** LoveOdds MX no evalúa el valor intrínseco, la belleza o la dignidad de ninguna persona. Tampoco predice compatibilidad sentimental.
- **Datos Demo Transparentes:** Toda estimación metodológica actual es simulada/demo y está claramente etiquetada como tal para evitar confusiones de datos.
- **Privacidad Absoluta:** Las consultas de texto y criterios seleccionados se procesan estrictamente dentro de tu navegador (localmente). No recopilamos, compartimos, rastreamos ni almacenamos datos personales o búsquedas sensibles.

---

## 📊 Fuentes Oficiales a Integrar en v2

El motor matemático simula e incorpora las magnitudes y promedios reales de las siguientes metodologías de México:
1. **INEGI · Censo de Población y Vivienda 2020:** Estructura demográfica de edad, género, ubicación y estado civil.
2. **INEGI · ENIGH 2024:** Distribución de deciles de ingresos de hogares y personas.
3. **INEGI · ENOE 2025:** Escolaridad, tasa de desempleo y ocupación.
4. **INSP · ENSANUT 2022:** Medición de estaturas antropométricas por género y edad (curva de distribución normal).
5. **INEGI · ENADID 2023:** Dinámica conyugal y paternidad/maternidad (hijos en el hogar).
6. **SEGOB · Unidad de Política Migratoria / CONAPO:** Distribución de población por nacionalidad de origen.

---

## 🛠️ Tecnologías Utilizadas

- **Core:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS (diseño responsivo completo)
- **Ajustes en vivo:** Panel de control de tweaks visuales interactivo (Paletas de colores HSL, Modo Oscuro/Claro en tiempo real).
- **Simulador:** Opción de alternar en un solo clic entre la visualización en **Web Responsiva Completa** o dentro de un **Simulador iPhone iOS 26 (Liquid Glass)** de alta calidad gráfica.

---

## 🚀 Correr Localmente

1. Clona o abre el repositorio del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abre la dirección `http://localhost:3000` en tu navegador.

---

## 📦 Construcción para Producción

Para compilar el bundle estático compilado y optimizado para deploy (en Vercel, Netlify, etc.):
```bash
npm run build
```
Generará la carpeta `dist/` conteniendo los assets estáticos de producción.
