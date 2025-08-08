import React from 'react';

export default function AlfredSpeechBubble({ message }) {
  return (
    <div style={s.wrap}>
      <div style={s.bubble}>{message}</div>
    </div>
  );
}
const s = {
  wrap: { marginTop: 12, display: 'flex', justifyContent: 'center' },
  bubble: { padding: '10px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: 12, boxShadow: '0 4px 8px rgba(0,0,0,0.04)' }
};
