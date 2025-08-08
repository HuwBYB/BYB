import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'byb:todayBigGoal';

export default function BigGoalPlanner() {
  const [goal, setGoal] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  // Load saved goal on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { goal, savedAt } = JSON.parse(raw);
      setGoal(goal || '');
      setSavedAt(savedAt || null);
    } catch {}
  }, []);

  // Save goal whenever it changes (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        goal,
        savedAt: new Date().toISOString(),
      }));
      setSavedAt(new Date().toISOString());
    }, 400);
    return () => clearTimeout(id);
  }, [goal]);

  // Reset each day (optional)
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { savedAt } = JSON.parse(raw);
      const last = savedAt ? new Date(savedAt).toDateString() : null;
      const today = new Date().toDateString();
      if (last && last !== today) {
        // new day → clear
        localStorage.removeItem(STORAGE_KEY);
        setGoal('');
        setSavedAt(null);
      }
    } catch {}
  }, []);

  return (
    <div style={styles.wrap}>
      <label style={styles.label}>What’s the one thing that makes today a win?</label>
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Type your biggest goal for today…"
        style={styles.input}
      />
      <div style={styles.meta}>
        {goal ? 'Saved' : 'Start typing to save automatically'}
        {savedAt ? ` • ${new Date(savedAt).toLocaleTimeString()}` : ''}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'grid', gap: '8px' },
  label: { fontWeight: 600 },
  input: {
    padding: '10px 12px',
    border: '1px solid #d6d6d6',
    borderRadius: 8,
    fontSize: 16,
  },
  meta: { fontSize: 12, color: '#666' },
};
