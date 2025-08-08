// src/components/AICompanion.jsx
import React, { useState } from 'react';

function AICompanion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'You', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'AI', text: 'That’s interesting! Tell me more.' }
      ]);
    }, 500);
  };

  return (
    <div style={styles.container}>
      <h1>🤖 AI Companion</h1>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'You' ? '#0070f3' : '#eee',
              color: msg.sender === 'You' ? '#fff' : '#000',
            }}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
  },
  chatBox: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    height: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  message: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    maxWidth: '80%',
  },
  inputContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default AICompanion;
