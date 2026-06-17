import React, { useState } from 'react';
import './DashboardPage.css';

const DashboardPage = () => {
  const [text, setText] = useState('');
  const [maxCards, setMaxCards] = useState(5);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const generate = async () => {
    setError(null);
    setLoading(true);
    setCards([]);
    try {
      const res = await fetch('http://localhost:8000/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, maxCards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setCards(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGenerated = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/ai/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, maxCards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setCards(data.data || []);
      setMessage('Saved to your account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCard = async (c) => {
    const payload = `Q: ${c.question || c.front || c.q}\nA: ${c.answer || c.back || c.a}`;
    try {
      await navigator.clipboard.writeText(payload);
      setMessage('Copied to clipboard');
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setError('Copy failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generate Flashcards</h2>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text to generate flashcards"
          rows={8}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Max cards:{' '}
          <input type="number" value={maxCards} min={1} max={50} onChange={(e) => setMaxCards(Number(e.target.value))} />
        </label>
      </div>
      <div style={{ marginTop: 8 }} className="controls">
        <button className="generate-btn" onClick={generate} disabled={loading || !text.trim()}>{loading ? 'Generating...' : 'Generate'}</button>
        <button className="generate-btn" onClick={saveGenerated} disabled={loading || !text.trim()}>Save to account</button>
        {message && <span style={{ color: '#059669' }}>{message}</span>}
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ marginTop: 16 }}>
        {cards.length > 0 && (
          <div>
            <h3>Flashcards</h3>
            <div className="flashcards-list">
              {cards.map((c, i) => (
                <div className="card" key={i}>
                  <div><strong>Q:</strong> {c.question || c.front || c.q}</div>
                  <div style={{ marginTop: 6 }}><strong>A:</strong> {c.answer || c.back || c.a}</div>
                  <div style={{ marginTop: 6 }}><strong>Difficulty:</strong> {c.difficulty || 'medium'}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => copyCard(c)} style={{ marginRight: 8 }}>Copy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;