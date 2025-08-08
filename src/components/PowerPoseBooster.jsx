import React, { useEffect, useState } from 'react';

const BOOSTS = [
  { id: 'pose', label: 'Power Pose (2 mins): stand tall, hands on hips, breathe slow' },
  { id: 'grat', label: 'Gratitude (3 things): write them down' },
  { id: 'breath', label: 'Box Breathing (1 min): 4 in / 4 hold / 4 out / 4 hold' },
  { id: 'move', label: 'Move (1 min): 20 squats or a brisk walk' },
];

export default function PowerPoseBooster() {
  const [selected, setSelected] = useState(BOOSTS[0].id);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  function start() {
    setDone(false);
    setSeconds(60);
    setRunning(true);
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>💪 Power Pose Booster</h1>
      <p style={styles.sub}>Pick a quick booster and start a 60-second reset.</p>

      <div style={styles.list}>
        {BOOSTS.map(b => (
          <label key={b.id} style={styles.item}>
            <input
              type="radio"
              name="boost"
              checked={selected === b.id}
              onChange={() => setSelected(b.id)}
              style={{ marginRight: 8 }}
            />
            {b.label}
          </label>
        ))}
      </div>

      <div style={styles.timerBox}>
        <div style={styles.timer}>{format(seconds)}</div>
        <button style={styles.btn} onClick={start} disabled={running}>
          {running ? 'Running…' : 'Start 60s'}
        </button>
      </div>

      {done && (
        <div style={styles.done}>
          ✅ Session complete! Feel the shift. Back to work with fresh energy.
        </div>
      )}
    </div>
  );
}

function format(s) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  title: { margin: 0, fontSize: '2rem' },
  sub: { marginTop: 8, color: '#666' },
  list: { marginTop: 16, display: 'grid', gap: 8 },
  item: { display: 'flex', alignItems: 'center', padding: 8, border: '1px solid #eee', borderRadius: 8 },
  timerBox: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 },
  timer: { fontSize: 32, fontVariantNumeric: 'tabular-nums' },
  btn: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  done: { marginTop: 12, color: '#16a34a', fontWeight: 600 },
};
