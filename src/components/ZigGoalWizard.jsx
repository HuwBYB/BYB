// src/components/ZigGoalWizard.jsx
import React, { useState, useEffect } from "react";
import ZigQuotes from "./ZigQuotes";
import { saveGoalToDatabase } from "../utils/saveGoalToDatabase";
import { addTasksToTodo } from "../utils/addTasksToTodo";
import AlfredSpeechBubble from "./AlfredSpeechBubble";

const STEPS = [
  { key: "bigGoal", title: "Your Biggest Goal", helper: "We’re going to build a map to achieve it—because a goal without direction is just a dream." },
  { key: "timeframe", title: "Pick Your Timeframe", helper: "Now we’ll break it into clear stages so you always know what’s next." },
  { key: "yearly", title: "Milestones: Year by Year", helper: "How will you know you’re on course at each stage? Define your checkpoints." },
  { key: "monthly", title: "Monthly Actions", helper: "What should happen each month to stay on track? We’ll add these to your monthly to-dos." },
  { key: "weekly", title: "Weekly Actions", helper: "What will you do every week? We’ll schedule these for you." },
  { key: "daily", title: "Daily Actions", helper: "What tiny habit moves you closer every single day? These go to your daily to-dos." },
  { key: "finish", title: "All Set", helper: "We’ll save your plan and add your actions to your to-dos. Time to begin." },
];

