import React from 'react';
import BigGoalPlanner from './components/BigGoalPlanner.jsx';
import PowerPoseBooster from './components/PowerPoseBooster.jsx';
import AICompanion from './components/AICompanion.jsx';
import CommunityHub from './components/CommunityHub.jsx';
import Onboarding from './components/Onboarding.jsx';

function App() {
  return (
    <div>
      <h1>Welcome back, Huw 👋</h1>
      <p>Let's build your best day yet.</p>

      <section>
        <h2>🎯 Today's Big Goal</h2>
        <BigGoalPlanner />
      </section>

      <section>
        <h2>💥 Power Pose Booster</h2>
        <PowerPoseBooster />
      </section>

      <section>
        <h2>🤖 Your AI Companion</h2>
        <AICompanion />
      </section>

      <section>
        <h2>🌍 Community Hub</h2>
        <CommunityHub />
      </section>

      <section>
        <h2>📝 Onboarding</h2>
        <Onboarding />
      </section>
    </div>
  );
}

export default App;
