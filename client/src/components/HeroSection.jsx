import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Dna, TrendingUp, Atom, Brain } from 'lucide-react';

const PLACEHOLDERS = [
  'Explain Zero-Knowledge Proofs...',
  'How does Quantitative Easing affect inflation?',
  'Why does time slow down near a black hole?',
  'What is CRISPR gene editing?',
  'How do transformer models in AI work?',
  "Explain the prisoner's dilemma in game theory...",
];

const CHIPS = [
  { icon: Brain,       label: 'Transformers in AI',  query: 'How do transformer models in AI work?' },
  { icon: Dna,         label: 'CRISPR',               query: 'What is CRISPR gene editing and how does it work?' },
  { icon: TrendingUp,  label: 'Options Greeks',       query: 'Explain options Greeks: delta, gamma, theta, and vega in finance' },
  { icon: Atom,        label: 'Hawking Radiation',    query: 'What is Hawking Radiation and why does it matter?' },
  { icon: Zap,         label: 'Zero-Knowledge Proofs',query: 'Explain Zero-Knowledge Proofs' },
];

const MODE_OPTS = [
  { value: 'all',    label: 'All 3 Modes' },
  { value: 'eli5',   label: '5-Year-Old'  },
  { value: 'teen',   label: 'Teen'         },
  { value: 'expert', label: 'Expert'       },
];

export default function HeroSection({ query, setQuery, onSubmit, inputRef, activeMode, setActiveMode, hasResults }) {
  const [phIdx,    setPhIdx]    = useState(0);
  const [phText,   setPhText]   = useState('');
  const [focused,  setFocused]  = useState(false);
  const [charCount,setCharCount]= useState(0);

  /* Typewriter placeholder */
  useEffect(() => {
    const target = PLACEHOLDERS[phIdx];
    let i = 0;
    setPhText('');
    const iv = setInterval(() => {
      if (i <= target.length) { setPhText(target.slice(0, i)); i++; }
      else {
        clearInterval(iv);
        setTimeout(() => setPhIdx(p => (p + 1) % PLACEHOLDERS.length), 2500);
      }
    }, 42);
    return () => clearInterval(iv);
  }, [phIdx]);

  const submit = () => onSubmit(query);

  return (
    /* When results exist, shrink to compact top bar; otherwise show full hero */
    <section
      style={{
        padding: hasResults ? '28px 16px 24px' : '0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: hasResults ? 'flex-start' : 'center',
        minHeight: hasResults ? 'auto' : 'calc(100vh - 72px)',
        transition: 'min-height 0.4s ease, padding 0.4s ease',
      }}
    >
      {/* ── Status badge (hide when compact) ── */}
      {!hasResults && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '32px',
            padding: '7px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(18,18,24,0.60)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ position:'relative', display:'flex', width:'8px', height:'8px' }}>
            <span
              className="ping"
              style={{
                position:'absolute', inset:0,
                borderRadius:'50%',
                background:'#10B981', opacity:0.75,
              }}
            />
            <span style={{ position:'relative', borderRadius:'50%', background:'#10B981', width:'8px', height:'8px', display:'block' }} />
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.14em', color:'#A1A1AA' }}>
            Multi-Tier Knowledge Synthesis
          </span>
        </div>
      )}

      {/* ── Headline (hide when compact) ── */}
      {!hasResults && (
        <>
          <h1
            style={{
              textAlign:'center', fontFamily:'var(--font-display)',
              fontWeight:800, lineHeight:1.08, letterSpacing:'-0.03em',
              marginBottom:'20px', maxWidth:'780px',
              fontSize:'clamp(2.2rem, 6vw, 4rem)',
            }}
          >
            <span className="grad-white">Complexity, Decoded</span>
            <br />
            <span className="grad-muted">at Every Altitude.</span>
          </h1>

          <p
            style={{
              textAlign:'center', fontSize:'clamp(0.95rem, 2vw, 1.1rem)',
              lineHeight:1.7, marginBottom:'40px', maxWidth:'600px',
              color:'#A1A1AA',
            }}
          >
            Ask anything in quantum physics, economics, code, or philosophy.
            Instant clarity for a{' '}
            <span style={{ color:'#F59E0B' }}>5-year-old</span>,{' '}
            <span style={{ color:'#38BDF8' }}>a teenager</span>, and{' '}
            <span style={{ color:'#10B981' }}>a domain expert</span>.
          </p>
        </>
      )}

      {/* ── Omni-Prompt Input ── */}
      <div
        style={{
          width: '100%',
          maxWidth: hasResults ? '860px' : '780px',
          position: 'relative',
          transition: 'max-width 0.4s ease',
          filter: focused ? 'drop-shadow(0 0 28px rgba(120,119,198,0.18))' : 'none',
        }}
      >
        {/* Spinning conic border on focus */}
        {focused && <div className="conic-border" style={{ borderRadius:'18px' }} />}

        <div
          className="glass-card"
          style={{
            position: 'relative', zIndex: 1,
            border: focused ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px', overflow: 'hidden',
            background: focused ? 'rgba(18,18,24,0.92)' : 'rgba(18,18,24,0.70)',
          }}
        >
          <textarea
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCharCount(e.target.value.length); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? '' : phText}
            rows={hasResults ? 2 : 3}
            maxLength={5000}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
              padding: hasResults ? '14px 20px 10px' : '20px 20px 12px',
              fontSize: '15px', lineHeight: 1.65,
              color: '#F4F4F6', fontFamily: 'var(--font-body)',
              caretColor: '#A1A1AA',
            }}
          />

          {/* Control strip */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px 12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              gap: '8px', flexWrap: 'wrap',
            }}
          >
            {/* Mode pills */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                padding: '3px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              {MODE_OPTS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setActiveMode(opt.value)}
                  style={{
                    padding: '4px 10px', borderRadius: '9px',
                    fontSize: '11px', fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: activeMode === opt.value ? 'rgba(255,255,255,0.10)' : 'transparent',
                    color: activeMode === opt.value ? '#F4F4F6' : '#A1A1AA',
                    boxShadow: activeMode === opt.value ? 'inset 0 1px 0 0 rgba(255,255,255,0.12)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Right strip */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
              {charCount > 0 && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'#52525B' }}>
                  {charCount}/5000
                </span>
              )}
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'#52525B', display:'flex', alignItems:'center', gap:'4px' }}>
                <kbd style={{ border:'1px solid rgba(82,82,91,0.4)', borderRadius:'4px', padding:'1px 5px', fontSize:'10px' }}>↵</kbd>
                submit
              </span>
              <button
                onClick={submit}
                disabled={!query.trim()}
                style={{
                  display:'flex', alignItems:'center', gap:'6px',
                  padding:'7px 16px', borderRadius:'11px',
                  background: query.trim() ? '#F4F4F6' : 'rgba(244,244,246,0.15)',
                  color: query.trim() ? '#09090B' : '#52525B',
                  fontSize:'13px', fontWeight:600, border:'none', cursor: query.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  transition: 'all 0.15s',
                }}
              >
                Decode
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Starter chips (hide when compact) ── */}
      {!hasResults && (
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '8px', marginTop: '20px', maxWidth: '680px',
          }}
        >
          {CHIPS.map(chip => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                onClick={() => { setQuery(chip.query); onSubmit(chip.query); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 14px', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(18,18,24,0.60)',
                  color: '#A1A1AA', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(28,28,38,0.90)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                  e.currentTarget.style.color = '#F4F4F6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(18,18,24,0.60)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#A1A1AA';
                }}
              >
                <Icon size={12} style={{ opacity: 0.7 }} />
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
