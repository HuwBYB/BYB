import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import BigGoalPlanner from './components/BigGoalPlanner.jsx';
import PowerPoseBooster from './components/PowerPoseBooster.jsx';
import AICompanion from './components/AICompanion.jsx';

function Landing() {
  const user = { name: 'Huw' };
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Let’s build your best day yet.</p>
      </header>

      <div style={styles.card}>
        <h2>🎯 Today’s Big Goal</h2>
        <p>Big Goal Planning Flow</p>
        <Link to="/big-goal">Open</Link>
      </div>

      <div style={styles.card}>
        <h2>💥 Power Pose Booster</h2>
        <p>Power Pose Booster Flow</p>
        <Link to="/power-pose">Open</Link>
      </div>

      <div style={styles.card}>
        <h2>🤖 Your AI Companion</h2>
        <p>AI Companion Flow</p>
        <Link to="/ai">Open</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/big-goal" element={<BigGoalPlanner />} />
      <Route path="/power-pose" element={<PowerPoseBooster />} />
      <Route path="/ai" element={<AICompanion />} />
    </Routes>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', padding: '2rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 },
  header: { marginBottom: '2rem' },
  card: { marginBottom: '1.25rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9' },
};
