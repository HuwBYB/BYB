// ✅ All imports should be at the top
import React from 'react';
import BigGoalPlanner from './components/BigGoalPlanner.jsx';
import PowerPoseBooster from './components/PowerPoseBooster.jsx';
import AICompanion from './components/AICompanion.jsx';

function App() {
  const user = { name: 'Huw' };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Let’s build your best day yet.</p>
      </header>

      <section style={styles.section}>
        <h2>🎯 Today’s Big Goal</h2>
        <BigGoalPlanner />
      </section>

      <section style={styles.section}>
        <h2>💥 Power Pose Booster</h2>
        <PowerPoseBooster />
      </section>

      <section style={styles.section}>
        <h2>🤖 Your AI Companion</h2>
        <AICompanion />
      </section>
    </div>
  );
}

// ✅ Style object comes AFTER the component, not before
const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2.5rem',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
};

export default App;
