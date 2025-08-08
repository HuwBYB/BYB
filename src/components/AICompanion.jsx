// src/components/AICompanion.jsx
import React, { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import { supabase } from '../supabaseClient';

// TEMP user id for cross-device testing (use real auth later)
const USER_ID = 'huw-dev'; // use the same string on phone/desktop to share memory

// Debug: confirm envs exist at runtime
console.log('Has OPENAI?', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('Has SUPABASE URL?', !!import.meta.env.VITE_SUPABASE_URL);

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export default function AICompanion() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: "Good day. Alfred at your service. How may I assist your endeavours, sir?" }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const endRef = useRef(null);

  // Load last 20 messages from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('role,message,created_at')
          .eq('user_id', USER_ID)
          .order('created_at', { ascending: true })
          .limit(200); // keep it generous; we’ll trim in API call

        if (error) throw error;

        if (data && data.length) {
          const restored = data.map(r => ({
            sender: r.role === 'user' ? 'You' : 'AI',
            text: r.message
          }));
          setMessages(restored);
        }
      } catch (e) {
        console.error('Load history error:', e);
      } finally {
        setLoadingHistory(false);
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    })();
  }, []);

  // Save a single message to Supabase
  async function saveToCloud(role, message) {
    try {
      const { error } = await supabase
        .from('conversations')
        .insert([{ user_id: USER_ID, role, message }]);
      if (error) throw error;
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    const next = [...messages, { sender: 'You', text }];
    setMessages(next);
    setIsSending(true);
    // Persist user message
    saveToCloud('user', text);

    try {
      // Build context for OpenAI (last ~12 turns)
      const apiMessages = [
        {
          role: 'system',
          content:
            "You are 'Alfred'—a calm, discreet, and unflappably supportive British butler. " +
            "Tone: warm, concise, wry, dignified. Address the user as 'sir' unless told otherwise. " +
            "Offer practical next actions, prefer short bullet points for plans, keep replies under ~140 words, never break character."
        },
        ...next.slice(-12).map(m => ({
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
        "My apologies, sir—something appears amiss. Might we try once more?";

      setMessages(m => [...m, { sender: 'AI', text: reply }]);
      // Persist AI reply
      saveToCloud('alfred', reply);
    } catch (err) {
      console.error('OpenAI error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Unknown error';
      setMessages(m => [...m, { sender: 'AI', text: `Terribly sorry, sir. ${msg}` }]);
      saveToCloud('alfred', `Terribly sorry, sir. ${msg}`);
    } finally {
      setIsSending(false);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function clearChat() {
    if (!confirm('Clear conversation from the cloud?')) return;
    try {
      await supabase.from('conversations').delete().eq('user_id', USER_ID);
      setMessages([
        { sender: 'AI', text: "Good day. Alfred at your service. How may I assist your endeavours, sir?" }
      ]);
    } catch (e) {
      console.error('Clear error:', e);
    }
  }

  return (
    <div style={styles.container}>
      <h1>🤖 Alfred, Your Companion</h1>
      {loadingHistory && <div style={styles.loading}>Fetching prior correspondence, sir…</div>}

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
        <button onClick={clearChat} style={styles.clearBtn}>Clear Cloud Chat</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto' },
  loading: { marginBottom: 8, color: '#666' },
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
