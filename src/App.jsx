import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import VisionBoard from './components/VisionBoard.jsx';
import ZigGoalCorner from './components/ZigGoalCorner.jsx';
import BigGoalPlanner from './components/BigGoalPlanner.jsx';
import PowerPoseBooster from './components/PowerPoseBooster.jsx';
import AICompanion from './components/AICompanion.jsx';
import DailyTodos from './components/DailyTodos.jsx';

function Landing() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Best You Blueprint</h1>

      <div style={styles.grid}>
        <Link to="/big-goal" style={styles.card}>
          <h2>🎯 Today’s Big Goal</h2>
          <p>Plan and break down your most important task.</p>
        </Link>
<Link to="/zig" style={styles.card}>
  <h2>📚 Zig Goal Corner</h2>
  <p>Break your BIG goal into daily steps</p>
</Link>
        <Link to="/power-pose" style={styles.card}>
          <h2>💪 Power Pose Booster</h2>
          <p>Boost your mood and confidence instantly.</p>
        </Link>
  
        <Link to="/vision" style={styles.card}>
  <h2>🖼️ Vision Board</h2>
  <p>Pin up to 8 images • Collage view</p>
</Link>


        <Link to="/ai" style={styles.card}>
          <h2>🤖 Alfred, Your Companion</h2>
          <p>Concise counsel with a butler’s charm.</p>
        </Link>

        <Link to="/todos" style={styles.card}>
          <h2>🗓️ Daily To-Dos</h2>
          <p>Business • Personal • Family</p>
        </Link>
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
      <Route path="/todos" element={<DailyTodos />} />
      <Route path="*" element={<Landing />} />
      <Route path="/zig" element={<ZigGoalCorner />} />
<Route path="/vision" element={<VisionBoard />} />

    </Routes>
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
};