export default function ZigGoalWizard({ userId = "huw-dev", onClose = () => {} }) {
  const [current, setCurrent] = useState(0);
  const [quote, setQuote] = useState("");
  const [goalData, setGoalData] = useState({
    bigGoal: "",
    timeframe: "",
    yearlyMilestones: [],
    monthlyActions: [],
    weeklyActions: [],
    dailyActions: []
  });
  const [saving, setSaving] = useState(false);
  const [showAlfred, setShowAlfred] = useState(false);

  useEffect(() => {
    setQuote(ZigQuotes[Math.floor(Math.random() * ZigQuotes.length)]);
  }, []);

  const pct = Math.round((current / (STEPS.length - 1)) * 100);

  const addField = (field) =>
    setGoalData((p) => ({ ...p, [field]: [...(p[field] || []), ""] }));

  const updateField = (field, idx, val) =>
    setGoalData((p) => {
      const copy = [...(p[field] || [])];
      copy[idx] = val;
      return { ...p, [field]: copy };
    });

  const next = () => setCurrent((c) => Math.min(c + 1, STEPS.length - 1));
  const back = () => setCurrent((c) => Math.max(c - 1, 0));

  async function finish() {
    try {
      setSaving(true);
      const res1 = await saveGoalToDatabase(userId, goalData);
      const res2 = await addTasksToTodo(userId, goalData.dailyActions, goalData.weeklyActions);
      if (!res1.ok || !res2.ok) {
        alert("Saved locally, but cloud save had an issue.");
      }
      setShowAlfred(true);
      setTimeout(() => {
        setShowAlfred(false);
        onClose();
      }, 3500);
    } finally {
      setSaving(false);
    }
  }

  const step = STEPS[current];

  return (
    <div style={s.wrap}>
      <div style={s.quote}>“{quote}” — Zig Ziglar</div>

      <div style={s.progressWrap} aria-label="Progress">
        <div style={{ ...s.progressBar, width: `${pct}%` }} />
        <div style={s.progressText}>{step.title} ({current + 1} of {STEPS.length})</div>
      </div>

      <div style={s.card}>
        <h2 style={s.h2}>{step.title}</h2>
        <p style={s.helper}>{step.helper}</p>

        {/* Step bodies */}
        {step.key === "bigGoal" && (
          <div style={s.body}>
            <input
              style={s.input}
              placeholder="If you could only achieve one thing in the next few years…"
              value={goalData.bigGoal}
              onChange={(e) => setGoalData({ ...goalData, bigGoal: e.target.value })}
            />
          </div>
        )}

        {step.key === "timeframe" && (
          <div style={s.body}>
            <select
              style={s.select}
              value={goalData.timeframe}
              onChange={(e) => setGoalData({ ...goalData, timeframe: e.target.value })}
            >
              <option value="">Select timeframe</option>
              <option>6 months</option>
              <option>1 year</option>
              <option>2 years</option>
              <option>3 years</option>
              <option>4 years</option>
              <option>5 years</option>
            </select>
          </div>
        )}

        {step.key === "yearly" && (
          <div style={s.body}>
            {(goalData.yearlyMilestones || []).map((m, i) => (
              <input
                key={i}
                style={s.input}
                placeholder={`End of Year ${i + 1}: what must be true?`}
                value={m}
                onChange={(e) => updateField("yearlyMilestones", i, e.target.value)}
              />
            ))}
            <button style={s.btn} onClick={() => addYearlyForTimeframe(goalData, setGoalData)}>
              Generate fields for my timeframe
            </button>
          </div>
        )}

        {step.key === "monthly" && (
          <div style={s.body}>
            {(goalData.monthlyActions || []).map((m, i) => (
              <input
                key={i}
                style={s.input}
                placeholder={`Monthly target ${i + 1}`}
                value={m}
                onChange={(e) => updateField("monthlyActions", i, e.target.value)}
              />
            ))}
            <button style={s.btn} onClick={() => addField("monthlyActions")}>+ Add monthly target</button>
          </div>
        )}

        {step.key === "weekly" && (
          <div style={s.body}>
            {(goalData.weeklyActions || []).map((m, i) => (
              <input
                key={i}
                style={s.input}
                placeholder={`Weekly action ${i + 1}`}
                value={m}
                onChange={(e) => updateField("weeklyActions", i, e.target.value)}
              />
            ))}
            <button style={s.btn} onClick={() => addField("weeklyActions")}>+ Add weekly action</button>
          </div>
        )}

        {step.key === "daily" && (
          <div style={s.body}>
            {(goalData.dailyActions || []).map((m, i) => (
              <input
                key={i}
                style={s.input}
                placeholder={`Daily habit ${i + 1}`}
                value={m}
                onChange={(e) => updateField("dailyActions", i, e.target.value)}
              />
            ))}
            <button style={s.btn} onClick={() => addField("dailyActions")}>+ Add daily habit</button>
          </div>
        )}

        {step.key === "finish" && (
          <div style={s.body}>
            <div style={s.summaryBox}>
              <div><strong>Goal:</strong> {goalData.bigGoal || "—"}</div>
              <div><strong>Timeframe:</strong> {goalData.timeframe || "—"}</div>
              <div><strong>Yearly milestones:</strong> {listOrDash(goalData.yearlyMilestones)}</div>
              <div><strong>Monthly actions:</strong> {listOrDash(goalData.monthlyActions)}</div>
              <div><strong>Weekly actions:</strong> {listOrDash(goalData.weeklyActions)}</div>
              <div><strong>Daily actions:</strong> {listOrDash(goalData.dailyActions)}</div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={s.nav}>
          <button style={s.btnLight} onClick={back} disabled={current === 0}>Back</button>
          {step.key !== "finish" ? (
            <button
              style={s.btn}
              onClick={next}
              disabled={!canProceed(step.key, goalData)}
            >
              Next
            </button>
          ) : (
            <button style={s.btn} onClick={finish} disabled={saving}>
              {saving ? "Saving…" : "Save & Add to To-Dos"}
            </button>
          )}
        </div>
      </div>

      {showAlfred && (
        <AlfredSpeechBubble message="Outstanding, sir. Your map is saved and your actions are queued. Onward." />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function canProceed(stepKey, data) {
  if (stepKey === "bigGoal") return !!data.bigGoal?.trim();
  if (stepKey === "timeframe") return !!data.timeframe;
  if (stepKey === "yearly") return (data.yearlyMilestones || []).some(Boolean);
  if (stepKey === "monthly") return (data.monthlyActions || []).some(Boolean);
  if (stepKey === "weekly") return (data.weeklyActions || []).some(Boolean);
  if (stepKey === "daily") return (data.dailyActions || []).some(Boolean);
  return true;
}

function addYearlyForTimeframe(goalData, setGoalData) {
  const map = {
    "6 months": 0, // skip yearly for half-year goals
    "1 year": 1,
    "2 years": 2,
    "3 years": 3,
    "4 years": 4,
    "5 years": 5
  };
  const n = map[goalData.timeframe] ?? 0;
  if (n === 0) {
    // ensure at least one field if user wants it
    setGoalData((p) => ({ ...p, yearlyMilestones: p.yearlyMilestones?.length ? p.yearlyMilestones : [""] }));
    return;
  }
  const arr = Array.from({ length: n }, (_, i) => goalData.yearlyMilestones?.[i] || "");
  setGoalData((p) => ({ ...p, yearlyMilestones: arr }));
}

function listOrDash(arr) {
  const a = (arr || []).filter(Boolean);
  return a.length ? a.join(" • ") : "—";
}

/* ---------- styles ---------- */

const s = {
  wrap: { marginTop: 12 },
  quote: { padding: '10px 12px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10 },
  progressWrap: { position: 'relative', height: 8, background: '#eee', borderRadius: 999, overflow: 'hidden', marginBottom: 10 },
  progressBar: { position: 'absolute', top: 0, left: 0, bottom: 0, transition: 'width .2s', background: '#16a34a' },
  progressText: { marginTop: 8, fontSize: 12, color: '#666' },
  card: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' },
  h2: { margin: '0 0 6px 0' },
  helper: { margin: '0 0 12px 0', color: '#555' },
  body: { display: 'grid', gap: 8 },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8 },
  select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, maxWidth: 220 },
  nav: { display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' },
  btn: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#111', color: '#fff', cursor: 'pointer' },
  btnLight: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  summaryBox: { border: '1px dashed #ddd', borderRadius: 8, padding: 12, background: '#fafafa', display: 'grid', gap: 6 }
};
