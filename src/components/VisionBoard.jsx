// src/components/VisionBoard.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'byb:vision:v1'; // stores up to 8 image URLs

export default function VisionBoard() {
  const [urls, setUrls] = useState(() => load());
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('collage'); // 'collage' | 'slideshow'
  const [index, setIndex] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => save(urls), 200);
    return () => clearTimeout(id);
  }, [urls]);

  const canAdd = urls.length < 8;
  const hasImages = urls.length > 0;

  function addUrl(u) {
    const url = (u || input).trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      alert('Please paste a full image URL starting with http or https.');
      return;
    }
    if (!canAdd) return alert('Limit reached: 8 images max.');
    setUrls(prev => [...prev, url]);
    setInput('');
  }

  function removeAt(i) {
    setUrls(prev => prev.filter((_, idx) => idx !== i));
    if (index >= urls.length - 1) setIndex(0);
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    setUrls(prev => {
      const copy = [...prev];
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
      return copy;
    });
    if (index === i) setIndex(j);
    else if (index === j) setIndex(i);
  }

  function next() { if (urls.length) setIndex((i) => (i + 1) % urls.length); }
  function prev() { if (urls.length) setIndex((i) => (i - 1 + urls.length) % urls.length); }

  // Optional: choose a daily pick (used in collage top-left label)
  const dailyPick = useMemo(() => {
    if (!urls.length) return null;
    const d = new Date();
    const n = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
    return urls[n % urls.length];
  }, [urls]);

  // (Optional) local file import -> data URL (no server)
  async function addLocalFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please choose an image file.');
    if (!canAdd) return alert('Limit reached: 8 images max.');
    const reader = new FileReader();
    reader.onload = () => setUrls(prev => [...prev, String(reader.result)]);
    reader.readAsDataURL(file);
  }

  return (
    <div style={s.page}>
      <h1 style={s.h1}>🖼️ Vision Board</h1>
      <p style={s.sub}>Add up to 8 images. Use <strong>Collage</strong> to bathe in the vibe, or <strong>Slideshow</strong> to focus.</p>

      <div style={s.toolbar}>
        <div style={s.left}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            style={s.input}
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            disabled={!canAdd}
          />
          <button onClick={() => addUrl()} style={s.btn} disabled={!canAdd}>Add URL</button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => addLocalFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileRef.current?.click()} style={s.btn} disabled={!canAdd}>Upload</button>
          <span style={s.count}>{urls.length}/8</span>
        </div>

        <div style={s.right}>
          <label style={s.modeLbl}>
            View:{' '}
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={s.select}>
              <option value="collage">Collage</option>
              <option value="slideshow">Slideshow</option>
            </select>
          </label>
        </div>
      </div>

      {mode === 'collage' && (
        <div>
          {dailyPick && (
            <div style={s.banner}>Today’s pick is highlighted, sir.</div>
          )}
          <div style={s.collageGrid(urls.length)}>
            {urls.map((u, i) => (
              <div key={i} style={s.tile(dailyPick === u)}>
                <img src={u} alt={`vision-${i}`} style={s.img} />
                <div style={s.tileBtns}>
                  <button onClick={() => move(i, -1)} style={s.smallBtn} title="Move left">←</button>
                  <button onClick={() => move(i, 1)} style={s.smallBtn} title="Move right">→</button>
                  <button onClick={() => removeAt(i)} style={s.smallDanger}>✕</button>
                </div>
              </div>
            ))}
            {urls.length === 0 && <div style={s.empty}>No images yet. Add up to eight to build your board.</div>}
          </div>
        </div>
      )}

      {mode === 'slideshow' && (
        <div>
          {!hasImages && <div style={s.empty}>Add images to begin the slideshow.</div>}
          {hasImages && (
            <div style={s.slideWrap}>
              <button onClick={prev} style={s.navBtn} aria-label="Previous">‹</button>
              <img src={urls[index]} alt={`slide-${index}`} style={s.slide} />
              <button onClick={next} style={s.navBtn} aria-label="Next">›</button>
            </div>
          )}
          {hasImages && (
            <div style={s.thumbs}>
              {urls.map((u, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  style={{ ...s.thumbBtn, outline: i === index ? '2px solid #0070f3' : 'none' }}
                  title={`Go to ${i + 1}`}
                >
                  <img src={u} alt={`thumb-${i}`} style={s.thumb} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- storage ---------- */
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function save(urls) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

/* ---------- styles ---------- */
const s = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  h1: { margin: 0, fontSize: '2rem' },
  sub: { color: '#666', marginTop: 4 },
  toolbar: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' },
  left: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  right: { display: 'flex', gap: 8, alignItems: 'center' },
  input: { minWidth: 260, flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 },
  btn: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  count: { fontSize: 12, color: '#666' },
  modeLbl: { fontSize: 14 },
  select: { padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd' },
  banner: { margin: '8px 0 12px', padding: '8px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, color: '#075985' },
  empty: { padding: '1rem', border: '1px dashed #ddd', borderRadius: 8, color: '#777', textAlign: 'center' },

  // Collage
  collageGrid: (count) => ({
    display: 'grid',
    gap: 10,
    marginTop: 8,
    gridTemplateColumns: count <= 2 ? 'repeat(2, 1fr)'
                          : count <= 4 ? 'repeat(2, 1fr)'
                          : count <= 6 ? 'repeat(3, 1fr)'
                          : 'repeat(4, 1fr)',
  }),
  tile: (highlight) => ({
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    border: highlight ? '3px solid #16a34a' : '1px solid #e5e7eb',
    aspectRatio: '1 / 1',
    background: '#f8fafc',
  }),
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tileBtns: {
    position: 'absolute', right: 6, bottom: 6, display: 'flex', gap: 6,
    background: 'rgba(255,255,255,0.8)', borderRadius: 999, padding: '3px 6px'
  },
  smallBtn: { border: '1px solid #ddd', background: '#fff', borderRadius: 999, padding: '4px 8px', cursor: 'pointer' },
  smallDanger: { border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', borderRadius: 999, padding: '4px 8px', cursor: 'pointer' },

  // Slideshow
  slideWrap: { display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center', gap: 10, marginTop: 10 },
  navBtn: { padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  slide: { width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 12, border: '1px solid #eee' },
  thumbs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  thumbBtn: { padding: 0, border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer' },
  thumb: { width: 80, height: 80, objectFit: 'cover', display: 'block', borderRadius: 8 },
};
