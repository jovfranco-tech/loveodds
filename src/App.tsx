import React, { useState, useEffect, useRef } from 'react';
import { Criteria, TweakConfig } from './types';
import { LO_DEFAULT_CRITERIA, LO_EXAMPLE_B, PALETTES } from './data/mockStats';
import { parseNaturalLanguageQuery } from './lib/parser';
import { estimatePopulation, loFmtMoney } from './lib/estimator';
import { queryOpenAI, AICalibrationResult } from './lib/openai';
import { db } from './lib/firebase';

// Components
import { AppHeader } from './components/AppHeader';
import { HeroSection } from './components/HeroSection';
import { AIQueryInput } from './components/AIQueryInput';
import { ParsedCriteriaPanel } from './components/ParsedCriteriaPanel';
import { MainProbabilityCard } from './components/MainProbabilityCard';
import { PopulationFunnel } from './components/PopulationFunnel';
import { RealityCheckCard } from './components/RealityCheckCard';
import { WhatIfOptimizer } from './components/WhatIfOptimizer';
import { StatisticalSourcesPanel } from './components/StatisticalSourcesPanel';
import { EthicsDisclaimer } from './components/EthicsDisclaimer';
import { ShareResultCard } from './components/ShareResultCard';
import { LoadingState } from './components/LoadingState';
import { EmptyResultState } from './components/EmptyResultState';
import { TweaksPanel } from './components/TweaksPanel';
import { LoIcon } from './components/Icons';

