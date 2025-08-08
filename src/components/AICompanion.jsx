import React, { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'byb:ai:chat';

export default function AICompanion() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I’m your AI Companion. What would help most right now?" },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    // scroll to latest
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);

    // Mocked assistant reply (no API needed yet)
    setTimeout(() => {
      const reply = mockReply(text);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    }, 400);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (!confirm('Clear conversation?')) return;
    const seed = [{ role: 'assistant', content: "Hey! I’m your AI Companion. What would help most right now?" }];
    setMessages(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🤖 AI Companion</h1>
      <p style={styles.sub}>Ask for help, planning, motivation, or a pep talk.</p>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.msg,
              ...(m.role === 'user' ? styles.user : styles.assistant),
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={styles.input}
        />
        <button onClick={send} style={styles.sendBtn}>Send</button>
      </div>

      <div style={styles.tools}>
        <button onClick={clearChat} style={styles.clearBtn}>Clear Chat</button>
      </div>
    </div>
  );
}

// Very simple mocked “intelligence”
function mockReply(text) {
  const t = text.toLowerCase();
  if (t.includes('goal') || t.includes('plan')) {
    return "Great—let’s break that down into 3 micro-steps you can finish today. What’s step 1?";
  }
  if (t.includes('stuck') || t.includes('motivation')) {
    return "Totally get it. Try a 60-second reset: a quick walk, deep breath, or Power Pose. What’s one tiny action you can do right now?";
  }
  if (t.includes('affirmation')) {
    return "Here’s one: “I take consistent, small actions that add up to massive results.” Want another?";
  }
  if (t.includes('thanks') || t.includes('thank')) {
    return "You got it. I’m here whenever you need a boost.";
  }
  return "Got it. Tell me what you’re aiming for and what feels hardest—I’ll help you choose the next smallest step.";
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  title: { margin: 0, fontSize: '2rem' },
  sub: { marginTop: 8, color: '#666' },
  chatBox: {
    marginTop: 16,
    border: '1px solid #eee',
    borderRadius: 10,
    padding: 12,
    height: 380,
    overflowY: 'auto',
    background: '#fafafa',
    display: 'grid',
    gap: 8,
  },
  msg: { padding: '10px 12px', borderRadius: 10, whiteSpace: 'pre-wrap', lineHeight: 1.4 },
  user: { background: '#dbeafe', justifySelf: 'end', maxWidth: '80%' },
  assistant: { background: '#e9ffe8', justifySelf: 'start', maxWidth: '80%' },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 10 },
  input: { padding: 10, border: '1px solid #ddd', borderRadius: 8, resize: 'vertical', fontSize: 14 },
  sendBtn: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  tools: { marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' },
  clearBtn: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' },
};
