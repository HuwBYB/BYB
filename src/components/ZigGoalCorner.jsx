// src/components/ZigGoalCorner.jsx
import React from 'react';
import ZigGoalWizard from './ZigGoalWizard';   // use the wizard you already added
import ZigQuotes from './ZigQuotes';

export default function ZigGoalCorner() {
  // Pick a random Zig quote each visit
  const quote = ZigQuotes[Math.floor(Math.random() * ZigQuotes.length)];

  // TEMP user id until auth lands
  const userId = 'huw-dev';

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Zig Goal Corner</h1>
      <p style={s.sub}>Inspired by the goal-setting methods of Zig Ziglar.</p>

      <div style={s.quote}>“{quote}” — Zig Ziglar</div>

      {/* Wizard */}
      <div style={{ marginTop: 16 }}>
        <ZigGoalWizard userId={userId} onClose={() => window.history.back()} />
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 900, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  h1: { margin: 0, fontSize: '2rem' },
  sub: { color: '#666', marginTop: 6 },
  quote: { marginTop: 12, padding: '10px 12px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10 }
};
