// src/components/DailyTodos.jsx
import React, { useEffect, useMemo, useState } from 'react';

const CATS = ['Business', 'Personal', 'Family'];
const keyFor = (dateStr) => `byb:todos:${dateStr}`;

// light util
function todayStr(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function DailyTodos() {
  const [date, setDate] = useState(todayStr());
  const [todos, setTodos] = useState(() => load(date));
  const [newText, setNewText] = useState('');
  const [newCat, setNewCat] = useState(CATS[0]);

  // reload when date changes
  useEffect(() => setTodos(load(date)), [date]);

  // autosave
  useEffect(() => {
    const id = setTimeout(() => save(date, todos), 250);
    return () => clearTimeout(id);
  }, [date, todos]);

  const counts = useMemo(() => {
    const t = todos.flatMap((c) => c.items);
    const done = t.filter((i) => i.done).length;
    return { total: t.length, done };
  }, [todos]);

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    setTodos((prev) =>
      prev.map((c) =>
        c.cat === newCat
          ? { ...c, items: [...c.items, { id: crypto.randomUUID(), text, done: false }] }
          : c
      )
    );
    setNewText('');
  }

  function toggle(cat, id) {
    setTodos((prev) =>
      prev.map((c) =>
        c.cat !== cat ? c : { ...c, items: c.items.map(i => i.id === id ? { ...i, done: !i.done } : i) }
      )
    );
  }

  function remove(cat, id) {
    setTodos((prev) =>
      prev.map((c) =>
        c.cat !== cat ? c : { ...c, items: c.items.filter(i => i.id !== id) }
      )
    );
  }

  function clearDone() {
    if (!confirm('Clear completed items for this day?')) return;
    setTodos((prev) => prev.map((c) => ({ ...c, items: c.items.filter(i => !i.done) })));
  }

  // Optional: pull from Big Goal (if you want now)
  function pullBigGoal() {
    const raw = localStorage.getItem('byb:today');
    if (!raw) return alert('No Big Goal found for today.');
    try {
      const { goal, tasks } = JSON.parse(raw);
      const picks = [goal, ...tasks.map(t => t.text)].filter(Boolean).slice(0, 4);
      if (!picks.length) return alert('Big Goal has no content to import.');
      setTodos((prev) =>
        prev.map((c) =>
          c.cat !== 'Business'
            ? c
            : {
                ...c,
                items: [
                  ...c.items,
                  ...picks.map(t => ({ id: crypto.randomUUID(), text: t, done: false })),
                ],
              }
        )
      );
    } catch {
      alert('Could not read Big Goal.');
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.h1}>🗓️ Daily To-Dos</h1>
      <div style={s.controls}>
        <label>
          Date:{' '}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div style={s.progressWrap}>
          <div style={{ ...s.progressBar, width: `${pct(counts)}%` }} />
        </div>
        <div style={s.progressText}>
          {counts.done}/{counts.total} done
        </div>
      </div>

      <div style={s.addRow}>
        <select value={newCat} onChange={(e) => setNewCat(e.target.value)} style={s.select}>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a to-do…"
          style={s.input}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem} style={s.btn}>Add</button>
        <button onClick={pullBigGoal} style={s.btnSecondary}>Import Big Goal</button>
        <button onClick={clearDone} style={s.btnSecondary}>Clear Done</button>
      </div>

      <div style={s.cols}>
        {todos.map((col) => (
          <div key={col.cat} style={s.col}>
            <h2 style={s.h2}>{col.cat}</h2>
            <div style={s.list}>
              {col.items.map((i) => (
                <div key={i.id} style={s.item}>
                  <label style={s.itemLeft}>
                    <input type="checkbox" checked={i.done} onChange={() => toggle(col.cat, i.id)} />
                    <span style={{ ...s.text, textDecoration: i.done ? 'line-through' : 'none', opacity: i.done ? 0.65 : 1 }}>
                      {i.text}
                    </span>
                  </label>
                  <button onClick={() => remove(col.cat, i.id)} style={s.delete}>×</button>
                </div>
              ))}
              {col.items.length === 0 && <div style={s.empty}>No items yet.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// storage helpers
function load(dateStr) {
  const raw = localStorage.getItem(keyFor(dateStr));
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  // default empty columns
  return [
    { cat: 'Business', items: [] },
    { cat: 'Personal', items: [] },
    { cat: 'Family', items: [] },
  ];
}
function save(dateStr, data) {
  localStorage.setItem(keyFor(dateStr), JSON.stringify(data));
}
function pct({ done, total }) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

const s = {
  page: { maxWidth: 1000, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  h1: { margin: 0, fontSize: '2rem' },
  controls: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  progressWrap: { width: 200, height: 10, background: '#eee', borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: '100%', background: '#22c55e' },
  progressText: { fontSize: 12, color: '#666' },
  addRow: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  select: { padding: '8px', borderRadius: 8, border: '1px solid #ddd' },
  input: { flex: 1, minWidth: 260, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 },
  btn: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  btnSecondary: { padding: '8px 12px', borderRadius: 8, border: '1px solid #eee', background: '#f8f8f8', cursor: 'pointer' },
  cols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 },
  col: { border: '1px solid #eee', borderRadius: 10, padding: 12, background: '#fff' },
  h2: { margin: '0 0 8px 0', fontSize: 18 },
  list: { display: 'grid', gap: 8 },
  item: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: '#fafafa' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  text: { fontSize: 14 },
  delete: { border: 'none', background: 'transparent', fontSize: 20, lineHeight: 1, cursor: 'pointer', color: '#888' },
  empty: { color: '#999', fontStyle: 'italic' },
};
