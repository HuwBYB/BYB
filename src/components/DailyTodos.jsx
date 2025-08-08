// src/components/DailyTodos.jsx
import React, { useEffect, useMemo, useState } from 'react';

const CATS = ['Business', 'Personal', 'Family'];
const keyForTodos = (dateStr) => `byb:todos:${dateStr}`;
const STATS_KEY = 'byb:todoStats'; // { [YYYY-MM-DD]: { done: number, goalDone: number } }

const todayStr = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
const addDays = (dateStr, delta) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return todayStr(d);
};

export default function DailyTodos() {
  const [date, setDate] = useState(todayStr());
  const [todos, setTodos] = useState(() => loadOrInit(date));
  const [newText, setNewText] = useState('');
  const [newCat, setNewCat] = useState(CATS[0]);
  const [markGoalStep, setMarkGoalStep] = useState(false); // flag for “Big Goal” steps

  // When date changes, load (with rollover if first open today)
  useEffect(() => setTodos(loadOrInit(date)), [date]);

  // Autosave
  useEffect(() => {
    const id = setTimeout(() => saveTodos(date, todos), 250);
    return () => clearTimeout(id);
  }, [date, todos]);

  // Counts
  const counts = useMemo(() => {
    const all = todos.flatMap((c) => c.items);
    const done = all.filter(i => i.done).length;
    const total = all.length;
    const goalDone = all.filter(i => i.done && i.isGoalStep).length;
    return { done, total, goalDone };
  }, [todos]);

  // Weekly wins (last 7 days including selected date)
  const weekly = useMemo(() => {
    const stats = loadStats();
    let done = 0, goalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(date, -i);
      const s = stats[d];
      if (s) { done += s.done || 0; goalDone += s.goalDone || 0; }
    }
    return { done, goalDone };
  }, [date, todos]); // recalcs when check/uncheck changes stats below

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    setTodos(prev =>
      prev.map(c =>
        c.cat === newCat
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: crypto.randomUUID(),
                  text,
                  done: false,
                  isGoalStep: markGoalStep,
                  rolled: false,
                },
              ],
            }
          : c
      )
    );
    setNewText('');
  }

  function toggle(cat, id) {
    setTodos(prev =>
      prev.map(c =>
        c.cat !== cat
          ? c
          : {
              ...c,
              items: c.items.map(i =>
                i.id !== id ? i : { ...i, done: !i.done }
              ),
            }
      )
    );

    // update stats immediately
    const item = todos.find(c => c.cat === cat)?.items.find(i => i.id === id);
    if (!item) return;
    const becomingDone = !item.done;
    bumpStats(date, becomingDone ? 1 : -1, becomingDone && item.isGoalStep ? 1 : (item.isGoalStep ? -1 : 0));
  }

  function remove(cat, id) {
    // if removing a done item, decrement stats
    const item = todos.find(c => c.cat === cat)?.items.find(i => i.id === id);
    if (item?.done) bumpStats(date, -1, item.isGoalStep ? -1 : 0);

    setTodos(prev =>
      prev.map(c =>
        c.cat !== cat ? c : { ...c, items: c.items.filter(i => i.id !== id) }
      )
    );
  }

  function clearDone() {
    if (!confirm('Clear completed items for this day?')) return;
    // adjust stats down to match items removed (but stats already reflect done ticks, so no change)
    setTodos(prev => prev.map(c => ({ ...c, items: c.items.filter(i => !i.done) })));
  }

  function pullBigGoal() {
    const raw = localStorage.getItem('byb:today');
    if (!raw) return alert('No Big Goal found for today.');
    try {
      const { goal, tasks } = JSON.parse(raw);
      const picks = [goal, ...(tasks || []).map(t => t.text)].filter(Boolean).slice(0, 5);
      if (!picks.length) return alert('Big Goal has no content to import.');
      setTodos(prev =>
        prev.map(c =>
          c.cat !== 'Business'
            ? c
            : {
                ...c,
                items: [
                  ...c.items,
                  ...picks.map(t => ({
                    id: crypto.randomUUID(),
                    text: t,
                    done: false,
                    isGoalStep: true,
                    rolled: false,
                  })),
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
        <div style={s.progressText}>{counts.done}/{counts.total} done</div>

        <div style={s.weekBox}>
          <div><strong>Weekly wins:</strong> {weekly.done}</div>
          <div><strong>Big-Goal wins:</strong> {weekly.goalDone}</div>
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
        <label style={s.chk}>
          <input type="checkbox" checked={markGoalStep} onChange={(e) => setMarkGoalStep(e.target.checked)} /> Big Goal step
        </label>
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
                    <span style={{
                      ...s.text,
                      textDecoration: i.done ? 'line-through' : 'none',
                      opacity: i.done ? 0.65 : 1
                    }}>
                      {i.text}{i.isGoalStep ? ' ⭐' : ''}{i.rolled ? ' (rolled)' : ''}
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

/* ---------- storage + rollover + stats ---------- */

function defaultCols() {
  return [
    { cat: 'Business', items: [] },
    { cat: 'Personal', items: [] },
    { cat: 'Family', items: [] },
  ];
}

function loadOrInit(dateStr) {
  // If already saved for this day, return it
  const raw = localStorage.getItem(keyForTodos(dateStr));
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }

  // First open of this day → roll over unfinished from yesterday
  const yday = addDays(dateStr, -1);
  const prevRaw = localStorage.getItem(keyForTodos(yday));
  if (prevRaw) {
    try {
      const prev = JSON.parse(prevRaw);
      const rolled = prev.map(col => ({
        ...col,
        items: col.items
          .filter(i => !i.done) // only unfinished
          .map(i => ({ ...i, id: crypto.randomUUID(), rolled: true })) // new ids
      }));
      const withAllCats = mergeWithDefaultCols(rolled);
      localStorage.setItem(keyForTodos(dateStr), JSON.stringify(withAllCats));
      return withAllCats;
    } catch {}
  }

  // Nothing to roll → new empty day
  const empty = defaultCols();
  localStorage.setItem(keyForTodos(dateStr), JSON.stringify(empty));
  return empty;
}

function mergeWithDefaultCols(cols) {
  const map = new Map(cols.map(c => [c.cat, c]));
  return defaultCols().map(base => map.get(base.cat) || base);
}

function loadStats() {
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function bumpStats(dateStr, deltaDone, deltaGoalDone) {
  const stats = loadStats();
  const s = stats[dateStr] || { done: 0, goalDone: 0 };
  s.done = Math.max(0, (s.done || 0) + (deltaDone || 0));
  s.goalDone = Math.max(0, (s.goalDone || 0) + (deltaGoalDone || 0));
  stats[dateStr] = s;
  // prune older than 7 days for local-only weekly view (we’ll keep more in cloud later)
  const cutoff = addDays(todayStr(), -60); // keep ~2 months just in case
  for (const d of Object.keys(stats)) {
    if (d < cutoff) delete stats[d];
  }
  saveStats(stats);
}

/* ---------- tiny helpers ---------- */

function saveTodos(dateStr, data) {
  localStorage.setItem(keyForTodos(dateStr), JSON.stringify(data));
}
function pct({ done, total }) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

/* ---------- styles ---------- */

const s = {
  page: { maxWidth: 1000, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  h1: { margin: 0, fontSize: '2rem' },
  controls: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  progressWrap: { width: 200, height: 10, background: '#eee', borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: '100%', background: '#22c55e' },
  progressText: { fontSize: 12, color: '#666' },
  weekBox: { padding: '6px 10px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 },
  addRow: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  select: { padding: '8px', borderRadius: 8, border: '1px solid #ddd' },
  input: { flex: 1, minWidth: 260, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 },
  chk: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
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
