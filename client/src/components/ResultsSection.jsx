import { useState } from 'react';
import { Check, Copy, Download, HelpCircle, RefreshCw, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { copyToClipboard, downloadMarkdown, exportAsMarkdown, speakText, stopSpeaking } from '../lib/utils';

const LEVEL_LABELS = { eli5: 'ELI5 · Very simple', teen: 'Teen · Balanced clarity', expert: 'Expert · Technical depth' };

function LoadingState() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-24 w-full" />
      <p className="text-xs text-[#52525B]">Building an explanation at your level…</p>
    </div>
  );
}

function ErrorState({ error, onRetry, onNewQuery }) {
  return (
    <div className="glass-card p-7 text-center border-red-400/20">
      <div className="text-red-300 font-semibold mb-2">We couldn’t generate that explanation</div>
      <p className="text-sm mb-5">{error}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="primary-button" onClick={onRetry}><RefreshCw size={14} /> Retry</button>
        <button type="button" className="secondary-button" onClick={onNewQuery}>Return to input</button>
      </div>
    </div>
  );
}

function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [finished, setFinished] = useState(false);

  const submitAnswer = (index) => {
    if (answers[index] === undefined) return;
    setSubmitted(current => ({ ...current, [index]: true }));
  };

  const score = questions.reduce((total, question, index) =>
    total + (submitted[index] && answers[index] === question.correctAnswer ? 1 : 0), 0);

  const retry = () => {
    setAnswers({});
    setSubmitted({});
    setFinished(false);
  };

  return (
    <section className="glass-card p-5 sm:p-7">
      <div className="section-kicker">Knowledge check</div>
      <h2 className="section-title">Test your understanding</h2>
      <div className="space-y-5 mt-5">
        {questions.map((question, index) => {
          const isSubmitted = submitted[index];
          const isCorrect = answers[index] === question.correctAnswer;
          return (
            <div key={`${question.question}-${index}`} className="quiz-question">
              <p className="font-semibold text-[#F4F4F6] mb-3">{index + 1}. {question.question}</p>
              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    type="button"
                    key={option}
                    disabled={isSubmitted}
                    onClick={() => setAnswers(current => ({ ...current, [index]: optionIndex }))}
                    className={`quiz-option ${answers[index] === optionIndex ? 'selected' : ''} ${isSubmitted && optionIndex === question.correctAnswer ? 'correct' : ''} ${isSubmitted && answers[index] === optionIndex && !isCorrect ? 'incorrect' : ''}`}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                  </button>
                ))}
              </div>
              {!isSubmitted && <button type="button" className="secondary-button mt-3" disabled={answers[index] === undefined} onClick={() => submitAnswer(index)}>Check answer</button>}
              {isSubmitted && <p className={`text-sm mt-3 ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>{isCorrect ? 'Correct! ' : `Not quite. The correct answer is ${String.fromCharCode(65 + question.correctAnswer)}. `}{question.explanation}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-white/[.07]">
        <button type="button" className="secondary-button" onClick={retry}><RotateCcw size={14} /> Retry quiz</button>
        <button type="button" className="primary-button" disabled={Object.keys(submitted).length !== questions.length} onClick={() => setFinished(true)}>See score</button>
      </div>
      {finished && <div className="score-banner mt-4"><strong>{score}/{questions.length}</strong><span>{score === questions.length ? 'Perfect understanding.' : 'Review the explanation and try again.'}</span></div>}
    </section>
  );
}

function getQuizIdentity(results) {
  if (results.id) return results.id;
  return [
    results.level,
    results.query,
    results.explanation,
    JSON.stringify(results.quiz)
  ].join(':');
}

export default function ResultsSection({ results, loading, error, level, onRetry, onNewQuery, onRegenerate, onFollowUp, showToast }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  if (loading) return <div className="max-w-3xl mx-auto px-4 pb-16"><LoadingState /></div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 pb-16"><ErrorState error={error} onRetry={onRetry} onNewQuery={onNewQuery} /></div>;
  if (!results) return null;

  const submitFollowUp = async (event) => {
    event.preventDefault();
    if (!followUp.trim() || followUpLoading) return;
    setFollowUpLoading(true);
    try {
      await onFollowUp(followUp);
      setFollowUp('');
    } finally {
      setFollowUpLoading(false);
    }
  };

  const copy = async () => {
    await copyToClipboard(`${results.explanation}\n\nExample\n${results.example}\n\nKey takeaways\n${results.keyTakeaways.map(item => `- ${item}`).join('\n')}`);
    setCopied(true);
    showToast('Explanation copied!', 'success');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const readAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speakText(`${results.explanation}. Example: ${results.example}`);
    setSpeaking(true);
    window.setTimeout(() => setSpeaking(false), Math.max(3000, results.explanation.split(/\s+/).length * 350));
  };

  const exportResult = () => {
    downloadMarkdown(exportAsMarkdown(results.query, results), `eli5-${results.query.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.md`);
    showToast('Markdown exported!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <div className="section-kicker">Your explanation</div>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 break-words">{results.topic}</h2>
          <p className="text-xs mt-1">{LEVEL_LABELS[level]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="secondary-button" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>
          <button type="button" className="secondary-button" onClick={readAloud}>{speaking ? <VolumeX size={14} /> : <Volume2 size={14} />} {speaking ? 'Stop' : 'Listen'}</button>
          <button type="button" className="secondary-button" onClick={exportResult}><Download size={14} /> Export</button>
        </div>
      </div>

      <section className="glass-card p-5 sm:p-7">
        <div className="section-kicker">The idea</div>
        <div className="card-prose mt-4"><ReactMarkdown>{results.explanation}</ReactMarkdown></div>
        <div className="mt-7 rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-5">
          <div className="section-kicker text-amber-300">Real-world example</div>
          <div className="card-prose mt-3"><ReactMarkdown>{results.example}</ReactMarkdown></div>
        </div>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-sky-300" />
          <div>
            <div className="section-kicker">Keep learning</div>
            <h2 className="section-title">Ask a follow-up question</h2>
          </div>
        </div>
        <p className="text-sm mt-3">Ask about this explanation and the answer will use the current topic as context.</p>
        <form onSubmit={submitFollowUp} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            value={followUp}
            onChange={(event) => setFollowUp(event.target.value)}
            placeholder="Can you give me another example?"
            maxLength={2000}
            disabled={followUpLoading}
            aria-label="Follow-up question"
            className="flex-1 rounded-lg border border-white/[.1] bg-white/[.04] px-3 py-2 text-sm text-[#F4F4F6] outline-none placeholder:text-[#52525B] focus:border-sky-300/50"
          />
          <button type="submit" className="primary-button" disabled={followUpLoading || !followUp.trim()}>
            {followUpLoading ? 'Asking…' : 'Ask'}
          </button>
        </form>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <div className="section-kicker">Remember this</div>
        <h2 className="section-title">Key takeaways</h2>
        <ul className="takeaway-list mt-4">{results.keyTakeaways.map(item => <li key={item}><Check size={15} /> <span>{item}</span></li>)}</ul>
      </section>

      <Quiz key={getQuizIdentity(results)} questions={results.quiz} />

      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <button type="button" className="secondary-button" onClick={onRegenerate}><RefreshCw size={14} /> Regenerate</button>
        <button type="button" className="secondary-button" onClick={onNewQuery}>New topic</button>
      </div>
    </div>
  );
}
