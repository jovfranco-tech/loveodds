// screens-result.jsx — Result hub (funnel, reality check, what-if, sources) + Share

const { useState: useStateR, useEffect: useEffectR, useMemo: useMemoR, useRef: useRefR } = React;

/* =============================================================
   Top-level result screen with sticky tab bar
   ============================================================= */

function ResultScreen({ criteria, setCriteria, onBack, onShare, onRestart }) {
  const [tab, setTab] = useStateR("resumen");
  const scrollRef = useRefR(null);

  const calc = useMemoR(() => loComputeFunnel(criteria), [criteria]);
  const tier = useMemoR(() => loRarityTier(calc.pct), [calc.pct]);
  const most = useMemoR(() => loMostRestrictive(calc.steps), [calc.steps]);
  const scenarios = useMemoR(() => loScenarios(criteria), [criteria]);

  const tabs = [
    { id: "resumen",   l: "Resumen" },
    { id: "funnel",    l: "Funnel" },
    { id: "analisis",  l: "Análisis" },
    { id: "escenarios",l: "Escenarios" },
    { id: "fuentes",   l: "Fuentes" },
  ];

  const scrollTo = (id) => {
    setTab(id);
    const el = scrollRef.current?.querySelector(`[data-sect="${id}"]`);
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
    }
  };

  // Detect which section the user is scrolled to
  useEffectR(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const sects = [...root.querySelectorAll("[data-sect]")];
      const top = root.scrollTop + 100;
      let cur = sects[0]?.dataset.sect;
      for (const s of sects) {
        if (s.offsetTop <= top) cur = s.dataset.sect;
      }
      if (cur) setTab(cur);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lo-app">
      <LoTopBar onBack={onBack} title="Resultado"
        accessory={
          <button className="lo-icon-btn" onClick={onShare} aria-label="Share">
            <LoIcon name="share" size={14} />
          </button>
        } />

      {/* Sticky tab bar */}
      <div style={{
        display: "flex", gap: 18,
        padding: "4px 20px 0",
        borderBottom: "0.5px solid var(--line)",
        background: "var(--bg)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => scrollTo(t.id)}
            style={{ border: 0, background: "transparent", padding: 0, cursor: "default", flexShrink: 0 }}>
            <div className={"lo-tab" + (tab === t.id ? " on" : "")}>{t.l}</div>
          </button>
        ))}
      </div>

      <div className="lo-scroll" ref={scrollRef}>
        <SectResumen calc={calc} tier={tier} most={most} criteria={criteria} />
        <SectFunnel  calc={calc} criteria={criteria} />
        <SectAnalisis calc={calc} tier={tier} most={most} criteria={criteria} />
        <SectEscenarios scenarios={scenarios} onApply={(mod) => setCriteria({ ...criteria, ...mod })} />
        <SectFuentes />
        <div style={{ padding: "0 20px 24px" }}>
          <EthicsBlock />
        </div>
      </div>

      <div className="lo-bottombar" style={{ display: "flex", gap: 8 }}>
        <button className="lo-btn lo-btn-ghost" style={{ flex: 1 }} onClick={onRestart}>
          Reiniciar
        </button>
        <button className="lo-btn lo-btn-accent" style={{ flex: 1.6 }} onClick={onShare}>
          Compartir resultado
          <LoIcon name="share" size={14} />
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   SECT · Resumen (hero card + rarity tier)
   ============================================================= */

