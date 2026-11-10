import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ResultsSection from './components/ResultsSection';
import HistoryDrawer from './components/HistoryDrawer';
import Toast from './components/Toast';
import AmbientBackground from './components/AmbientBackground';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem('eli5_history') || '[]');
    return Array.isArray(stored) ? stored.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('eli5');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(readHistory);
  const [toast, setToast] = useState(null);
  const [ambientMode, setAmbientMode] = useState('idle');
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const saveHistory = useCallback((entry) => {
    setHistory(previous => {
      const updated = [entry, ...previous.filter(item => item.query !== entry.query)].slice(0, 20);
      localStorage.setItem('eli5_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(async (submittedQuery = query, submittedLevel = level) => {
    const text = submittedQuery.trim();
    if (!text) {
      showToast('Please enter a topic or question first.', 'error');
      inputRef.current?.focus();
      return;
    }

    setQuery(text);
    setLevel(submittedLevel);
    setLoading(true);
    setError(null);
    setResults(null);
    setAmbientMode('loading');

    try {
      const response = await fetch(`${API_URL}/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level: submittedLevel }),
        signal: AbortSignal.timeout(45000),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || `Request failed (${response.status})`);
      }

      const entry = {
        ...payload.data,
        query: text,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      };
      setResults(entry);
      saveHistory(entry);
      setAmbientMode(submittedLevel);
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (requestError) {
      const message = requestError.name === 'TimeoutError'
        ? 'The request took too long. Please try again.'
        : requestError.message || 'Unable to generate an explanation.';
      setError(message);
      setAmbientMode('idle');
    } finally {
      setLoading(false);
    }
  }, [level, query, saveHistory, showToast]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setAmbientMode('idle');
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.matches('textarea, input')) return;
      if (event.key === '/' || (event.metaKey && event.key === 'k')) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] relative overflow-x-hidden">
      <AmbientBackground mode={ambientMode} loading={loading} />
      <Navbar onHistoryOpen={() => setHistoryOpen(true)} />
      <main className="relative z-10">
        <HeroSection
          query={query}
          setQuery={setQuery}
          level={level}
          setLevel={setLevel}
          onSubmit={(text = query, selectedLevel = level) => handleSubmit(text, selectedLevel)}
          inputRef={inputRef}
          hasResults={Boolean(results || loading || error)}
          disabled={loading}
          onClear={() => setQuery('')}
        />
        {(results || loading || error) && (
          <div ref={resultsRef}>
            <ResultsSection
              results={results}
              loading={loading}
              error={error}
              level={level}
              onRetry={() => handleSubmit(query, level)}
              onNewQuery={clearResults}
              onRegenerate={() => handleSubmit(query, level)}
              showToast={showToast}
            />
          </div>
        )}
      </main>
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onLoad={(entry) => {
          setQuery(entry.query);
          setLevel(entry.level);
          setResults(entry);
          setError(null);
          setHistoryOpen(false);
          setAmbientMode(entry.level);
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('eli5_history');
        }}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
