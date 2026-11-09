import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Volume2, VolumeX, Maximize2, RotateCcw, Download, ArrowRight, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { estimateReadTime, copyToClipboard, speakText, stopSpeaking, renderMarkdown, exportAsMarkdown, downloadMarkdown } from '../lib/utils';

/* ─── MODE CONFIG ──────────────────────────────────────── */
export const MODE_CONFIG = {
  eli5: {
    key: 'eli5', level: 'LEVEL 01', title: '5-YEAR-OLD', subtitle: 'Pure Wonder',
    accent: '#F59E0B', glow: 'rgba(245,158,11,0.12)', glowBorder: 'rgba(245,158,11,0.32)',
    complexity: 1, tldrLabel: 'Core Idea',
    followUps: ['Make it simpler', 'Give me an analogy', 'Tell me a story'],
  },
  teen: {
    key: 'teen', level: 'LEVEL 02', title: 'TEENAGER', subtitle: 'Kinetic Clarity',
    accent: '#38BDF8', glow: 'rgba(56,189,248,0.12)', glowBorder: 'rgba(56,189,248,0.32)',
    complexity: 2, tldrLabel: 'Key Takeaway',
    followUps: ['Real-world example?', 'Why does this matter?', 'Quiz me on this'],
  },
  expert: {
    key: 'expert', level: 'LEVEL 03', title: 'ADULT / EXPERT', subtitle: 'Executive Precision',
    accent: '#10B981', glow: 'rgba(16,185,129,0.12)', glowBorder: 'rgba(16,185,129,0.32)',
    complexity: 3, tldrLabel: 'Executive Summary',
    followUps: ['Deep-dive mechanisms', 'Edge cases & caveats', 'Compare approaches'],
  },
};

/* ─── HELPERS ──────────────────────────────────────────── */
const TLDR_MARKERS = {
  eli5:   ['Core Idea:', '**Core Idea**'],
  teen:   ['Key Takeaway:', '**Key Takeaway**'],
  expert: ['Executive Summary:', '**Executive Summary**'],
};

function extractTLDR(text, mode) {
  if (!text) return '';
  for (const m of (TLDR_MARKERS[mode] || [])) {
    const idx = text.indexOf(m);
    if (idx !== -1) return text.slice(idx + m.length).trim();
  }
  const sentences = text.split('. ').filter(Boolean);
  return sentences.length > 1 ? sentences[sentences.length - 1].trim() + '.' : '';
}

function extractBody(text, mode) {
  if (!text) return text;
  for (const m of (TLDR_MARKERS[mode] || [])) {
    const idx = text.indexOf(m);
    if (idx !== -1) return text.slice(0, idx).trim();
  }
  const sentences = text.split('. ');
  return sentences.length > 1 ? sentences.slice(0, -1).join('. ') + '.' : text;
}

