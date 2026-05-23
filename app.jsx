// app.jsx — flow controller + iPhone frame + Tweaks

const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "palette": ["#7A1F3D", "#C0395E", "#E8AFA0"],
  "headlineIdx": 0,
  "showKeyboard": false,
  "startScreen": "hero"
}/*EDITMODE-END*/;

const PALETTES = [
  ["#7A1F3D", "#C0395E", "#E8AFA0"], // Wine + coral (default)
  ["#1B1F4B", "#6C4BB6", "#E94F7C"], // Indigo + violet + pink
  ["#0F1B3D", "#B23A6B", "#FF7E5F"], // Navy + magenta + sunset
  ["#2E1F47", "#A65DBD", "#F2C2D2"], // Plum + lilac + blush
  ["#1F3D2E", "#2A6B4F", "#D9A968"], // Forest + amber (calm)
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useStateApp(t.startScreen || "hero");
  const [criteria, setCriteria] = useStateApp({ ...LO_DEFAULT_CRITERIA });
  const [inputText, setInputText] = useStateApp("");

  // Apply palette as CSS vars on the root app
  useEffectApp(() => {
    const [a1, a2, a3] = t.palette || PALETTES[0];
    const root = document.documentElement;
    root.style.setProperty("--accent", a1);
    root.style.setProperty("--accent-2", a2);
    root.style.setProperty("--accent-3", a3);
    // ink color readable on accent
    root.style.setProperty("--accent-ink", "#FFFFFF");
  }, [t.palette]);

  // Apply theme class
  useEffectApp(() => {
    document.documentElement.classList.toggle("theme-dark", !!t.dark);
  }, [t.dark]);

  // FLOW
  const go = (s) => setScreen(s);

  const screens = {
    hero: <HeroScreen
            headlineIdx={t.headlineIdx}
            onStart={() => go("input")}
            onExample={() => { setCriteria({ ...LO_DEFAULT_CRITERIA }); setInputText("Busco un hombre en CDMX, 30–35 años, soltero, sin hijos, 1.80 m y $80,000 MXN al mes."); go("parsing"); }}
          />,
    input: <InputScreen
             onBack={() => go("hero")}
             onSubmit={(text) => { setInputText(text || ""); go("parsing"); }}
             onExample={(ex) => {
               setInputText(ex.prompt);
               if (ex.label.startsWith("Mujer colombiana")) setCriteria({ ...LO_EXAMPLE_B });
               else setCriteria({ ...LO_DEFAULT_CRITERIA });
             }}
           />,
    parsing: <ParsingScreen text={inputText} onDone={() => go("criteria")} />,
    criteria: <CriteriaScreen
                criteria={criteria}
                setCriteria={setCriteria}
                onBack={() => go("input")}
                onContinue={() => go("calculating")}
              />,
    calculating: <CalculatingScreen onDone={() => go("result")} />,
    result: <ResultScreen
              criteria={criteria}
              setCriteria={setCriteria}
              onBack={() => go("criteria")}
              onShare={() => go("share")}
              onRestart={() => { setCriteria({ ...LO_DEFAULT_CRITERIA }); setInputText(""); go("input"); }}
            />,
    share: <ShareScreen criteria={criteria} onBack={() => go("result")} />,
  };

  return (
    <div className={"lo-stage " + (t.dark ? "" : "theme-light-stage")}>
      <IOSDevice
        width={402}
        height={874}
        dark={!!t.dark}
        keyboard={t.showKeyboard && (screen === "input")}
      >
        {screens[screen]}
      </IOSDevice>

      {/* Progress dots (outside phone) */}
      <ProgressDots screen={screen} go={go} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakToggle label="Modo oscuro" value={t.dark}
          onChange={v => setTweak('dark', v)} />
        <TweakColor label="Acento"
          value={t.palette}
          options={PALETTES}
          onChange={v => setTweak('palette', v)} />

        <TweakSection label="Hero" />
        <TweakRadio label="Headline" value={t.headlineIdx}
          options={[
            { value: 0, label: "01" },
            { value: 1, label: "02" },
            { value: 2, label: "03" },
          ]}
          onChange={v => setTweak('headlineIdx', v)} />

        <TweakSection label="Pantalla actual" />
        <TweakSelect label="Saltar a"
          value={screen}
          options={[
            { value: "hero", label: "Hero / Landing" },
            { value: "input", label: "AI Input" },
            { value: "parsing", label: "Interpretando…" },
            { value: "criteria", label: "Criterios detectados" },
            { value: "calculating", label: "Calculando…" },
            { value: "result", label: "Resultado" },
            { value: "share", label: "Share Card" },
          ]}
          onChange={v => setScreen(v)} />
        <TweakToggle label="Mostrar teclado iOS" value={t.showKeyboard}
          onChange={v => setTweak('showKeyboard', v)} />
      </TweaksPanel>
    </div>
  );
}

function ProgressDots({ screen, go }) {
  const flow = ["hero", "input", "parsing", "criteria", "calculating", "result", "share"];
  const labels = {
    hero: "Landing", input: "Input", parsing: "IA",
    criteria: "Criterios", calculating: "Cálculo",
    result: "Resultado", share: "Compartir",
  };
  const idx = flow.indexOf(screen);

  return (
    <div style={{
      position: "fixed",
      left: "50%",
      bottom: 18,
      transform: "translateX(-50%)",
      display: "flex", gap: 6, alignItems: "center",
      padding: "8px 14px",
      background: "rgba(20, 14, 18, 0.5)",
      border: "0.5px solid rgba(255,255,255,0.06)",
      borderRadius: 999,
      backdropFilter: "blur(20px) saturate(140%)",
      WebkitBackdropFilter: "blur(20px) saturate(140%)",
      zIndex: 100,
    }}>
      {flow.map((s, i) => (
        <button key={s}
          onClick={() => go(s)}
          title={labels[s]}
          style={{
            border: 0, background: "transparent",
            padding: 4, cursor: "default",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <div style={{
            width: i === idx ? 16 : 6,
            height: 6, borderRadius: 3,
            background: i <= idx ? "rgba(232, 175, 160, 0.85)" : "rgba(255,255,255,0.18)",
            transition: "all .25s",
          }} />
        </button>
      ))}
      <div style={{
        marginLeft: 8, paddingLeft: 10,
        borderLeft: "0.5px solid rgba(255,255,255,0.12)",
        fontFamily: "var(--font-mono)",
        fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.65)",
      }}>
        {labels[screen]}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
