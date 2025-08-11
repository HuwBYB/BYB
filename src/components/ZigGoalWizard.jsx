// src/components/ZigGoalCorner.jsx
import React, { useMemo } from "react";
import ZigGoalWizard from "./ZigGoalWizard";
import ZigQuotes from "./ZigQuotes";

export default function ZigGoalCorner() {
  // Pick a random Zig quote once per mount
  const quote = useMemo(
    () => ZigQuotes[Math.floor(Math.random() * ZigQuotes.length)],
    []
  );

  // ✅ Fixed dev UUID (must match your Supabase dev policy)
  const DEV_UUID = "11111111-1111-1111-1111-111111111111";

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Zig Goal Corner</h1>
      <p style={s.sub}>Inspired by the goal-setting methods of Zig Ziglar.</p>

      <div style={s.quote}>“{quote}” — Zig Ziglar</div>

      {/* Dev banner so we know which user_id is being used */}
      <div style={s.devBanner}>
        Dev mode · using user_id: <code>{DEV_UUID}</code>
      </div>

      <div style={{ marginTop: 16 }}>
        <ZigGoalWizard
          userId={DEV_UUID}
          onClose={() => window.history.back()}
        />
      </div>
    </div>
  );
}

const s = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  h1: { margin: 0, fontSize: "2rem" },
  sub: { color: "#666", marginTop: 6 },
  quote: {
    marginTop: 12,
    padding: "10px 12px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
  },
  devBanner: {
    marginTop: 10,
    padding: "8px 10px",
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#7c2d12",
    borderRadius: 8,
    fontSize: 12,
  },
};
