// src/components/AICompanion.jsx
import React, { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';

// 🔎 Debug: confirms whether the env var is visible in this build
console.log('Has VITE_OPENAI_API_KEY?', !!import.meta.env.VITE_OPENAI_API_KEY);

const STORAGE_KEY = 'byb:ai:chat';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // ok for your private testing; move server-side before public release
});

export default function AICompanion() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: "Good day. Alfred at your service. How may I assist your endeavours, sir?" }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef(null);

  // Load saved chat
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
    } catch {}
  }, []);

  // Save chat + autoscroll
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    const nextMessages = [...messages, { sender: 'You', text }];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      // Build conversation for OpenAI (last ~12 turns)
      const apiMessages = [
        {
          role: 'system',
          content:
            "You are 'Alfred'—a calm, discreet, and unflappably supportive British butler in the Alfred Pennyworth tradition. " +
            "Tone: warm, concise, wry, and dignified. Address the user as 'sir' unless they specify otherwise. " +
            "Offer practical, specific next actions. Keep replies under ~140 words unless analysis is essential. " +
            "Never break character. Decline harmful requests gently. Prefer bullet points for plans. " +
            "Close with a brief, steadying line when suitable (e.g., 'Very good, sir.')."
        },
        ...nextMessages.slice(-12).map(m => ({
          role: m.sender === 'You' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 220,
        temperature: 0.7
      });

      const reply =
        resp.choices?.[0]?.message?.content?.trim() ||
        "My apologies, sir—something appears amiss. Might we try that once more?";
      setMessages(m => [...m, { sender: 'AI', text: reply }]);
    } catch (err) {
      // ❗ Make the actual error visible in-chat and in console
      console.error('OpenAI error:', err);
      const msg =
        (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) ||
        err?.message ||
        'Unknown error';
      setMessages(m => [
        ...m,
        { sender: 'AI', text: `Terribly sorry, sir. ${msg}` }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (!confirm('Clear conversation?')) return;
    const seed = [{ sender: 'AI', text: "Good day. Alfred at your service. How may I assist your endeavours, sir?" }];
    setMessages(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }

  // Quick prompt chips
  const quickPrompts = [
    "Help me plan today’s top task.",
    "I’m stuck—what’s the smallest next step?",
    "Give me a brisk pep talk.",
    "Help me break a 5-step plan."
  ];
  function sendQuick(p) {
    setInput(p);
    setTimeout(send, 0);
  }

  return (
    <div style={styles.container}>
      <h1>🤖 Alfred, Your Companion</h1>
      <p style={styles.sub}>Concise counsel, steady encouragement, and the occasional dry remark.</p>

      <div style={styles.chips}>
        {quickPrompts.map((q, i) => (
          <button key={i} onClick={() => sendQuick(q)} style={styles.chipBtn}>{q}</button>
        ))}
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',
              backgroundColor: m.sender === 'You' ? '#0f62fe' : '#eeeeee',
              color: m.sender === 'You' ? '#fff' : '#000',
            }}
          >
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isSending ? 'One moment, sir…' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
          rows={2}
          disabled={isSending}
          style={styles.input}
        />
        <button onClick={send} disabled={isSending} style={styles.button}>
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div style={styles.tools}>
        <button onClick={clearChat} style={styles.clearBtn}>Clear Chat</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto' },
  sub: { color: '#666', marginTop: 6 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 8 },
  chipBtn: {
    padding: '6px 10px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
    fontSize: 12
  },
  chatBox: {
    border: '1px solid #ddd', borderRadius: 8, padding: '1rem',
    height: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12,
    background: '#fafafa'
  },
  message: { padding: '8px 12px', borderRadius: 8, maxWidth: '80%', whiteSpace: 'pre-wrap', lineHeight: 1.4 },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 },
  input: { padding: 10, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', fontSize: 14 },
  button: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  tools: { marginTop: 8 },
  clearBtn: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' },
};