// Subcomponents
import { IOSDevice } from './components/IOSDevice';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<string>("hero");
  const [criteria, setCriteria] = useState<Criteria>({ ...LO_DEFAULT_CRITERIA });
  const [inputText, setInputText] = useState("");
  const [isFrameMode, setIsFrameMode] = useState(false);

  // Secure API key state, persisted in sessionStorage, with VITE_OPENAI_API_KEY environment fallback
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem('loveodds_openai_key') || ((import.meta as any).env?.VITE_OPENAI_API_KEY as string) || '';
  });

  const [aiResult, setAiResult] = useState<AICalibrationResult | undefined>(undefined);
  const [calibrations, setCalibrations] = useState<any>(undefined);
  const [history, setHistory] = useState<Criteria[]>(() => {
    try {
      const raw = localStorage.getItem("loveodds_search_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = (newCriteria: Criteria) => {
    setHistory(prev => {
      // Avoid duplicate states in history
      const filtered = prev.filter(c => JSON.stringify(c) !== JSON.stringify(newCriteria));
      const updated = [newCriteria, ...filtered].slice(0, 3); // Keep last 3 searches
      try {
        localStorage.setItem("loveodds_search_history", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save history to localStorage:", err);
      }
      return updated;
    });
  };

  const [tweaks, setTweaks] = useState<TweakConfig>({
    dark: false,
    palette: PALETTES[0],
    headlineIdx: 0,
    showKeyboard: false,
    startScreen: "hero",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("resumen");

  // Keep sessionStorage in sync
  const setApiKeySecurely = (key: string) => {
    setApiKey(key);
    if (key) {
      sessionStorage.setItem('loveodds_openai_key', key);
    } else {
      sessionStorage.removeItem('loveodds_openai_key');
    }
  };

  // Dynamically set CSS custom variables for accent palette on mount / tweak change
  useEffect(() => {
    const [a1, a2, a3] = tweaks.palette;
    const root = document.documentElement;
    root.style.setProperty("--accent", a1);
    root.style.setProperty("--accent-2", a2);
    root.style.setProperty("--accent-3", a3);
    root.style.setProperty("--accent-ink", "#FFFFFF");
  }, [tweaks.palette]);

  // Dark mode trigger class
  useEffect(() => {
    const root = document.documentElement;
    if (tweaks.dark) {
      root.classList.add('theme-dark', 'dark');
    } else {
      root.classList.remove('theme-dark', 'dark');
    }
  }, [tweaks.dark]);

  // Mount logic: Load census calibrations and parse shared link /r/{id} router
  useEffect(() => {
    const fetchCalibrations = async () => {
      if (!db) return;
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, "calibrations", "mx_v1"));
        if (snap.exists()) {
          setCalibrations(snap.data());
          console.log("Calibraciones oficiales cargadas desde Firestore.");
        }
      } catch (err) {
        console.error("Error loading calibrations from Firestore:", err);
      }
    };
    fetchCalibrations();

    const path = window.location.pathname;
    if (path.startsWith('/r/')) {
      const resultId = path.split('/r/')[1]?.trim();
      if (resultId) {
        setScreen("shared_loading");
        const fetchSharedResult = async () => {
          if (!db) {
            console.error("Firestore db not initialized.");
            setScreen("hero");
            return;
          }
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const snap = await getDoc(doc(db, "results", resultId));
            if (snap.exists()) {
              const data = snap.data();
              if (data.criteria) {
                setCriteria(data.criteria);
                if (data.aiResult) {
                  setAiResult(data.aiResult);
                }
                // Auto-append shared calculation to local search history for easy reference
                try {
                  const raw = localStorage.getItem("loveodds_search_history");
                  const prev = raw ? JSON.parse(raw) : [];
                  const filtered = prev.filter((c: any) => JSON.stringify(c) !== JSON.stringify(data.criteria));
                  const updated = [data.criteria, ...filtered].slice(0, 3);
                  localStorage.setItem("loveodds_search_history", JSON.stringify(updated));
                  setHistory(updated);
                } catch (e) {
                  console.error("Failed to append shared result to history:", e);
                }
                const docTransition = document as any;
                if (docTransition.startViewTransition) {
                  docTransition.startViewTransition(() => {
                    setScreen("result");
                  });
                } else {
                  setScreen("result");
                }
                return;
              }
            }
            console.warn("Shared result not found or invalid format.");
            setScreen("hero");
          } catch (err) {
            console.error("Error loading shared result:", err);
            setScreen("hero");
          }
        };
        fetchSharedResult();
      }
    }
  }, []);

  const setTweak = <K extends keyof TweakConfig>(key: K, val: TweakConfig[K]) => {
    setTweaks(prev => ({ ...prev, [key]: val }));
  };

  const go = (s: string) => {
    const doc = document as any;
    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        setScreen(s);
      });
    } else {
      setScreen(s);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute stats funnel & reality check using custom AI override and Firestore calibrations!
  const estimationResult = estimatePopulation(criteria, aiResult, calibrations);

  // Flow controllers
  const handleQuerySubmit = async (text: string) => {
    setInputText(text);
    go("parsing");
    
    // Clear any previous AI calibrations first
    setAiResult(undefined);

    if (apiKey.trim()) {
      try {
        // Query real OpenAI endpoint in background during loader screen
        const result = await queryOpenAI(text, apiKey);
        setCriteria(result.criteria);
        setAiResult(result);
        addToHistory(result.criteria);
      } catch (err) {
        console.error("OpenAI failed, falling back to local regex parser:", err);
        // Fallback to local mode
        const parsed = parseNaturalLanguageQuery(text);
        setCriteria(parsed);
        setAiResult(undefined);
        addToHistory(parsed);
      }
    } else {
      // Local Mode
      const parsed = parseNaturalLanguageQuery(text);
      setCriteria(parsed);
      setAiResult(undefined);
      addToHistory(parsed);
    }
  };

  const handleApplyPreset = (prompt: string, preset: string) => {
    setInputText(prompt);
    setAiResult(undefined);
    if (preset === "B") {
      setCriteria({ ...LO_EXAMPLE_B });
    } else {
      setCriteria({ ...LO_DEFAULT_CRITERIA });
    }
    go("parsing");
  };

  // Sticky Tab Bar Scroll spy logic for Result screen
  const scrollToSection = (sectId: string) => {
    setTab(sectId);
    const el = document.querySelector(`[data-sect="${sectId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Build screens map
  const renderScreen = () => {
    switch (screen) {
      case "hero":
        return (
          <div className="lo-app h-full">
            <AppHeader />
            <div className="lo-scroll flex-1">
              <HeroSection
                onStart={() => go("input")}
                onExample={() => handleApplyPreset(
                  "Busco un hombre en CDMX, 32 años, soltero, sin hijos, 1.80 m y que gane 100,000 MXN mensuales.",
                  "A"
                )}
              />
            </div>
          </div>
        );
      case "input":
        return (
          <div className="lo-app h-full">
            <AppHeader onBack={() => go("hero")} title="01 · BÚSQUEDA" />
            <div className="lo-scroll flex-1 pb-6">
              <AIQueryInput
                onSubmit={handleQuerySubmit}
                onExample={handleApplyPreset}
              />
              
              {/* Local History Section */}
              {history.length > 0 && (
                <div className="px-6 mt-4 flex flex-col gap-3 lo-fade-in select-none">
                  <div className="flex items-center gap-3 text-ink-3 dark:text-ink-4">
                    <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
                    <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase">Búsquedas recientes</span>
                    <div className="flex-1 h-[0.5px] bg-ink/10 dark:bg-ink-dark/10" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {history.map((hist, i) => {
                      const desc = `${hist.busca} · ${hist.ubicacion} · ${hist.edadMin === hist.edadMax ? `${hist.edadMin} años` : `${hist.edadMin}-${hist.edadMax} años`} · ${hist.estado || "Cualquiera"}`;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setCriteria(hist);
                            setAiResult(undefined);
                            setInputText(`Búsqueda histórica: ${desc}`);
                            go("calculating");
                          }}
                          className="w-full flex items-center justify-between p-3.5 rounded-lg border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-left hover:scale-[1.01] hover:border-accent/30 dark:hover:border-accent-2/30 active:scale-[0.99] transition-all"
                        >
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-[12.5px] font-semibold text-ink dark:text-ink-dark truncate">
                              {desc}
                            </span>
                            <span className="text-[10px] font-mono text-ink-3 dark:text-ink-4">
                              {hist.ingresoMin ? `≥ ${loFmtMoney(hist.ingresoMin)}/mes` : 'Cualquier ingreso'}{hist.estaturaMin ? ` · ≥ ${hist.estaturaMin.toFixed(2)}m` : ''}{hist.hijos ? ` · ${hist.hijos}` : ''}{hist.estiloVida ? ` · ${hist.estiloVida}` : ''}{hist.complexion ? ` · ${hist.complexion}` : ''}
                            </span>
                          </div>
                          <LoIcon name="arrow-right" size={13} className="text-accent dark:text-accent-3 shrink-0 ml-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "parsing":
        return (
          <div className="lo-app h-full">
            <AppHeader title="01 · PARSER AI" />
            <div className="lo-scroll flex-1">
              <LoadingState
                type="parsing"
                queryText={inputText}
                hasRealAI={!!apiKey}
                onDone={() => {
                  if (estimationResult.base === 0) {
                    go("empty");
                  } else {
                    go("criteria");
                  }
                }}
              />
            </div>
          </div>
        );
      case "criteria":
        return (
          <div className="lo-app h-full">
            <AppHeader onBack={() => go("input")} title="02 · CRITERIOS" />
            <div className="lo-scroll flex-1 pb-24">
              <ParsedCriteriaPanel criteria={criteria} setCriteria={setCriteria} />
            </div>
            {/* Sticky Action Footer */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent relative z-20">
              <button
                onClick={() => {
                  addToHistory(criteria);
                  go("calculating");
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md font-semibold text-[15px] bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark active:scale-[0.985] transition-all select-none shadow-shd-1"
              >
                Calcular rareza poblacional
                <LoIcon name="arrow-right" size={16} />
              </button>
            </div>
          </div>
        );
      case "calculating":
        return (
          <div className="lo-app h-full">
            <AppHeader title="02 · CÁLCULO" />
            <div className="lo-scroll flex-1">
              <LoadingState
                type="calculating"
                hasRealAI={!!apiKey}
                onDone={() => go("result")}
              />
            </div>
          </div>
        );
      case "empty":
        return (
          <div className="lo-app h-full">
            <AppHeader title="SIN RESULTADOS" />
            <div className="lo-scroll flex-1">
              <EmptyResultState onRestart={() => go("input")} />
            </div>
          </div>
        );
      case "result":
        return (
          <div className="lo-app h-full">
            <AppHeader
              onBack={() => go("criteria")}
              title="03 · RESULTADO"
              accessory={
                <button
                  onClick={() => go("share")}
                  className="w-9 h-9 rounded-full border border-ink/10 dark:border-ink-dark/10 bg-elev-light dark:bg-elev-dark flex items-center justify-center text-ink-2 dark:text-ink-3 hover:scale-105 active:scale-95 transition-transform"
                  aria-label="Compartir"
                >
                  <LoIcon name="share" size={14} />
                </button>
              }
            />

            {/* Sticky Dashboard Section Navigation tabs */}
            <div className="flex gap-4 px-6 border-b border-ink/10 dark:border-white/10 bg-bg-light dark:bg-bg-dark overflow-x-auto scrollbar-none select-none shrink-0">
              {[
                { id: "resumen", label: "Resumen" },
                { id: "funnel", label: "Funnel" },
                { id: "analisis", label: "Reality Check" },
                { id: "escenarios", label: "Escenarios" },
                { id: "fuentes", label: "Fuentes" },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => scrollToSection(tabItem.id)}
                  className="shrink-0 bg-transparent border-0 p-0"
                >
                  <div className={`lo-tab ${tab === tabItem.id ? 'on' : ''}`}>
                    {tabItem.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="lo-scroll flex-1 pb-24" ref={scrollRef}>
              {/* Responsive Layout Grid on Desktop, simple stack on Mobile/Simulator */}
              <div className={`grid grid-cols-1 ${isFrameMode ? '' : 'lg:grid-cols-2'} gap-6 p-6 max-w-5xl mx-auto items-start`}>
                {/* Left Column (Main Result) */}
                <div className="flex flex-col gap-6" data-sect="resumen">
                  <MainProbabilityCard result={estimationResult} />
                  
                  {/* Search Recap Chips */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="font-mono text-[9px] tracking-widest text-ink-3 dark:text-ink-4 uppercase select-none">
                      Tus criterios de búsqueda
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                        <LoIcon name="user" size={12} />
                        {criteria.busca}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                        <LoIcon name="pin" size={12} />
                        {criteria.ubicacion}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                        <LoIcon name="user" size={12} />
                        {criteria.edadMin === criteria.edadMax ? `${criteria.edadMin} años` : `${criteria.edadMin}–${criteria.edadMax} años`}
                      </span>
                      {criteria.estado && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                          <LoIcon name="heart-line" size={12} />
                          {criteria.estado}
                        </span>
                      )}
                      {criteria.hijos && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                          <LoIcon name="user" size={12} />
                          {criteria.hijos}
                        </span>
                      )}
                      {criteria.ingresoMin && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                          <LoIcon name="wallet" size={12} />
                          ≥ {loFmtMoney(criteria.ingresoMin)}/mes
                        </span>
                      )}
                      {criteria.estaturaMin && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                          <LoIcon name="ruler" size={12} />
                          ≥ {criteria.estaturaMin.toFixed(2)} m
                        </span>
                      )}
                      {criteria.nacionalidad && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-[12.5px] font-semibold text-ink-2 dark:text-ink-3">
                          <LoIcon name="globe" size={12} />
                          {criteria.nacionalidad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column (Funnel, Reality Check, What-if, Sources) */}
                <div className="flex flex-col gap-8">
                  <div data-sect="funnel">
                    <PopulationFunnel result={estimationResult} />
                  </div>
                  <div data-sect="analisis">
                    <RealityCheckCard result={estimationResult} />
                  </div>
                  <div data-sect="escenarios">
                    <WhatIfOptimizer 
                      scenarios={estimationResult.whatIfSuggestions} 
                      onApply={(mod) => {
                        setCriteria({ ...criteria, ...mod });
                        scrollToSection("resumen");
                      }} 
                    />
                  </div>
                  <div data-sect="fuentes">
                    <StatisticalSourcesPanel />
                  </div>
                  <EthicsDisclaimer />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent flex gap-3 relative z-20">
              <button
                onClick={() => {
                  setCriteria({ ...LO_DEFAULT_CRITERIA });
                  setAiResult(undefined);
                  setInputText("");
                  go("input");
                }}
                className="flex-1 py-3.5 rounded-md font-semibold text-[14px] border border-ink/15 dark:border-ink-dark/15 text-ink-2 dark:text-ink-3 bg-elev-light dark:bg-elev-dark active:scale-[0.98] transition-all select-none"
              >
                Reiniciar simulación
              </button>
              <button
                onClick={() => go("share")}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-md font-semibold text-[14px] bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark active:scale-[0.98] transition-all select-none shadow-shd-1"
              >
                Compartir resultado
                <LoIcon name="share" size={14} />
              </button>
            </div>
          </div>
        );
      case "share":
        return (
          <div className="lo-app h-full">
            <AppHeader onBack={() => go("result")} title="04 · COMPARTIR" />
            <div className="lo-scroll flex-1 pb-10">
              <div className="max-w-md mx-auto">
                <ShareResultCard criteria={criteria} result={estimationResult} aiResult={aiResult} />
                <EthicsDisclaimer />
              </div>
            </div>
          </div>
        );
      case "shared_loading":
        return (
          <div className="lo-app h-full flex flex-col justify-center items-center gap-6 text-center py-20 px-6 lo-fade-in select-none">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4">
              Cargando reporte
            </span>
            <div className="relative w-24 h-24">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  style={{
                    animation: `lo-ring 2.4s ease-out ${idx * 0.7}s infinite`,
                  }}
                  className="absolute inset-0 rounded-full border border-accent/70 dark:border-accent-2/70 opacity-0"
                />
              ))}
              <div className="absolute inset-8 rounded-full bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark flex items-center justify-center shadow-shd-1">
                <LoIcon name="sparkle" size={16} className="animate-pulse" />
              </div>
            </div>
            <p className="text-[13.5px] text-ink-2 dark:text-ink-3">
              Obteniendo análisis oficial y calibración INEGI...
            </p>
            <style>{`
              @keyframes lo-ring {
                0% { opacity: 0; transform: scale(.3); }
                20% { opacity: .6; }
                100% { opacity: 0; transform: scale(1); }
              }
            `}</style>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`lo-stage ${tweaks.dark ? '' : 'theme-light-stage'}`}>
      {/* Real-time Tweak floating card toggle */}
      <div className="fixed left-4 bottom-4 z-[9999] flex gap-2">
        <button
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="px-3.5 h-12 rounded-full shadow-shd-2 border border-ink/10 dark:border-white/10 bg-elev-light dark:bg-elev-dark text-ink-2 dark:text-ink-3 font-mono text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all select-none flex items-center gap-1.5"
          title="Alternar simulador iPhone o Web Responsiva completa"
        >
          <LoIcon name="user" size={13} />
          {isFrameMode ? 'Ver Web Completa' : 'Ver Simulador iOS'}
        </button>
      </div>

      {isFrameMode ? (
        /* Mobile simulator Mode inside gorgeous custom liquid glass iPhone device */
        <IOSDevice dark={tweaks.dark} keyboard={tweaks.showKeyboard && screen === 'input'}>
          {renderScreen()}
        </IOSDevice>
      ) : (
        /* Premium Responsive Web Mode occupying the screen dynamically */
        <div className="w-full max-w-[500px] lg:max-w-[1024px] h-[874px] rounded-xl overflow-hidden shadow-shd-2 border border-ink/10 dark:border-ink-dark/10 bg-bg-light dark:bg-bg-dark relative flex flex-col">
          {renderScreen()}
        </div>
      )}

      {/* Floating control dock tweaks panel */}
      <TweaksPanel
        t={tweaks}
        setTweak={setTweak}
        screen={screen}
        setScreen={(s) => {
          setScreen(s);
        }}
        apiKey={apiKey}
        setApiKey={setApiKeySecurely}
      />
    </div>
  );
};
export default App;
