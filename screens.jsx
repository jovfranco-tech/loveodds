// screens.jsx — primary flow screens (Hero, Input, Parsing, Criteria)

const { useState, useEffect, useRef, useMemo, Fragment } = React;

/* =============================================================
   Shared bits
   ============================================================= */

function LoTopBar({ onBack, title, accessory }) {
  return (
    <div className="lo-topbar">
      {onBack ? (
        <button className="lo-icon-btn" onClick={onBack} aria-label="Back">
          <LoIcon name="chevron-left" size={16} />
        </button>
      ) : (
        <div className="lo-wordmark">
          <span className="glyph" /><span>Love<em>Odds</em></span><span className="mx">MX</span>
        </div>
      )}
      {title && <div className="t-eyebrow">{title}</div>}
      {accessory || <button className="lo-icon-btn" aria-label="Menu"><LoIcon name="dot-grid" size={14} /></button>}
    </div>
  );
}

/* =============================================================
   1. Hero / Landing
   ============================================================= */

function HeroScreen({ onStart, onExample, headlineIdx = 0 }) {
  const HEADLINES = [
    { l1: "¿Qué tan raro", l2: "es lo que", l3: <>buscas<i>?</i></> },
    { l1: "El amor", l2: "también tiene", l3: <>distribución<i>.</i></> },
    { l1: "Tu estándar,", l2: "traducido", l3: <>a porcentaje<i>.</i></> },
  ];
  const h = HEADLINES[headlineIdx % HEADLINES.length];

  return (
    <div className="lo-app">
      <LoTopBar />
      <div className="lo-scroll">
        <div style={{ padding: "20px 20px 28px" }}>

          <div className="t-eyebrow" style={{ marginBottom: 18 }}>
            <span className="lo-pulse-dot" style={{ marginRight: 8 }} />
            Análisis demográfico · México
          </div>

          <h1 className="t-h1" style={{ fontSize: 56, lineHeight: 0.94, marginBottom: 16 }}>
            {h.l1}<br/>
            {h.l2}<br/>
            <i style={{ color: "var(--accent)" }}>{h.l3}</i>
          </h1>

          <p className="t-body" style={{ maxWidth: 320, marginBottom: 26 }}>
            Convierte tus preferencias en una estimación estadística con datos
            de INEGI, ENIGH, ENOE y ENSANUT.
          </p>

          {/* Mock result preview card */}
          <HeroMockCard />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <button className="lo-btn lo-btn-primary lo-btn-full" onClick={onStart}>
              Calcular mi probabilidad
              <LoIcon name="arrow-right" size={16} />
            </button>
            <button className="lo-btn lo-btn-ghost lo-btn-full" onClick={onExample}>
              Ver un ejemplo
            </button>
          </div>

          <div style={{ marginTop: 36 }}>
            <HeroValueProps />
          </div>

          <div style={{ marginTop: 36 }}>
            <HeroEthicsNote />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMockCard() {
  return (
    <div className="lo-card lo-fade-in" style={{ position: "relative", overflow: "hidden", padding: 20 }}>
      <div className="lo-grain" />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="t-eyebrow">Resultado · demo</span>
          <span className="lo-pip"><span className="dot" />confianza 92%</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
          <div>
            <div className="lo-stat-num" style={{ fontSize: 64 }}>0.8<span style={{ fontSize: 24, color: "var(--ink-3)", marginLeft: 4 }}>%</span></div>
            <div className="t-caption" style={{ marginTop: 4 }}>≈ 8 personas por cada 1,000 adultos</div>
          </div>
          <div className="lo-chip tinted">aguja en un pajar</div>
        </div>

        {/* Mini funnel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          {[
            { l: "Adultos CDMX", w: 100 },
            { l: "30–35 años", w: 70 },
            { l: "Soltero, sin hijos", w: 28 },
            { l: "Ingreso, estatura", w: 8 },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 110, fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>{s.l}</div>
              <div style={{ flex: 1, height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: s.w + "%", height: "100%", background: i === 3 ? "var(--accent)" : "var(--ink)", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        <p className="t-body-sm" style={{ marginTop: 14, fontStyle: "italic", color: "var(--ink-2)" }}>
          “Tu búsqueda no es imposible — sólo es estadísticamente exigente.”
        </p>
      </div>
    </div>
  );
}

function HeroValueProps() {
  const items = [
    { k: "01", t: "Lenguaje natural", d: "Escribe lo que buscas como se lo dirías a un amigo." },
    { k: "02", t: "Datos públicos", d: "INEGI, ENIGH, ENOE, ENSANUT, ENADID y CONAPO." },
    { k: "03", t: "Sin juicios", d: "Mide la rareza estadística, no el valor de las personas." },
  ];
  return (
    <div>
      <div className="lo-rule" style={{ marginBottom: 18 }}><span>Cómo funciona</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {items.map(it => (
          <div key={it.k} style={{ display: "flex", gap: 16 }}>
            <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: ".1em", width: 24, paddingTop: 3 }}>{it.k}</div>
            <div style={{ flex: 1 }}>
              <div className="t-h3" style={{ fontSize: 19, marginBottom: 4 }}>{it.t}</div>
              <div className="t-body-sm">{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroEthicsNote() {
  return (
    <div className="lo-card-flat" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <LoIcon name="lock" size={18} color="var(--ink-3)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div className="t-caption" style={{ color: "var(--ink-2)", lineHeight: 1.45 }}>
        LoveOdds <i>no</i> mide el valor de una persona, no identifica individuos y
        no predice compatibilidad emocional. Sólo estima la rareza
        estadística de criterios agregados.
      </div>
    </div>
  );
}

/* =============================================================
   2. AI Input
   ============================================================= */

function InputScreen({ onBack, onSubmit, onExample }) {
  const [text, setText] = useState("");

  const examples = [
    { label: "Hombre 32 · 1.80 m · $100k", prompt: "Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y que gane 100,000 MXN al mes." },
    { label: "Mujer colombiana 28 · CDMX", prompt: "Busco una mujer colombiana de 28 años, soltera y sin hijos que viva en CDMX." },
    { label: "Profesionista 30–35 · sin hijos", prompt: "Busco una persona profesionista, entre 30 y 35 años, sin hijos, con licenciatura o más." },
  ];

  return (
    <div className="lo-app">
      <LoTopBar onBack={onBack} title="01 · Búsqueda" />
      <div className="lo-scroll">
        <div style={{ padding: "12px 20px 28px" }}>

          <h2 className="t-h2" style={{ marginBottom: 8 }}>
            Cuéntale al <i style={{ color: "var(--accent)" }}>analista</i> qué buscas.
          </h2>
          <p className="t-body" style={{ marginBottom: 22 }}>
            Escríbelo en lenguaje natural. Nuestra IA lo convierte en criterios
            demográficos estandarizados.
          </p>

          {/* Input area */}
          <div style={{
            background: "var(--bg-elev)",
            border: "0.5px solid var(--line-2)",
            borderRadius: 20,
            padding: 18,
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--accent)", color: "var(--accent-ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LoIcon name="sparkle" size={12} />
              </span>
              <span className="t-eyebrow">Analista LoveOdds</span>
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y que gane $100,000 MXN al mes…"
              rows={6}
              style={{
                width: "100%",
                border: 0, outline: 0, resize: "none",
                background: "transparent",
                fontFamily: "var(--font-display)",
                fontSize: 22,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                padding: 0,
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span className="t-caption">{text.length} caracteres</span>
              <button
                className="lo-btn lo-btn-accent"
                style={{ padding: "10px 14px", fontSize: 13.5 }}
                onClick={() => onSubmit(text)}
              >
                Interpretar
                <LoIcon name="sparkle" size={13} />
              </button>
            </div>
          </div>

          {/* Examples */}
          <div style={{ marginTop: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>Ejemplos rápidos</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {examples.map((ex, i) => (
                <button key={i} className="lo-chip" onClick={() => { setText(ex.prompt); onExample(ex); }}>
                  <span className="k">0{i+1}</span>
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Capability rail */}
          <div style={{ marginTop: 28 }}>
            <div className="lo-rule" style={{ marginBottom: 14 }}><span>El analista detecta</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["pin", "Ubicación"],
                ["user", "Edad y género"],
                ["heart-line", "Estado conyugal"],
                ["wallet", "Ingreso"],
                ["ruler", "Estatura"],
                ["globe", "Origen / nacionalidad"],
              ].map(([icon, label], i) => (
                <div key={i} className="lo-card-flat" style={{ padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
                  <LoIcon name={icon} size={14} color="var(--ink-3)" />
                  <span className="t-body-sm" style={{ color: "var(--ink-2)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* =============================================================
   3. Parsing animation
   ============================================================= */

function ParsingScreen({ text, onDone }) {
  const [stage, setStage] = useState(0);
  const stages = [
    "Limpiando texto",
    "Identificando ubicación",
    "Detectando edad y género",
    "Mapeando ingreso y estatura",
    "Consultando fuentes",
  ];
  useEffect(() => {
    const id = setInterval(() => {
      setStage(s => {
        if (s + 1 >= stages.length) {
          clearInterval(id);
          setTimeout(onDone, 350);
          return s + 1;
        }
        return s + 1;
      });
    }, 480);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lo-app">
      <LoTopBar title="Interpretando" />
      <div className="lo-scroll" style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ padding: "40px 24px 0" }}>
          <div className="lo-card" style={{ padding: 18, marginBottom: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Texto recibido</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.3, color: "var(--ink-2)", fontStyle: "italic" }}>
              “{text || "Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y $100,000 MXN al mes."}”
            </div>
          </div>

          {/* Pulse glyph */}
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 12px" }}>
            <PulseRings />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {stages.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                opacity: i < stage ? 1 : i === stage ? 1 : 0.35,
                transition: "opacity .3s ease",
              }}>
                <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < stage ? (
                    <LoIcon name="check" size={14} color="var(--pos)" />
                  ) : i === stage ? (
                    <span className="lo-pulse-dot" style={{ background: "var(--accent)" }} />
                  ) : (
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--ink-4)" }} />
                  )}
                </div>
                <span className="t-body-sm" style={{ color: i <= stage ? "var(--ink)" : "var(--ink-3)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PulseRings() {
  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "0.5px solid var(--accent)",
          animation: `lo-ring 2.4s ease-out ${i * 0.7}s infinite`,
          opacity: 0,
        }} />
      ))}
      <div style={{
        position: "absolute", inset: "44px",
        borderRadius: "50%",
        background: "var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--accent-ink)",
      }}>
        <LoIcon name="sparkle" size={16} />
      </div>
      <style>{`@keyframes lo-ring {
        0% { opacity: 0; transform: scale(.3); }
        20% { opacity: .6; }
        100% { opacity: 0; transform: scale(1); }
      }`}</style>
    </div>
  );
}

/* =============================================================
   4. Parsed Criteria — editable
   ============================================================= */

function CriteriaScreen({ criteria, setCriteria, onBack, onContinue }) {
  const c = criteria;
  const u = (patch) => setCriteria({ ...c, ...patch });

  const items = [
    { k: "Busco", v: c.busca, icon: "user",
      pick: ["Hombre", "Mujer", "Persona"],
      set: (v) => u({ busca: v }) },
    { k: "Ubicación", v: c.ubicacion, icon: "pin",
      pick: ["CDMX", "ZMVM", "Nacional"],
      set: (v) => u({ ubicacion: v }) },
    { k: "Edad", v: c.edadMin === c.edadMax ? `${c.edadMin} años` : `${c.edadMin}–${c.edadMax} años`, icon: "user",
      pick: ["28–32", "30–35", "32–38", "25–40"],
      set: (v) => { const [a,b] = v.split("–").map(n=>parseInt(n)); u({ edadMin: a, edadMax: b }); } },
    { k: "Estado", v: c.estado, icon: "heart-line",
      pick: ["Soltero", "Soltero+Divorciado", "Cualquiera"],
      set: (v) => u({ estado: v }) },
    { k: "Hijos", v: c.hijos, icon: "user",
      pick: ["Sin hijos", "Con hijos", "Sin filtro"],
      set: (v) => u({ hijos: v === "Sin filtro" ? null : v }) },
    { k: "Estatura", v: c.estaturaMin ? `${c.estaturaMin.toFixed(2)} m` : "Sin filtro", icon: "ruler",
      pick: ["1.75", "1.78", "1.80", "1.85"],
      set: (v) => u({ estaturaMin: parseFloat(v) }) },
    { k: "Ingreso", v: c.ingresoMin ? `${loFmtMoney(c.ingresoMin)} / mes` : "Sin filtro", icon: "wallet",
      pick: ["$50k", "$80k", "$100k", "$150k"],
      set: (v) => u({ ingresoMin: parseInt(v.replace(/[^\d]/g, "")) * 1000 }) },
    { k: "Origen", v: c.nacionalidad || "Sin filtro", icon: "globe",
      pick: ["Sin filtro", "México", "Colombia", "Argentina"],
      set: (v) => u({ nacionalidad: v === "Sin filtro" ? null : v }) },
    { k: "Escolaridad", v: c.escolaridad || "Sin filtro", icon: "edit",
      pick: ["Sin filtro", "Bachillerato+", "Licenciatura+", "Posgrado+"],
      set: (v) => u({ escolaridad: v === "Sin filtro" ? null : v }) },
  ];

  return (
    <div className="lo-app">
      <LoTopBar onBack={onBack} title="02 · Criterios" />
      <div className="lo-scroll">
        <div style={{ padding: "12px 20px 24px" }}>

          <h2 className="t-h2" style={{ marginBottom: 6 }}>
            Esto fue lo que <i style={{ color: "var(--accent)" }}>entendí</i>.
          </h2>
          <p className="t-body" style={{ marginBottom: 22 }}>
            Toca cualquier criterio para ajustarlo antes de calcular.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((it, i) => (
              <EditableCriterion key={i} item={it} />
            ))}
          </div>

          <div className="lo-card-flat" style={{ marginTop: 18, padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <LoIcon name="info" size={16} color="var(--ink-3)" style={{ marginTop: 2 }} />
            <div className="t-caption" style={{ color: "var(--ink-2)" }}>
              La IA tiende a ser literal. Si tu búsqueda incluye matices
              (“que sea ambicioso”), no podrá traducirlos a datos demográficos.
            </div>
          </div>
        </div>
      </div>
      <div className="lo-bottombar">
        <button className="lo-btn lo-btn-primary lo-btn-full" onClick={onContinue}>
          Calcular rareza
          <LoIcon name="arrow-right" size={16} />
        </button>
      </div>
    </div>
  );
}

function EditableCriterion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lo-criterion" onClick={() => setOpen(o => !o)}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
        <LoIcon name={item.icon} size={16} color="var(--ink-3)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lbl">{item.k}</div>
          <div className="val">{item.v}</div>
        </div>
      </div>
      {open ? (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 180 }}>
          {item.pick.slice(0, 3).map(p => (
            <button key={p} className="lo-chip" style={{ padding: "5px 9px", fontSize: 11 }}
              onClick={(e) => { e.stopPropagation(); item.set(p); setOpen(false); }}>
              {p}
            </button>
          ))}
        </div>
      ) : (
        <LoIcon name="edit" size={14} color="var(--ink-3)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}

/* =============================================================
   Calculating splash
   ============================================================= */

function CalculatingScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v += 4 + Math.random() * 6;
      if (v >= 100) {
        setPct(100);
        clearInterval(id);
        setTimeout(onDone, 380);
      } else {
        setPct(v);
      }
    }, 70);
    return () => clearInterval(id);
  }, []);

  const lines = [
    "Cargando microdatos · INEGI Censo 2020",
    "Ponderando estatura · ENSANUT 2022",
    "Ajustando deciles · ENIGH 2024",
    "Validando residencia · CONAPO 2024",
  ];

  return (
    <div className="lo-app">
      <LoTopBar title="Calculando" />
      <div className="lo-scroll">
        <div style={{ padding: "60px 24px 0", textAlign: "center" }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>Estimación en curso</div>
          <div className="lo-stat-num" style={{ fontSize: 96, fontFamily: "var(--font-display)", color: "var(--ink)" }}>
            {pct.toFixed(0)}<span style={{ fontSize: 32, color: "var(--ink-3)" }}>%</span>
          </div>
          <div style={{ height: 4, background: "var(--bg-deep)", borderRadius: 4, margin: "30px 0", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--accent)", width: pct + "%", transition: "width .2s ease" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
            {lines.map((l, i) => (
              <div key={i} style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: pct > (i+1) * 22 ? "var(--ink-2)" : "var(--ink-4)",
                display: "flex", gap: 8, alignItems: "center",
                transition: "color .3s",
              }}>
                <LoIcon name={pct > (i+1) * 22 ? "check" : "dot-grid"} size={12}
                  color={pct > (i+1) * 22 ? "var(--pos)" : "var(--ink-4)"} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HeroScreen = HeroScreen;
window.InputScreen = InputScreen;
window.ParsingScreen = ParsingScreen;
window.CriteriaScreen = CriteriaScreen;
window.CalculatingScreen = CalculatingScreen;
window.LoTopBar = LoTopBar;
