// src/components/AICompanion.jsx
import React, { useState } from 'react';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function AICompanion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Alfred's personality pools
  const alfredisms = [
    "One does try to maintain standards, sir.",
    "Tea is optional, but excellence is not.",
    "If I may be so bold, sir…",
    "I have taken the liberty of preparing a metaphor for you.",
    "Terribly sorry to interrupt, but duty calls."
  ];

  const modes = {
    formal: "You are Alfred, Bruce Wayne’s trusted butler. Always formal, articulate, and supportive. Use British English. Keep answers concise but thoughtful.",
    witty: "You are Alfred, but today you’re in a witty and dry-humoured mood. Offer clever remarks while still being helpful and polite.",
    motivational: "You are Alfred, but especially encouraging today. Blend formal respect with uplifting advice and motivation."
  };

  // Current default mode (can be changed to random later)
  const defaultMode = "formal";

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationContext = newMessages
        .slice(-6) // keep last 6 exchanges for short-term memory
        .map(m => `${m.role === 'user' ? "You" : "Alfred"}: ${m.content}`)
        .join("\n");

      const systemPrompt = `${modes[defaultMode]}
      Occasionally insert a short remark from this list when appropriate: ${alfredisms.join(" | ")}
      Keep the tone consistent throughout the conversation.`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: conversationContext }
          ],
          temperature: 0.8
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Terribly sorry, sir. ${data.error.message}` }]);
      } else {
        const reply = data.choices[0].message.content.trim();
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Terribly sorry, sir. A minor technical kerfuffle occurred." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2>🤵 Alfred – Your AI Butler</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#d1e7dd' : '#f8d7da'
            }}
          >
            <strong>{msg.role === 'user' ? 'You' : 'Alfred'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div style={styles.loading}>Alfred is composing his reply…</div>}
      </div>
      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="What may I do for you today, sir?"
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '1rem', fontFamily: 'Georgia, serif' },
  chatBox: { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', height: '400px', overflowY: 'auto', backgroundColor: '#fafafa' },
  message: { padding: '0.5rem 1rem', borderRadius: '8px', maxWidth: '75%' },
  loading: { fontStyle: 'italic', color: '#888' },
  inputRow: { display: 'flex', marginTop: '1rem' },
  input: { flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' },
  button: { marginLeft: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};
