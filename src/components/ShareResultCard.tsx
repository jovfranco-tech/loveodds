import React, { useState, useRef, useEffect } from 'react';
import { Criteria, EstimationResult } from '../types';
import { LoIcon } from './Icons';
import { toPng } from 'html-to-image';
import { db } from '../lib/firebase';

interface ShareResultCardProps {
  criteria: Criteria;
  result: EstimationResult;
  aiResult?: any;
}

export const ShareResultCard: React.FC<ShareResultCardProps> = ({ criteria, result, aiResult }) => {
  const [variant, setVariant] = useState<'editorial' | 'mono' | 'poster'>('editorial');
  const [copied, setCopied] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pct = result.pct;
  const tier = result.rarityLevel;
  const most = result.mostRestrictiveFilter;

  const formattedPct = pct >= 1 ? pct.toFixed(1)
                      : pct >= 0.1 ? pct.toFixed(2)
                      : pct >= 0.01 ? pct.toFixed(3)
                      : pct.toFixed(4);

  const humanRatio = pct >= 1 ? `${Math.round(pct)} de cada 100`
                   : pct >= 0.1 ? `${Math.round(pct * 10)} de cada 1,000`
                   : pct >= 0.01 ? `${Math.round(pct * 100)} de cada 10,000`
                   : `${Math.round(pct * 1000)} de cada 100,000`;

  // Auto-save search criteria in Firestore on component mount to generate persistent short URL
  useEffect(() => {
    const saveToFirestore = async () => {
      if (!db) {
        console.warn("Firestore db not initialized. Cannot generate short link.");
        return;
      }
      try {
        setSharingLoading(true);
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const docRef = await addDoc(collection(db, "results"), {
          criteria,
          aiResult: aiResult || null,
          createdAt: serverTimestamp()
        });
        const url = `${window.location.origin}/r/${docRef.id}`;
        setSharedUrl(url);
      } catch (err) {
        console.error("Error writing search result to Firestore:", err);
      } finally {
        setSharingLoading(false);
      }
    };
    saveToFirestore();
  }, [criteria, aiResult]);

  const shareUrl = sharedUrl || window.location.origin;

  // Copied text summary template
  const shareText = 
    `Mi estándar romántico en ${criteria.ubicacion}: ${formattedPct}%\n` +
    `Aproximadamente ${humanRatio} adultos cumplen mis criterios.\n` +
    `Nivel de rareza: ${tier.name}.\n` +
    `Filtro más restrictivo: ${most ? most.label : "Ninguno"}.\n` +
    `Link al reporte: ${shareUrl}\n` +
    `vía LoveOdds MX (Cálculo Oficial)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'LoveOdds MX - Mi estándar romántico',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadPNG = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });
      const link = document.createElement('a');
      link.download = `loveodds-reporte-${criteria.ubicacion.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong with PNG export!', err);
    }
  };

  return (
    <div className="flex flex-col gap-5 py-4 px-6 lo-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl font-normal leading-tight text-ink dark:text-ink-dark">
          Hazlo <i className="font-serif italic font-normal text-accent dark:text-accent-3">compartible</i>.
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
          Elige una estética. Diseñado para verse increíble como captura de pantalla en LinkedIn, Instagram o WhatsApp.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2 p-1 bg-deep-light/40 dark:bg-deep-dark/40 rounded-full border border-ink/5 dark:border-ink-dark/5 select-none">
        {(['editorial', 'mono', 'poster'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={`flex-1 py-2 rounded-full font-mono text-[10px] tracking-[0.12em] uppercase font-bold transition-all ${
              variant === v 
                ? 'bg-ink text-bg-light dark:bg-ink-dark dark:text-bg-dark border border-ink dark:border-ink-dark' 
                : 'text-ink-3 dark:text-ink-4 hover:text-ink dark:hover:text-ink-dark bg-transparent'
            }`}
          >
            {v === 'editorial' ? 'Editorial' : v === 'mono' ? 'Terminal' : 'Póster'}
          </button>
        ))}
      </div>

      {/* Render selected Card variant */}
      <div ref={cardRef} className="aspect-[1/1.22] w-full rounded-2xl overflow-hidden shadow-shd-2 border border-ink/10 dark:border-ink-dark/10 relative lo-fade-in">
        {variant === 'editorial' && (
          <div className="w-full h-full p-7 bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark flex flex-col justify-between relative">
            <div className="lo-grain" />
            <div className="flex justify-between items-center relative z-10 select-none">
              <div className="inline-flex items-center gap-1.5 font-display text-[16px] tracking-tight">
                <span className="w-2 h-2 rounded-full bg-accent dark:bg-accent-2" />
                <span>Love<em className="font-serif italic font-normal">Odds</em></span>
                <span className="font-mono text-[8px] tracking-widest text-ink-3 dark:text-ink-4 uppercase ml-0.5 px-1 py-0.2 border border-ink/10 dark:border-ink-dark/10 rounded">MX</span>
              </div>
              <span className="font-mono text-[9px] tracking-widest text-ink-3 dark:text-ink-4 uppercase">
                reporte demográfico
              </span>
            </div>

            <div className="my-auto relative z-10 flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 select-none">
                Mi estándar en {criteria.ubicacion}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-normal tracking-[-0.045em] text-[76px] leading-[0.85]">
                  {formattedPct}
                </span>
                <span className="font-display text-[28px] text-ink-3 dark:text-ink-4 translate-y-[-12px] select-none">
                  %
                </span>
              </div>
              <p className="text-[14.5px] leading-relaxed mt-2 text-ink-2 dark:text-ink-3">
                Aproximadamente <b className="font-mono font-semibold text-ink dark:text-ink-dark">{humanRatio}</b> adultos de la población mexicana cumplen con mis criterios.
              </p>
            </div>

            <div className="pt-4 border-t border-ink/10 dark:border-ink-dark/10 flex flex-col gap-2 relative z-10 select-none">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-[9px] tracking-wider text-ink-3 dark:text-ink-4 uppercase">Nivel</span>
                <span className="font-display text-base font-normal italic text-accent dark:text-accent-3">{tier.name}</span>
              </div>
              {most && (
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-[9px] tracking-wider text-ink-3 dark:text-ink-4 uppercase">Mayor limitante</span>
                  <span className="text-[12.5px] text-ink-2 dark:text-ink-3 truncate max-w-[65%]">{most.label}</span>
                </div>
              )}
              <span className="block font-mono text-[8px] tracking-[0.16em] uppercase text-ink-4 dark:text-ink-3 mt-1">
                *estimación oficial
              </span>
            </div>
          </div>
        )}

        {variant === 'mono' && (
          <div className="w-full h-full p-7 bg-ink text-bg-light dark:bg-bg-dark/10 dark:text-bg-light flex flex-col justify-between font-mono text-[11.5px] tracking-tight relative">
            <div className="flex justify-between items-center opacity-65 select-none">
              <span>// loveodds.mx/report</span>
              <span>{new Date().toISOString().slice(0, 10)}</span>
            </div>

            <div className="my-auto flex flex-col gap-5">
              <span className="opacity-70 select-none">
                $ loveodds --search {criteria.ubicacion.toLowerCase()} --gender {criteria.busca.toLowerCase()}
              </span>

              <div className="flex flex-col gap-2">
                <div className="font-display font-normal text-[86px] leading-[0.8] tracking-[-0.04em] text-[#E8AFA0] select-none">
                  {formattedPct}<span className="text-[34px] ml-1">%</span>
                </div>
                <div className="opacity-85 text-[12.5px]">
                  → {humanRatio}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 opacity-80 pt-4 border-t border-bg-light/10 select-none">
              <div>tier        :: <span className="text-[#E8AFA0]">{tier.name}</span></div>
              <div>n_estimada  :: {Math.round(result.finalN).toLocaleString()}</div>
              <div>limitante   :: {most ? most.label.toLowerCase() : "ninguna"}</div>
              <div>fuentes     :: INEGI · ENIGH · ENOE · ENSANUT (OFICIAL)</div>
            </div>
          </div>
        )}

        {variant === 'poster' && (
          <div className="w-full h-full p-7 bg-gradient-to-b from-accent to-[#3D0F1F] text-[#FAF5EE] flex flex-col justify-between relative overflow-hidden">
            {/* Big watermark scale background */}
            <div className="absolute right-[-24px] bottom-[-48px] font-display text-[320px] font-normal leading-[0.8] text-[#FAF5EE]/10 select-none pointer-events-none">
              {formattedPct.split('.')[0]}
            </div>

            <div className="relative z-10 flex justify-between items-center select-none">
              <div className="inline-flex items-center gap-1.5 font-display text-[16px] tracking-tight text-[#FAF5EE]">
                <span className="w-2 h-2 rounded-full bg-[#FAF5EE]" />
                <span>Love<em className="font-serif italic font-normal">Odds</em></span>
                <span className="font-mono text-[8px] tracking-widest text-[#FAF5EE]/70 uppercase ml-0.5 px-1 py-0.2 border border-[#FAF5EE]/20 rounded">MX</span>
              </div>
              <span className="font-mono text-[9px] tracking-widest text-[#FAF5EE]/75 uppercase">
                reporte oficial
              </span>
            </div>

            <div className="relative z-10 my-auto flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#FAF5EE]/80 select-none">
                Estándar en {criteria.ubicacion}
              </span>
              <h3 className="font-display text-[40px] font-normal leading-[1.02] tracking-[-0.015em] text-[#FAF5EE]">
                Mi estándar romántico es <i className="font-serif italic font-normal">{tier.name.toLowerCase()}</i>.
              </h3>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#FAF5EE]/20 flex justify-between select-none">
              <div>
                <span className="font-mono text-[9px] tracking-widest text-[#FAF5EE]/70 uppercase">
                  Probabilidad
                </span>
                <div className="font-display text-4xl leading-[1.1] mt-1 font-normal">
                  {formattedPct}%
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] tracking-widest text-[#FAF5EE]/70 uppercase">
                  Población N
                </span>
                <div className="font-display text-4xl leading-[1.1] mt-1 font-normal">
                  {Math.round(result.finalN).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Actions Buttons */}
      <div className="flex flex-col gap-2.5 w-full">
        <button
          onClick={handleShare}
          disabled={sharingLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-accent dark:bg-accent-2 text-bg-light dark:text-bg-dark rounded-md font-semibold text-[14px] hover:scale-[1.015] active:scale-[0.98] transition-all select-none shadow-shd-1 disabled:opacity-50"
        >
          {sharingLoading ? (
            <span className="w-4 h-4 border-2 border-bg-light dark:border-bg-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <LoIcon name="share" size={14} />
          )}
          {sharingLoading ? "Generando link..." : (typeof navigator !== 'undefined' && (navigator as any).share ? "Compartir Reporte" : (copied ? "¡Enlace Copiado!" : "Compartir Enlace"))}
        </button>

        <div className="flex gap-2.5 w-full">
          <button
            onClick={handleCopy}
            disabled={sharingLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-ink/15 dark:border-ink-dark/15 rounded-md font-semibold text-[13px] bg-elev-light dark:bg-elev-dark text-ink-2 dark:text-ink-3 hover:bg-ink/5 dark:hover:bg-ink-dark/5 active:scale-[0.985] transition-all select-none disabled:opacity-50"
          >
            <LoIcon name="copy" size={13} className="shrink-0" />
            {copied ? "¡Copiado!" : "Copiar Texto"}
          </button>
          <button
            onClick={handleDownloadPNG}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-ink/15 dark:border-ink-dark/15 rounded-md font-semibold text-[13px] bg-elev-light dark:bg-elev-dark text-ink-2 dark:text-ink-3 hover:bg-ink/5 dark:hover:bg-ink-dark/5 active:scale-[0.985] transition-all select-none"
          >
            <LoIcon name="sparkle" size={13} className="shrink-0" />
            Descargar Imagen
          </button>
        </div>
      </div>

      {/* Suggested share text card preview */}
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 dark:text-ink-4 select-none">
          Texto de resumen sugerido
        </div>
        <div className="p-4 rounded-lg bg-deep-light/40 dark:bg-deep-dark/40 border border-ink/5 dark:border-ink-dark/5 font-mono text-[11px] leading-relaxed text-ink-2 dark:text-ink-3 whitespace-pre-wrap select-text">
          {shareText}
        </div>
      </div>
    </div>
  );
};
export default ShareResultCard;
