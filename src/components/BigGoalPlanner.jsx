import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'byb:today';
const emptyState = {
  goal: '',
  tasks: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }],
  savedAt: null,
};

export default function BigGoalPlanner() {
  const [state, setState] = useState(emptyState);

  // Load on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      // daily reset
      const last = parsed?.savedAt ? new Date(parsed.savedAt).toDateString() : null;
      const today = new Date().toDateString();
      setState(last && last !== today ? emptyState : parsed);
    } catch {
      setState(emptyState);
    }
  }, []);

  // Auto-save (debounced-ish)
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
    }, 300);
    return () => clearTimeout(id);
  }, [state.goal, state.tasks]);

  const progress = useMemo(() => {
    const total = state.tasks.filter(t => t.text.trim() !== '').length || 1;
    const done = state.tasks.filter(t => t.text.trim() !== '' && t.done).length;
    return Math.round((done / total) * 100);
  }, [state.tasks]);

  function setGoal(goal) {
    setState(s => ({ ...s, goal }));
  }

  function setTaskText(index, text) {
    setState(s => {
      const tasks = s.tasks.slice();
      tasks[index] = { ...tasks[index], text };
      return { ...s, tasks };
    });
  }

  function toggleTaskDone(index) {
    setState(s => {
      const tasks = s.tasks.slice();
      tasks[index] = { ...tasks[index], done: !tasks[index].done };
      return { ...s, tasks };
    });
  }

  function clearAll() {
    if (!confirm('Clear today’s goal and tasks?')) return;
    setState(emptyState);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎯 Today’s Big Goal</h1>
      <p style={styles.sub}>What’s the one thing that makes today a win?</p>

      <input
        value={state.goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Type your single biggest goal for today…"
        style={styles.goalInput}
      />

      {/* Progress */}
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
      <div style={styles.progressLabel}>{progress}% complete</div>

      {/* Tasks */}
      <h2 style={styles.h2}>Break it into 3 micro-tasks</h2>
      <div style={styles.tasks}>
        {state.tasks.map((t, i) => (
          <div key={i} style={styles.taskRow}>
            <input
              type="checkbox"
              checked={!!t.done}
              onChange={() => toggleTaskDone(i)}
              style={styles.checkbox}
            />
            <input
              value={t.text}
              onChange={e => setTaskText(i, e.target.value)}
              placeholder={`Step ${i + 1}`}
              style={{
                ...styles.taskInput,
                textDecoration: t.done ? 'line-through' : 'none',
                opacity: t.done ? 0.7 : 1,
              }}
            />
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={clearAll} style={styles.clearBtn}>Reset for Today</button>
        <span style={styles.savedAt}>
          {state.savedAt ? `Saved ${new Date(state.savedAt).toLocaleTimeString()}` : 'Autosaves as you type'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  title: { margin: 0, fontSize: '2rem' },
  sub: { marginTop: 8, color: '#666' },
  goalInput: {
    marginTop: 12, width: '100%', padding: '12px 14px', fontSize: 18,
    border: '1px solid #ddd', borderRadius: 8, outline: 'none',
  },
  progressWrap: {
    marginTop: 16, width: '100%', height: 10, background: '#f1f1f1', borderRadius: 999, overflow: 'hidden',
  },
  progressBar: { height: '100%', background: '#22c55e' },
  progressLabel: { marginTop: 6, fontSize: 12, color: '#555' },
  h2: { marginTop: 24, marginBottom: 8, fontSize: 18 },
  tasks: { display: 'grid', gap: 10 },
  taskRow: { display: 'grid', gridTemplateColumns: '24px 1fr', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18 },
  taskInput: {
    padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 16, outline: 'none',
  },
  footer: { marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' },
  clearBtn: {
    padding: '8px 12px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer',
  },
  savedAt: { fontSize: 12, color: '#666' },
};
