// src/components/ZigGoalWizard.jsx
import React, { useEffect, useState } from "react";
import { saveGoalToDatabase } from "../utils/saveGoalToDatabase";
import { addTasksToTodo } from "../utils/addTasksToTodo";

// 🔒 fixed UUID used in dev (must match your Supabase dev policies)
const FIXED_UUID = "11111111-1111-1111-1111-111111111111";

function ZigGoalWizard({ onClose = () => {} }) {
  // Visible banner so we know the component actually mounted
  const [mountedAt] = useState(() => new Date().toLocaleTimeString());

  // Minimal state to prove cloud save works
  const [bigGoal, setBigGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0); // 0: goal, 1: timeframe, 2: review

  useEffect(() => {
    console.log("[BYB] ZigGoalWizard mounted at", mountedAt);
  }, [mountedAt]);

  const canNext =
    (step === 0 && bigGoal.trim().length > 0) ||
    (step === 1 && timeframe.trim().length > 0) ||
    step === 2;

  async function finish() {
    try {
      setSaving(true);
      const goalData = {
        bigGoal,
        timeframe,
        yearlyMilestones: [],
        monthlyActions: [],
        weeklyActions: [],
        dailyActions: [],
      };

      console.log("[BYB] Using user_id:", FIXED_UUID);
      const res1 = await saveGoalToDatabase(FIXED_UUID, goalData);
      const res2 = await addTasksToTodo(FIXED_UUID, [], []); // no tasks yet in the minimal flow

      if (!res1.ok || !res2.ok) {
        console.error("[BYB] Cloud save errors:", { res1, res2 });
        alert("Saved locally, but cloud save had an issue.");
      } else {
        console.log("[BYB] Cloud save OK");
        alert("Saved to cloud ✅");
      }

      onClose();
    } catch (e) {
      console.error("[BYB] finish() error", e);
      alert("Unexpected error during save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={s.wrap}>
      {/* ✅ Always-visible sanity banner */}
      <div style={s.banner}>
        ZigGoalWizard loaded · {mountedAt}
      </div>

      <div style={s.card}>
        {step === 0 && (
          <>
            <h2 style={s.h2}>Your Biggest Goal</h2>
            <p style={s.helper}>
              We’re going to build a simple map to help you achieve it.
            </p>
            <input
              style={s.input}
              placeholder="What’s the one goal that would change everything?"
              value={bigGoal}
              onChange={(e) => setBigGoal(e.target.value)}
            />
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={s.h2}>Pick Your Timeframe</h2>
            <p style={s.helper}>How long will it take?</p>
            <select
              style={s.select}
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="">Select timeframe</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3 years">3 years</option>
              <option value="4 years">4 years</option>
              <option value="5 years">5 years</option>
            </select>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={s.h2}>Review & Save</h2>
            <div style={s.summary}>
              <div><strong>Goal:</strong> {bigGoal || "—"}</div>
              <div><strong>Timeframe:</strong> {timeframe || "—"}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                (This minimal test saves just these two fields to confirm cloud writes work. Then we’ll add the rest.)
              </div>
            </div>
          </>
        )}

        <div style={s.nav}>
          <button
            style={s.btnLight}
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              style={s.btn}
              disabled={!canNext}
              onClick={() => setStep((s) => Math.min(2, s + 1))}
            >
              Next
            </button>
          ) : (
            <button style={s.btn} disabled={saving} onClick={finish}>
              {saving ? "Saving…" : "Save to Cloud"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { marginTop: 12 },
  banner: {
    padding: "10px 12px",
    background: "#fef3c7",
    border: "1px solid #f59e0b",
    color: "#7c2d12",
    borderRadius: 10,
    marginBottom: 10,
    fontWeight: 600,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  },
  h2: { margin: "0 0 6px 0" },
  helper: { margin: "0 0 12px 0", color: "#555" },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    width: "100%",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    maxWidth: 220,
  },
  nav: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    justifyContent: "flex-end",
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
  btnLight: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  summary: {
    border: "1px dashed #ddd",
    borderRadius: 8,
    padding: 12,
    background: "#fafafa",
    display: "grid",
    gap: 6,
  },
};

export default ZigGoalWizard;