/* ─── COGNITIVE CARD ───────────────────────────────────── */
function CognitiveCard({ config, text, index, onFollowUp, showToast }) {
  const [copied,   setCopied]   = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const tldr = extractTLDR(text, config.key);
  const body = extractBody(text, config.key);

  /* Mouse glow tracking */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', move);
    return () => el.removeEventListener('mousemove', move);
  }, []);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Copied!', 'success');
    } catch { showToast('Copy failed', 'error'); }
  };

  const handleSpeak = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    speakText(text);
    setSpeaking(true);
    const ms = (text.split(' ').length / 2.5) * 1000;
    setTimeout(() => setSpeaking(false), ms);
  };

  const dots = [1, 2, 3].map(n => n <= config.complexity);

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card"
        style={{
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          '--mx': '50%', '--my': '50%',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = config.glowBorder;
          e.currentTarget.style.boxShadow = `inset 0 1px 0 0 rgba(255,255,255,0.12), 0 0 48px ${config.glow}`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 0 rgba(255,255,255,0.08)';
        }}
      >
        {/* Mouse radial glow overlay */}
        <div
          style={{
            position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
            opacity:0, transition:'opacity 0.3s',
            background: `radial-gradient(280px circle at var(--mx) var(--my), ${config.glow}, transparent 70%)`,
          }}
          className="group-hover:opacity-100"
          ref={el => {
            if (!el) return;
            const parent = el.parentElement;
            if (!parent) return;
            const show = () => { el.style.opacity = '1'; };
            const hide = () => { el.style.opacity = '0'; };
            parent.addEventListener('mouseenter', show);
            parent.addEventListener('mouseleave', hide);
          }}
        />

        {/* Accent top line */}
        <div style={{ height:'2px', background: `linear-gradient(90deg, transparent, ${config.accent}60, transparent)`, position:'relative', zIndex:1 }} />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'16px 18px 10px', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {/* Badge */}
            <div style={{
              width:'38px', height:'38px', borderRadius:'10px', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: config.glow, border: `1px solid ${config.glowBorder}`,
            }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:700, letterSpacing:'0.1em', color: config.accent }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'#52525B', marginBottom:'2px' }}>
                {config.level}
              </div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#F4F4F6', letterSpacing:'-0.02em', lineHeight:1.2 }}>
                {config.title}
              </div>
              <div style={{ fontSize:'11px', color: config.accent + 'AA', marginTop:'1px' }}>
                {config.subtitle}
              </div>
            </div>
          </div>

          {/* Actions + metrics */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
              {[
                { icon: copied ? <Check size={13} style={{color:'#10B981'}} /> : <Copy size={13} />, action: handleCopy, title:'Copy' },
                { icon: speaking ? <VolumeX size={13} /> : <Volume2 size={13} />, action: handleSpeak, title: speaking?'Stop':'Listen',
                  active: speaking, activeColor: '#38BDF8' },
                { icon: <Maximize2 size={13} />, action: () => setExpanded(true), title:'Expand' },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} title={btn.title} style={{
                  width:'28px', height:'28px', borderRadius:'8px', border:'none',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: btn.active ? `${btn.activeColor}18` : 'transparent',
                  color: btn.active ? btn.activeColor : '#52525B',
                  cursor:'pointer', transition:'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#A1A1AA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = btn.active ? `${btn.activeColor}18`:'transparent'; e.currentTarget.style.color = btn.active ? btn.activeColor:'#52525B'; }}
                >{btn.icon}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#52525B' }}>{estimateReadTime(text)}</span>
              <div style={{ display:'flex', gap:'3px' }}>
                {dots.map((lit, i) => (
                  <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background: lit ? config.accent : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TL;DR callout */}
        {tldr && (
          <div style={{
            margin:'0 16px 14px', padding:'10px 14px', borderRadius:'10px', position:'relative', zIndex:1,
            background: config.glow, border:`1px solid ${config.glowBorder}`,
            borderLeft: `2px solid ${config.accent}`,
          }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:config.accent, marginBottom:'4px' }}>
              {config.tldrLabel}
            </div>
            <p style={{ fontSize:'13px', lineHeight:1.65, color:'#F4F4F6', fontStyle:'italic', margin:0 }}>{tldr}</p>
          </div>
        )}

        {/* Body */}
        <div
          className="card-prose"
          style={{ flex:1, padding:'0 18px 14px', position:'relative', zIndex:1, overflow:'hidden' }}
          dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(body)}</p>` }}
        />

        {/* Follow-up footer */}
        <div style={{ padding:'10px 16px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {config.followUps.map(action => (
              <button key={action} onClick={() => onFollowUp(action, config.key)} style={{
                display:'flex', alignItems:'center', gap:'4px',
                padding:'5px 10px', borderRadius:'7px',
                border:'1px solid rgba(255,255,255,0.07)',
                background:'transparent', color:'#52525B',
                fontSize:'11px', cursor:'pointer', transition:'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#52525B'; e.currentTarget.style.background='transparent'; }}
              >
                <ChevronRight size={10} />
                {action}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
            onClick={() => setExpanded(false)}
          >
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }} />
            <motion.div
              initial={{ scale:0.94, y:24 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94, y:24 }}
              transition={{ ease:[0.16,1,0.3,1] }}
              onClick={e => e.stopPropagation()}
              style={{
                position:'relative', zIndex:1, width:'100%', maxWidth:'680px', maxHeight:'85vh',
                overflowY:'auto', borderRadius:'18px', padding:'28px',
                background:'rgba(12,12,18,0.98)',
                border:`1px solid ${config.glowBorder}`,
                boxShadow:`inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 80px ${config.glow}`,
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'#52525B', marginBottom:'4px' }}>{config.level}</div>
                  <h2 style={{ fontSize:'20px', fontWeight:700, color:'#F4F4F6', letterSpacing:'-0.03em', margin:0 }}>{config.title}</h2>
                </div>
                <button onClick={() => setExpanded(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#52525B', padding:'4px' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="card-prose" dangerouslySetInnerHTML={{ __html:`<p>${renderMarkdown(text)}</p>` }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── SKELETON CARD ────────────────────────────────────── */
function SkeletonCard({ index, stepMsg }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card"
      style={{ padding:'18px', display:'flex', flexDirection:'column', gap:'14px' }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div className="skeleton" style={{ width:'38px', height:'38px', borderRadius:'10px' }} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
          <div className="skeleton" style={{ height:'8px', width:'60px' }} />
          <div className="skeleton" style={{ height:'11px', width:'100px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height:'56px', borderRadius:'10px' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {[100, 88, 95, 78, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ height:'11px', width:`${w}%`, animationDelay:`${i*0.08}s` }} />
        ))}
      </div>
      {stepMsg && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'4px' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#38BDF8', display:'inline-block', animation:'pulse 1s infinite' }} />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'#52525B' }}>{stepMsg}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── LOADING STEPS ────────────────────────────────────── */
const STEPS = [
  '[01] Deconstructing core concept...',
  '[02] Synthesizing playground analogy (Age 5)...',
  '[03] Mapping real-world intuition (Teen)...',
  '[04] Compiling executive technical synthesis...',
];

const MODES = ['eli5', 'teen', 'expert'];

/* ─── RESULTS SECTION ──────────────────────────────────── */
export default function ResultsSection({
  results, loading, query, setQuery, viewMode, setViewMode,
  focusCard, setFocusCard, setAmbientMode,
  onNewQuery, onResubmit, showToast
}) {
  const [step, setStep]       = useState(0);
  const [inputVal, setInputVal] = useState(query || '');

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const iv = setInterval(() => setStep(p => (p + 1) % STEPS.length), 850);
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => { setInputVal(query || ''); }, [query]);

  const handleFollowUp = useCallback((action, mode) => {
    const q = `Regarding "${results?.query}": ${action} (${mode} level)`;
    setQuery(q);
    onResubmit(q);
  }, [results, setQuery, onResubmit]);

  const handleExport = useCallback(() => {
    if (!results) return;
    const md = exportAsMarkdown(results.query, results);
    downloadMarkdown(md, `eli5-${results.query.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.md`);
    showToast('Markdown exported!', 'success');
  }, [results, showToast]);

  return (
    <div style={{ padding:'0 16px 60px' }}>
      <div style={{ maxWidth:'1300px', margin:'0 auto' }}>

        {/* ── Toolbar row ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap',
          marginBottom:'18px',
          padding:'12px 16px',
          borderRadius:'14px',
          background:'rgba(18,18,24,0.70)',
          border:'1px solid rgba(255,255,255,0.07)',
          backdropFilter:'blur(16px)',
          boxShadow:'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        }}>
          {/* New Query */}
          <button onClick={onNewQuery} style={{
            display:'flex', alignItems:'center', gap:'6px',
            padding:'6px 12px', borderRadius:'9px',
            border:'1px solid rgba(255,255,255,0.09)',
            background:'transparent', color:'#A1A1AA',
            fontSize:'12px', fontWeight:500, cursor:'pointer', flexShrink:0,
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.color='#F4F4F6'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#A1A1AA'; }}
          >
            <RotateCcw size={12} /> New Query
          </button>

          {/* Inline refine input */}
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { setQuery(inputVal); onResubmit(inputVal); } }}
            placeholder="Refine your query…"
            style={{
              flex:1, minWidth:'140px',
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'9px', padding:'6px 12px',
              color:'#F4F4F6', fontSize:'13px', outline:'none',
              fontFamily:'var(--font-body)',
              transition:'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.20)'}
            onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
          />

          {/* Re-decode */}
          <button
            onClick={() => { setQuery(inputVal); onResubmit(inputVal); }}
            disabled={!inputVal.trim() || loading}
            style={{
              display:'flex', alignItems:'center', gap:'5px',
              padding:'6px 14px', borderRadius:'9px',
              background:'#F4F4F6', color:'#09090B',
              fontSize:'12px', fontWeight:600, border:'none',
              cursor: (!inputVal.trim() || loading) ? 'not-allowed' : 'pointer',
              opacity: (!inputVal.trim() || loading) ? 0.35 : 1, flexShrink:0,
              transition:'all 0.15s',
            }}
          >
            <ArrowRight size={12} /> Re-decode
          </button>

          {/* Divider */}
          <div style={{ width:'1px', height:'24px', background:'rgba(255,255,255,0.08)', flexShrink:0, margin:'0 4px' }} />

          {/* View toggle */}
          <div style={{ display:'flex', gap:'2px', padding:'3px', borderRadius:'9px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            {[['bento','Split 3×'],['focus','Spotlight']].map(([v,l]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding:'4px 10px', borderRadius:'7px', border:'none', cursor:'pointer',
                fontSize:'11px', fontWeight:500,
                background: viewMode===v ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: viewMode===v ? '#F4F4F6' : '#52525B',
                transition:'all 0.15s',
              }}>{l}</button>
            ))}
          </div>

          {/* Cognitive mode selector (focus only) */}
          {viewMode === 'focus' && results && !loading && (
            <div style={{ display:'flex', gap:'2px', padding:'3px', borderRadius:'9px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              {MODES.map((m, i) => {
                const cfg = MODE_CONFIG[m];
                const active = focusCard === m;
                return (
                  <button key={m} onClick={() => { setFocusCard(m); setAmbientMode(m); }} style={{
                    padding:'4px 10px', borderRadius:'7px', border:'none', cursor:'pointer',
                    fontSize:'11px', fontFamily:'var(--font-mono)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em',
                    background: active ? cfg.glow : 'transparent',
                    color: active ? cfg.accent : '#52525B',
                    transition:'all 0.15s',
                  }}>
                    {['5YRS','TEEN','ADULT'][i]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Export */}
          {results && !loading && (
            <button onClick={handleExport} style={{
              display:'flex', alignItems:'center', gap:'5px',
              padding:'6px 12px', borderRadius:'9px',
              border:'1px solid rgba(255,255,255,0.08)',
              background:'transparent', color:'#52525B',
              fontSize:'11px', fontWeight:500, cursor:'pointer', flexShrink:0,
              transition:'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#52525B'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
            >
              <Download size={12} /> Export MD
            </button>
          )}

          {/* Query label */}
          {results && !loading && (
            <div style={{ display:'flex', flexDirection:'column', marginLeft:'auto', textAlign:'right', flexShrink:1, minWidth:0, maxWidth:'240px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.12em', color:'#52525B' }}>Query</span>
              <span style={{ fontSize:'12px', fontWeight:600, color:'#F4F4F6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{results.query}</span>
            </div>
          )}
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' }}>
            {[0,1,2].map(i => <SkeletonCard key={i} index={i} stepMsg={i === step % 3 ? STEPS[step] : null} />)}
          </div>
        ) : results ? (
          viewMode === 'bento' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px' }}>
              {MODES.map((m, i) => (
                <CognitiveCard
                  key={m}
                  config={MODE_CONFIG[m]}
                  text={results[m]}
                  index={i}
                  onFollowUp={handleFollowUp}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            /* Focus / spotlight */
            <div>
              {/* Tab bar */}
              <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'16px' }}>
                {MODES.map(m => {
                  const cfg = MODE_CONFIG[m];
                  const active = focusCard === m;
                  return (
                    <button key={m} onClick={() => { setFocusCard(m); setAmbientMode(m); }} style={{
                      flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                      padding:'10px 16px', background:'transparent', border:'none',
                      cursor:'pointer', position:'relative',
                      fontSize:'13px', fontWeight:500,
                      color: active ? '#F4F4F6' : '#52525B',
                      transition:'color 0.2s',
                    }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em' }}>{cfg.level}</span>
                      <span>{cfg.title}</span>
                      {active && (
                        <motion.div
                          layoutId="focus-tab-line"
                          style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:cfg.accent }}
                          transition={{ type:'spring', stiffness:500, damping:40 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={focusCard}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                  transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
                >
                  <CognitiveCard
                    config={MODE_CONFIG[focusCard]}
                    text={results[focusCard]}
                    index={0}
                    onFollowUp={handleFollowUp}
                    showToast={showToast}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
