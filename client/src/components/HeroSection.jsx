import { useEffect, useState } from 'react';
import { ArrowRight, Atom, Brain, Dna, Eraser, TrendingUp } from 'lucide-react';

const PLACEHOLDERS = [
  'Explain how transformer models work...',
  'Why does inflation affect prices?',
  'What is CRISPR gene editing?',
  'Explain the prisoner’s dilemma...',
];

const TOPICS = [
  { icon: Brain, label: 'Transformers in AI', query: 'How do transformer models in AI work?' },
  { icon: Dna, label: 'CRISPR', query: 'What is CRISPR gene editing and how does it work?' },
  { icon: TrendingUp, label: 'Inflation', query: 'Why does inflation affect prices?' },
  { icon: Atom, label: 'Black holes', query: 'Why does time slow down near a black hole?' },
];

const LEVELS = [
  { value: 'eli5', label: 'ELI5', title: 'Very simple', description: 'Short sentences and everyday analogies.', color: '#F59E0B' },
  { value: 'teen', label: 'Teen', title: 'Balanced clarity', description: 'Relatable examples and moderate terminology.', color: '#38BDF8' },
  { value: 'expert', label: 'Expert', title: 'Technical depth', description: 'Precise language and deeper context.', color: '#10B981' },
];

export default function HeroSection({ query, setQuery, level, setLevel, onSubmit, inputRef, hasResults, disabled, onClear }) {
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const target = PLACEHOLDERS[placeholderIndex];
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setPlaceholder(target.slice(0, index));
      if (index >= target.length) {
        window.clearInterval(timer);
        window.setTimeout(() => setPlaceholderIndex(current => (current + 1) % PLACEHOLDERS.length), 2200);
      }
    }, 35);
    return () => window.clearInterval(timer);
  }, [placeholderIndex]);

  return (
    <section className={`px-4 flex flex-col items-center ${hasResults ? 'pt-7 pb-5' : 'min-h-[calc(100vh-84px)] justify-center'}`}>
      {!hasResults && (
        <>
          <div className="status-badge"><span className="status-dot" /> AI learning companion</div>
          <h1 className="text-center max-w-3xl text-5xl sm:text-6xl font-extrabold leading-tight tracking-[-0.04em] mb-5">
            <span className="grad-white">Complex ideas.</span><br />
            <span className="grad-muted">Simply explained.</span>
          </h1>
          <p className="text-center max-w-xl text-base sm:text-lg leading-7 mb-9">
            Understand anything at your level with a clear explanation, a real-world example, key takeaways, and a quick quiz.
          </p>
        </>
      )}

      <div className={`w-full max-w-3xl ${hasResults ? '' : 'mt-24 sm:mt-32'}`}>
        <div className="glass-card overflow-hidden">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder={placeholder}
            rows={hasResults ? 2 : 4}
            maxLength={5000}
            disabled={disabled}
            aria-label="Topic or question"
            className="w-full bg-transparent border-0 outline-none resize-none p-5 text-[15px] leading-7 text-[#F4F4F6] placeholder:text-[#52525B]"
          />
          <div className="border-t border-white/[.06] p-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 grid grid-cols-3 gap-2 min-w-[270px]">
              {LEVELS.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setLevel(item.value)}
                  aria-pressed={level === item.value}
                  className="level-option text-left"
                  style={{ '--level-color': item.color, borderColor: level === item.value ? `${item.color}66` : undefined, background: level === item.value ? `${item.color}14` : undefined }}
                >
                  <strong>{item.label}</strong>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {query && <button type="button" className="icon-button" onClick={onClear} title="Clear input"><Eraser size={14} /></button>}
              <span className="text-[10px] font-mono text-[#52525B]">{query.length}/5000</span>
              <button type="button" onClick={() => onSubmit()} disabled={disabled || !query.trim()} className="primary-button">
                {disabled ? 'Thinking…' : 'Explain'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
        {!hasResults && <p className="text-center text-[11px] text-[#52525B] mt-3">Choose a level above · Press Enter to explain</p>}
      </div>

      {!hasResults && (
        <div className="flex flex-wrap justify-center gap-2 mt-7 max-w-2xl">
          {TOPICS.map(({ icon: Icon, label, query: topic }) => (
            <button type="button" key={label} onClick={() => { setQuery(topic); onSubmit(topic, level); }} className="topic-chip">
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