function SectResumen({ calc, tier, most, criteria }) {
  return (
    <section data-sect="resumen" data-screen-label="03 Result · Resumen" style={{ padding: "20px 20px 28px" }}>

      {/* Probability hero */}
      <div className="lo-card lo-fade-in" style={{ position: "relative", overflow: "hidden", padding: 24, borderRadius: 28 }}>
        <div className="lo-grain" />
        <div style={{ position: "relative" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <span className="t-eyebrow">Probabilidad estimada</span>
            <span className="lo-pip"><span className="dot" /> alta confianza</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 14, marginBottom: 4 }}>
            <BigPercent value={calc.pct} />
          </div>

          <div className="t-body" style={{ color: "var(--ink-2)", marginBottom: 16, fontSize: 14 }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", fontWeight: 600 }}>
              {humanRatio(calc.pct)}
            </span>
            <span style={{ marginLeft: 6 }}>· {loFmtExact(calc.finalN)} personas estimadas</span>
          </div>

          {/* Tier scale */}
          <RarityScale tier={tier} />

          <p className="t-body" style={{ marginTop: 18, fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.35, color: "var(--ink)" }}>
            <span style={{ color: "var(--accent)" }}>“</span>
            {tier.blurb}
            <span style={{ color: "var(--accent)" }}>”</span>
          </p>

          {most && (
            <div style={{
              marginTop: 14, padding: "12px 14px",
              background: "var(--bg-deep)", borderRadius: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-eyebrow" style={{ marginBottom: 2 }}>Filtro más restrictivo</div>
                <div className="t-body-sm" style={{ color: "var(--ink)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {most.label}
                </div>
              </div>
              <div className="t-mono" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                −{most.dropPct.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search recap */}
      <div style={{ marginTop: 18 }}>
        <div className="lo-rule" style={{ marginBottom: 12 }}><span>Tu búsqueda</span></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {criteriaToChips(criteria).map((c, i) => (
            <span key={i} className="lo-chip">
              <LoIcon name={c.icon} size={11} color="var(--ink-3)" />
              {c.v}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BigPercent({ value, size }) {
  const txt = value >= 1 ? value.toFixed(1)
            : value >= 0.1 ? value.toFixed(2)
            : value >= 0.01 ? value.toFixed(3)
            : value.toFixed(4);
  const auto = size != null ? size :
               txt.length <= 3 ? 124 :
               txt.length <= 4 ? 108 :
               txt.length <= 5 ? 90 :
                                 76;
  return (
    <span className="lo-bignum" style={{ fontSize: auto }}>
      {txt}<span className="pct">%</span>
    </span>
  );
}

function humanRatio(pct) {
  if (pct >= 1)    return `${Math.round(pct)} de cada 100`;
  if (pct >= 0.1)  return `${Math.round(pct * 10)} de cada 1,000`;
  if (pct >= 0.01) return `${Math.round(pct * 100)} de cada 10,000`;
  return `${Math.round(pct * 1000)} de cada 100,000`;
}

function RarityScale({ tier }) {
  const tiers = [
    "Común", "Selectivo", "Muy selectivo", "Estad. raro", "Aguja", "Unicornio"
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="t-eyebrow">Nivel de rareza</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--ink)", fontStyle: "italic" }}>
          {tier.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {tiers.map((t, i) => {
          const active = i + 1 === tier.rank;
          const passed = i + 1 <= tier.rank;
          return (
            <div key={i} style={{
              flex: 1, height: active ? 16 : 6, borderRadius: 4,
              background: active ? "var(--accent)" : passed ? "var(--ink)" : "var(--bg-deep)",
              transition: "all .3s ease",
            }} />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-3)", letterSpacing: ".1em" }}>COMÚN</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-3)", letterSpacing: ".1em" }}>UNICORNIO</span>
      </div>
    </div>
  );
}

function criteriaToChips(c) {
  const out = [];
  out.push({ icon: "user",       v: c.busca });
  out.push({ icon: "pin",        v: c.ubicacion });
  out.push({ icon: "user",       v: c.edadMin === c.edadMax ? `${c.edadMin} años` : `${c.edadMin}–${c.edadMax} años` });
  if (c.estado)       out.push({ icon: "heart-line", v: c.estado.replace("+", " · ").toLowerCase() });
  if (c.hijos)        out.push({ icon: "user",       v: c.hijos.toLowerCase() });
  if (c.ingresoMin)   out.push({ icon: "wallet",     v: `${loFmtMoney(c.ingresoMin)}+` });
  if (c.estaturaMin)  out.push({ icon: "ruler",      v: `${c.estaturaMin.toFixed(2)} m+` });
  if (c.nacionalidad) out.push({ icon: "globe",      v: c.nacionalidad });
  if (c.escolaridad)  out.push({ icon: "edit",       v: c.escolaridad });
  return out;
}

/* =============================================================
   SECT · Funnel
   ============================================================= */

function SectFunnel({ calc, criteria }) {
  const [mounted, setMounted] = useStateR(false);
  useEffectR(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t); }, []);

  const max = calc.steps[0].n;

  return (
    <section data-sect="funnel" data-screen-label="03 Result · Funnel" style={{ padding: "8px 20px 28px" }}>
      <div className="lo-rule" style={{ margin: "20px 0 18px" }}><span>Reducción del universo</span></div>

      <h3 className="t-h2" style={{ fontSize: 24, marginBottom: 6 }}>
        De {loFmtNum(calc.base)} <i style={{ color: "var(--ink-3)" }}>a</i> {loFmtNum(calc.finalN)}.
      </h3>
      <p className="t-body-sm" style={{ marginBottom: 22 }}>
        Cada filtro se aplica sobre el resultado anterior. Las cifras son
        estimaciones agregadas, no conteos reales.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {calc.steps.map((s, i) => {
          const w = mounted ? Math.max(1.5, (s.n / max) * 100) : 100;
          const isTerm = !!s.terminal;
          const isFirst = i === 0;
          return (
            <FunnelRow
              key={i}
              idx={i}
              total={calc.steps.length}
              step={s}
              width={w}
              isTerm={isTerm}
              isFirst={isFirst}
            />
          );
        })}
      </div>
    </section>
  );
}

function FunnelRow({ idx, total, step, width, isTerm, isFirst }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        gap: 8, marginBottom: 5,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, flex: 1 }}>
          <span className="t-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: ".1em" }}>
            {String(idx).padStart(2, "0")}
          </span>
          <span className="t-body-sm" style={{
            color: "var(--ink)", fontWeight: 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {step.label}
          </span>
        </div>
        <span className="t-mono" style={{
          fontSize: 13, fontWeight: 600,
          color: isTerm ? "var(--accent)" : "var(--ink)",
        }}>
          {loFmtNum(step.n)}
        </span>
      </div>

      <div style={{
        height: isTerm ? 8 : 6,
        background: "var(--bg-deep)",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          height: "100%",
          width: width + "%",
          background: isTerm ? "var(--accent)" : isFirst ? "var(--ink)" : "var(--ink)",
          borderRadius: 4,
          transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
          transitionDelay: (idx * 0.06) + "s",
          opacity: isFirst ? 1 : 0.85,
        }} />
      </div>

      {step.sub && !isTerm && (
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 5,
          fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-4)",
          letterSpacing: ".08em",
        }}>
          <span style={{ textTransform: "uppercase" }}>{step.sub}</span>
          {step.kept != null && idx > 0 && (
            <span>×{step.kept < 0.01 ? step.kept.toFixed(3) : step.kept.toFixed(2)}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* =============================================================
   SECT · Análisis (Reality Check)
   ============================================================= */

function SectAnalisis({ calc, tier, most, criteria }) {
  const interp = useMemoR(() => buildInterpretation(calc, tier, most, criteria), [calc, tier, most, criteria]);

  return (
    <section data-sect="analisis" data-screen-label="03 Result · Reality Check" style={{ padding: "8px 20px 28px" }}>
      <div className="lo-rule" style={{ margin: "20px 0 18px" }}><span>Reality check</span></div>

      <div className="lo-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "var(--accent)", color: "var(--accent-ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LoIcon name="sparkle" size={13} />
          </span>
          <div>
            <div className="t-body-sm" style={{ color: "var(--ink)", fontWeight: 600 }}>Analista LoveOdds</div>
            <div className="t-caption">Síntesis generada con datos públicos · MX</div>
          </div>
        </div>

        <p style={{
          fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.25,
          color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.005em",
        }}>
          {interp.headline}
        </p>

        <p className="t-body" style={{ marginBottom: 18 }}>
          {interp.detail}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {interp.points.map((p, i) => (
            <div className="lo-kv" key={i}>
              <span className="k">{p.k}</span>
              <span className="v">{p.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: "14px 16px",
        background: "transparent",
        border: "0.5px dashed var(--line-2)",
        borderRadius: 14,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <LoIcon name="info" size={16} color="var(--ink-3)" style={{ marginTop: 1 }} />
        <div className="t-caption" style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--ink)", fontWeight: 600 }}>Lo que no se puede concluir:</b>{" "}
          que esa persona no exista, que tus criterios estén mal, o cuál es
          tu propia probabilidad como pareja potencial.
        </div>
      </div>
    </section>
  );
}

function buildInterpretation(calc, tier, most, criteria) {
  const headline =
    tier.rank <= 2 ? "Tu búsqueda describe un grupo amplio dentro de la población analizada."
  : tier.rank === 3 ? "Tu estándar es claro; aún así, el universo disponible empieza a estrecharse."
  : tier.rank === 4 ? "Tu búsqueda es específica pero no imposible — sólo estadísticamente exigente."
  : tier.rank === 5 ? "Es un perfil real, pero estás buscando dentro de un grupo muy pequeño."
  :                    "Esta combinación apenas aparece en los datos demográficos disponibles.";

  const detail = most
    ? `El criterio que más reduce tu universo es ${most.label.toLowerCase()}. Por sí solo recorta ${most.dropPct.toFixed(0)}% de la población base. La combinación con el resto de filtros es lo que lleva la probabilidad a ${loFmtPct(calc.pct)}.`
    : `El conjunto de tus criterios deja un universo estimado de ${loFmtExact(calc.finalN)} personas.`;

  const points = [
    { k: "Significado", v: `${humanRatio(calc.pct)} adultos` },
    { k: "Filtro más restrictivo", v: most ? most.label : "—" },
    { k: "Tier", v: tier.name },
    { k: "Confianza global", v: "Media-alta · datos demo" },
    { k: "Mayor incertidumbre", v: criteria.ingresoMin ? "Distribución de ingresos" : "Origen / nacionalidad" },
  ];

  return { headline, detail, points };
}

/* =============================================================
   SECT · Escenarios (What-if)
   ============================================================= */

function SectEscenarios({ scenarios, onApply }) {
  return (
    <section data-sect="escenarios" data-screen-label="03 Result · What-if" style={{ padding: "8px 20px 28px" }}>
      <div className="lo-rule" style={{ margin: "20px 0 18px" }}><span>Escenarios alternativos</span></div>

      <h3 className="t-h2" style={{ fontSize: 24, marginBottom: 6 }}>
        Ajustes que <i style={{ color: "var(--accent)" }}>amplían</i> tu universo.
      </h3>
      <p className="t-body-sm" style={{ marginBottom: 18 }}>
        No son recomendaciones — son simulaciones. Tú decides si vale la
        pena cambiar el criterio.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {scenarios.length === 0 && (
          <div className="lo-card-flat" style={{ padding: 16 }}>
            <p className="t-body-sm">Tu búsqueda ya es bastante abierta — no encontramos
              ajustes obvios que multipliquen el universo.</p>
          </div>
        )}
        {scenarios.map((s, i) => (
          <ScenarioCard key={i} s={s} onApply={() => onApply(s.mod)} />
        ))}
      </div>
    </section>
  );
}

function ScenarioCard({ s, onApply }) {
  const levelColor = s.level === "alto" ? "var(--accent)" : s.level === "medio" ? "var(--warn)" : "var(--ink-3)";
  const bars = s.level === "alto" ? 3 : s.level === "medio" ? 2 : 1;
  return (
    <div className="lo-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-body" style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>
            {s.label}
          </div>
          <div className="t-caption" style={{ color: "var(--ink-2)" }}>{s.exp}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.02em" }}>
            ×{s.mult >= 10 ? s.mult.toFixed(0) : s.mult.toFixed(1)}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: levelColor, letterSpacing: ".14em", marginTop: 2, textTransform: "uppercase" }}>
            impacto {s.level}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 14, height: 3,
              background: i < bars ? levelColor : "var(--bg-deep)",
              borderRadius: 2,
            }} />
          ))}
        </div>
        <button className="lo-btn lo-btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={onApply}>
          Simular
          <LoIcon name="rotate" size={12} />
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   SECT · Fuentes
   ============================================================= */

function SectFuentes() {
  return (
    <section data-sect="fuentes" data-screen-label="03 Result · Fuentes" style={{ padding: "8px 20px 28px" }}>
      <div className="lo-rule" style={{ margin: "20px 0 18px" }}><span>Base estadística</span></div>

      <h3 className="t-h2" style={{ fontSize: 24, marginBottom: 6 }}>
        De dónde <i style={{ color: "var(--accent)" }}>vienen</i> los datos.
      </h3>
      <p className="t-body-sm" style={{ marginBottom: 18 }}>
        Cada filtro se ancla en una encuesta o censo público.
        Para este MVP las distribuciones son simuladas a partir de tabulados.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LO_SOURCES.map(s => (
          <SourceCard key={s.id} s={s} />
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: 14, borderRadius: 14,
        background: "var(--bg-deep)",
      }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Nota metodológica</div>
        <div className="t-caption" style={{ color: "var(--ink-2)" }}>
          Este MVP usa datos simulados para demostrar la experiencia. En
          producción debe conectarse a microdatos y tabulados oficiales
          (INEGI · ENIGH · ENOE · ENSANUT · ENADID · CONAPO).
        </div>
      </div>
    </section>
  );
}

function SourceCard({ s }) {
  const statusLabel = s.status === "demo" ? "Datos demo" : s.status === "ready" ? "Listo para integrar" : "En vivo";
  return (
    <div className="lo-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-body" style={{ color: "var(--ink)", fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>
            {s.name}
          </div>
          <div className="t-caption">{s.aporta}</div>
        </div>
        <span className={"lo-tag " + s.status}>{statusLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, gap: 8 }}>
        <div className="t-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: ".1em" }}>
          AÑO {s.year}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ flex: 1, height: 3, background: "var(--bg-deep)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: s.confianza + "%", background: "var(--ink)", borderRadius: 2 }} />
          </div>
          <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>
            {s.confianza}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   Ethics block (also used standalone)
   ============================================================= */

function EthicsBlock() {
  return (
    <div>
      <div className="lo-rule" style={{ margin: "20px 0 14px" }}><span>Ética y privacidad</span></div>
      <div className="lo-card-flat" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <LoIcon name="lock" size={16} color="var(--ink-3)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p className="t-body-sm" style={{ color: "var(--ink-2)", marginTop: 0 }}>
              LoveOdds MX <i>no</i> mide el valor de una persona, no predice compatibilidad
              emocional y no identifica individuos. Sólo estima la rareza estadística
              de criterios agregados usando datos demográficos.
            </p>
            <p className="t-caption" style={{ marginTop: 8, color: "var(--ink-3)" }}>
              Tu búsqueda no se asocia a una identidad, no se vende a terceros
              y se descarta al cerrar la sesión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   Share screen
   ============================================================= */

function ShareScreen({ criteria, onBack }) {
  const calc = useMemoR(() => loComputeFunnel(criteria), [criteria]);
  const tier = useMemoR(() => loRarityTier(calc.pct), [calc.pct]);
  const most = useMemoR(() => loMostRestrictive(calc.steps), [calc.steps]);
  const [variant, setVariant] = useStateR("editorial");
  const [copied, setCopied] = useStateR(false);

  const text =
    `Mi estándar romántico en ${criteria.ubicacion}: ${loFmtPct(calc.pct)}\n` +
    `${humanRatio(calc.pct)} adultos cumplen mis criterios.\n` +
    `Nivel: ${tier.name}.\n` +
    `vía LoveOdds MX`;

  return (
    <div className="lo-app">
      <LoTopBar onBack={onBack} title="Compartir" />
      <div className="lo-scroll">
        <div style={{ padding: "12px 20px 28px" }}>

          <h2 className="t-h2" style={{ marginBottom: 6 }}>
            Hazlo <i style={{ color: "var(--accent)" }}>compartible</i>.
          </h2>
          <p className="t-body-sm" style={{ marginBottom: 20 }}>
            Elige un formato. Diseñado para verse bien en LinkedIn, Instagram,
            WhatsApp y screenshot.
          </p>

          {/* Variant tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              { id: "editorial", l: "Editorial" },
              { id: "mono",      l: "Mono" },
              { id: "poster",    l: "Póster" },
            ].map(v => (
              <button key={v.id} className={"lo-chip" + (variant === v.id ? " solid" : "")}
                onClick={() => setVariant(v.id)}>
                {v.l}
              </button>
            ))}
          </div>

          {/* The card */}
          {variant === "editorial" && <ShareEditorial calc={calc} tier={tier} most={most} criteria={criteria} />}
          {variant === "mono"      && <ShareMono      calc={calc} tier={tier} most={most} criteria={criteria} />}
          {variant === "poster"    && <SharePoster    calc={calc} tier={tier} most={most} criteria={criteria} />}

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button className="lo-btn lo-btn-ghost" style={{ flex: 1 }}
              onClick={() => {
                navigator.clipboard?.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}>
              <LoIcon name="copy" size={14} />
              {copied ? "¡Copiado!" : "Copiar texto"}
            </button>
            <button className="lo-btn lo-btn-accent" style={{ flex: 1 }}>
              <LoIcon name="share" size={14} />
              Compartir
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Texto sugerido</div>
            <div className="lo-card-flat" style={{ padding: 14, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>
              {text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareEditorial({ calc, tier, most, criteria }) {
  return (
    <div className="lo-share-card" style={{ aspectRatio: "1 / 1.25" }}>
      <div className="lo-grain" />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="lo-wordmark">
            <span className="glyph" /><span>Love<em>Odds</em></span><span className="mx">MX</span>
          </div>
          <span className="t-eyebrow">edición personal</span>
        </div>

        <div style={{ marginTop: 24, marginBottom: "auto" }}>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>Mi estándar en {criteria.ubicacion}</div>
          <BigPercent value={calc.pct} size={72} />
          <div className="t-body" style={{ marginTop: 12, fontSize: 14 }}>
            {humanRatio(calc.pct)} personas cumplen mis criterios.
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "0.5px solid var(--line-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="t-caption">Nivel</span>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--accent)" }}>
              {tier.name}
            </span>
          </div>
          {most && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-caption">Filtro más restrictivo</span>
              <span className="t-body-sm" style={{ color: "var(--ink)", maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {most.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareMono({ calc, tier, most, criteria }) {
  return (
    <div style={{
      background: "var(--ink)", color: "var(--bg)",
      borderRadius: 28, padding: 24,
      aspectRatio: "1 / 1.25",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-mono)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .6 }}>
        <span>// loveodds.mx</span>
        <span>{new Date().toISOString().slice(0,10)}</span>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7 }}>
        $ loveodds --search {criteria.ubicacion.toLowerCase()}
      </div>

      <div style={{ marginTop: "auto", marginBottom: "auto", textAlign: "left" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 84, lineHeight: .9, letterSpacing: "-0.04em" }}>
          {calc.pct >= 1 ? calc.pct.toFixed(1) : calc.pct >= 0.1 ? calc.pct.toFixed(2) : calc.pct.toFixed(3)}<span style={{ color: "var(--accent-3)" }}>%</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: .8, letterSpacing: ".04em" }}>
          → {humanRatio(calc.pct)}
        </div>
      </div>

      <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", lineHeight: 1.7, opacity: .8 }}>
        <div>tier        :: <span style={{ color: "var(--accent-3)" }}>{tier.name}</span></div>
        <div>n_estimada  :: {loFmtExact(calc.finalN)}</div>
        <div>fuentes     :: INEGI · ENIGH · ENOE</div>
      </div>
    </div>
  );
}

function SharePoster({ calc, tier, most, criteria }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, var(--accent) 0%, #4a0f25 100%)",
      color: "#FAF5EE",
      borderRadius: 28, padding: 24,
      aspectRatio: "1 / 1.25",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* big bg numeral */}
      <div style={{
        position: "absolute", right: -20, bottom: -40,
        fontFamily: "var(--font-display)",
        fontSize: 360, opacity: 0.10, lineHeight: 1, letterSpacing: "-0.05em",
        pointerEvents: "none",
      }}>
        {calc.pct >= 1 ? Math.round(calc.pct) : calc.pct >= 0.1 ? calc.pct.toFixed(1) : calc.pct.toFixed(2)}
      </div>

      <div style={{ position: "relative" }}>
        <div className="lo-wordmark" style={{ color: "#FAF5EE" }}>
          <span className="glyph" style={{ background: "#FAF5EE" }} />
          <span>Love<em>Odds</em></span>
          <span className="mx" style={{ color: "rgba(250,245,238,.65)" }}>MX</span>
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .8 }}>
          un reporte demográfico
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 38,
          lineHeight: 1.02, letterSpacing: "-0.015em", marginTop: 12,
        }}>
          Mi estándar romántico en {criteria.ubicacion} es <i>{tier.name.toLowerCase()}</i>.
        </div>
      </div>

      <div style={{ marginTop: "auto", position: "relative" }}>
        <div style={{ borderTop: "0.5px solid rgba(250,245,238,.3)", paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7 }}>
              Probabilidad
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1, marginTop: 4 }}>
              {calc.pct >= 1 ? calc.pct.toFixed(1) : calc.pct >= 0.1 ? calc.pct.toFixed(2) : calc.pct.toFixed(3)}%
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7 }}>
              N estimada
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1, marginTop: 4 }}>
              {loFmtNum(calc.finalN)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ResultScreen = ResultScreen;
window.ShareScreen = ShareScreen;
window.EthicsBlock = EthicsBlock;
