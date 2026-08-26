import { useState } from 'react';
import axios from 'axios';

function SimplifyForm() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('eli5');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please paste some text first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await axios.post('http://localhost:5000/api/simplify', {
        text,
        level
      });
      setResult(response.data.simplifiedText);
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>ELI5 Universal Simplifier</h1>
      <p>Paste any complex text and get it explained simply.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste legal, medical, or technical text here..."
          rows={8}
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="level">Explain like I'm: </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
          >
            <option value="eli5">5 years old (ELI5)</option>
            <option value="teen">A teenager</option>
            <option value="expert">An expert</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Simplifying...' : 'Simplify'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem', padding: '0.75rem', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Simplified:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
        </div>
      )}
    </div>
  );
}

export default SimplifyForm;