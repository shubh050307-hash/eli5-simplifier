import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ResultsSection from './components/ResultsSection';
import HistoryDrawer from './components/HistoryDrawer';
import Toast from './components/Toast';
import AmbientBackground from './components/AmbientBackground';
import { DEMO_RESPONSES } from './lib/demoData';

export default function App() {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [activeMode, setActiveMode] = useState('all');
  const [viewMode, setViewMode]     = useState('bento');
  const [focusCard, setFocusCard]   = useState('eli5');
  const [toast, setToast]           = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ambientMode, setAmbientMode] = useState('idle');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eli5_history') || '[]'); }
    catch { return []; }
  });

  const inputRef    = useRef(null);
  const resultsRef  = useRef(null);

  /* ── Keyboard shortcuts ─────────────────── */
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      if (e.key === '/' || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (results && !loading) {
        if (e.key === '1') setFocusCard('eli5');
        if (e.key === '2') setFocusCard('teen');
        if (e.key === '3') setFocusCard('expert');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, loading]);

  /* ── Toast helper ───────────────────────── */
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  /* ── Submit handler ─────────────────────── */
  const handleSubmit = useCallback(async (submittedQuery) => {
    const q = (submittedQuery || query).trim();
    if (!q) { showToast('Please enter a question first.', 'error'); return; }

    setLoading(true);
    setResults(null);
    setAmbientMode('loading');

    // Scroll to results area smoothly
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const res = await fetch('http://localhost:5000/api/simplify/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: q, inputType: 'general' }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      const entry = { query: q, ...data, timestamp: Date.now(), id: crypto.randomUUID() };
      setResults(entry);
      setAmbientMode('eli5');
      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, 20);
        localStorage.setItem('eli5_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      const isTimeout = err.name === 'TimeoutError';
      showToast(
        isTimeout ? 'Request timed out — showing demo.' : `${err.message} — showing demo.`,
        'warning'
      );
      const demo = DEMO_RESPONSES[q] || DEMO_RESPONSES['__default__'];
      setResults({ query: q, ...demo, timestamp: Date.now() });
      setAmbientMode('eli5');
    } finally {
      setLoading(false);
    }
  }, [query, showToast]);

  /* ── History load ───────────────────────── */
  const handleHistoryLoad = useCallback((entry) => {
    setQuery(entry.query);
    setResults(entry);
    setHistoryOpen(false);
    setAmbientMode('eli5');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] relative overflow-x-hidden">
      {/* Fixed ambient canvas */}
      <AmbientBackground mode={ambientMode} loading={loading} />

      {/* Sticky navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onHistoryOpen={() => setHistoryOpen(true)}
      />

      {/* ── SINGLE PAGE LAYOUT ── */}
      <main className="relative z-10">

        {/* Hero — always visible */}
        <HeroSection
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          hasResults={!!(results || loading)}
        />

        {/* Results — slides in below hero when query submitted */}
        {(results || loading) && (
          <div ref={resultsRef}>
            <ResultsSection
              results={results}
              loading={loading}
              query={query}
              setQuery={setQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              focusCard={focusCard}
              setFocusCard={setFocusCard}
              ambientMode={ambientMode}
              setAmbientMode={setAmbientMode}
              onNewQuery={() => {
                setResults(null);
                setLoading(false);
                setAmbientMode('idle');
                setTimeout(() => {
                  inputRef.current?.focus();
                  inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 80);
              }}
              onResubmit={handleSubmit}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      {/* History slide-over */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onLoad={handleHistoryLoad}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('eli5_history');
        }}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
