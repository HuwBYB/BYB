// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import BigGoalPlanner from './components/BigGoalPlanner.jsx';
import PowerPoseBooster from './components/PowerPoseBooster.jsx';
import AICompanion from './components/AICompanion.jsx';

function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Best You Blueprint</h1>
      <div style={styles.grid}>

        <Link to="/big-goal" style={styles.card}>
          <h2>🎯 Today’s Big Goal</h2>
          <p>Plan and break down your most important task.</p>
        </Link>

        <Link to="/power-pose" style={styles.card}>
          <h2>💪 Power Pose Booster</h2>
          <p>Boost your mood and confidence instantly.</p>
        </Link>

        <Link to="/ai" style={styles.card}>
          <h2>🤖 AI Companion</h2>
          <p>Your personal AI support, advice & encouragement.</p>
        </Link>

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    display: 'block',
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    cursor: 'pointer',
  },
  cardHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
};

export default App;
