// src/components/AICompanion.jsx
import React, { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';

const STORAGE_KEY = 'byb:ai:chat';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // okay for your private testing; we'll move server-side before public release
});

export default function AICompanion() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: "Hey! I’m your AI Companion. What would help most right now?" }
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

  // Save + autoscroll
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    // Add user message immediately
    const next = [...messages, { sender: 'You', text }];
    setMessages(next);
    setIsSending(true);

    try {
      // Build chat history for the API (last 10 turns)
      const apiMessages = [
        { role: 'system', content: 'You are a friendly, concise, encouraging companion for personal growth. Be practical and specific.' },
        ...next.slice(-10).map(m => ({
          role: m.sender === 'You' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 180,
        temperature: 0.7,
      });

      const reply = resp.choices?.[0]?.message?.content?.trim() || "Hmm… I didn’t catch that. Try again?";
      setMessages(m => [...m, { sender: 'AI', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(m => [...m, { sender: 'AI', text: 'Oops—something went wrong. Try again in a moment.' }]);
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
    const seed = [{ sender: 'AI', text: "Hey! I’m your AI Companion. What would help most right now?" }];
    setMessages(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }

  return (
    <div style={styles.container}>
      <h1>🤖 AI Companion</h1>
      <p style={styles.sub}>Ask for help, planning, motivation, or a pep talk.</p>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',
              backgroundColor: m.sender === 'You' ? '#0070f3' : '#eee',
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
          placeholder={isSending ? 'Thinking…' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
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
  sub: { color: '#666', marginTop: 4 },
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
