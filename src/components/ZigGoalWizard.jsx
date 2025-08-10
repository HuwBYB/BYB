// src/components/ZigGoalWizard.jsx
import React, { useState, useEffect } from "react";
import ZigQuotes from "./ZigQuotes";
import { saveGoalToDatabase } from "../utils/saveGoalToDatabase";
import { addTasksToTodo } from "../utils/addTasksToTodo";
import AlfredSpeechBubble from "./AlfredSpeechBubble";

/* ------------------------ Timeframe helpers (robust) ------------------------ */
function normalize(tf = "") {
  return tf.toLowerCase().trim().replace(/\s+/g, " ");
}
// Parse "6 months", "6m", "1 year", "1y", etc.
function parseTimeframe(tfRaw) {
  const tf = normalize(tfRaw);
  const m = tf.match(/(\d+)\s*(m|mo|mon|month|months|y|yr|yrs|year|years)/i);
  if (!m) return { months: 0, years: 0 };
  const n = Number(m[1]) || 0;
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("m")) return { months: n, years: 0 };
  return { months: 0, years: n };
}
// 6 months → midpoint; 1 year → midpoint; 2–5 years → yearly breakdown
function needsMidpoint(tf) {
  const { months, years } = parseTimeframe(tf);
  return months === 6 || years === 1;
}
function midpointLabel(tf) {
  const { months, years } = parseTimeframe(tf);
  if (months === 6) return "3-month checkpoint";
  if (years === 1) return "6-month checkpoint";
  return "";
}
function yearlyCount(tf) {
  const { years } = parseTimeframe(tf);
  return years >= 2 ? years - 1 : 0; // Year 1..(N-1). Final year == Big Goal.
}

/* --------------------------------- Steps ---------------------------------- */
const BASE_STEPS = [
  {
    key: "bigGoal",
    title: "Your Biggest Goal",
    helper:
      "We’re going to build a map to achieve it — because a goal without direction is just a dream.",
  },
  {
    key: "timeframe",
    title: "Pick Your Timeframe",
    helper:
      "How long will it take? Choose below — we’ll break it into smaller steps so progress feels automatic.",
  },
  // dynamic step 3 inserted here based on timeframe (midpoint or yearly)
  {
    key: "monthly",
    title: "Monthly Actions",
    helper:
      "Now let’s get practical. What should happen each month to stay on track? We’ll add these to your monthly to-dos.",
  },
  {
    key: "weekly",
    title: "Weekly Actions",
    helper:
      "Breaking it down further… what will you do each week to stay on course?",
  },
  {
    key: "daily",
    title: "Daily Actions",
    helper:
      "Finally — the baby steps! One small thing you can do every day. These go straight to your daily to-dos.",
  },
  {
    key: "finish",
    title: "All Set",
    helper:
      "We’ll save your plan and add your actions to your to-dos. Time to begin.",
  },
];

/* ------------------------------- Component -------------------------------- */
export default function ZigGoalWizard({
  userId = "11111111-1111-1111-1111-111111111111",
  onClose = () => {},
}) { ... }

}) {
  const [quote, setQuote] = useState("");
  const [current, setCurrent] = useState(0);
  const [dynamicSteps, setDynamicSteps] = useState(BASE_STEPS);
  const [saving, setSaving] = useState(false);
  const [showAlfred, setShowAlfred] = useState(false);

  const [goalData, setGoalData] = useState({
    bigGoal: "",
    timeframe: "",
    midpoint: "", // for 6m / 1y
    yearlyMilestones: [], // for 2y+
    monthlyActions: [],
    weeklyActions: [],
    dailyActions: [],
  });

  useEffect(() => {
    setQuote(ZigQuotes[Math.floor(Math.random() * ZigQuotes.length)]);
  }, []);

  // Rebuild steps whenever timeframe changes (and reset to the first dynamic step)
  useEffect(() => {
    const tf = goalData.timeframe;
    let steps = [...BASE_STEPS];

    if (tf && needsMidpoint(tf)) {
      steps.splice(2, 0, {
        key: "midpoint",
        title: "Halfway Checkpoint",
        helper: `How will you know you’re on course by the ${midpointLabel(
          tf
        )}? Define what must be true.`,
      });
    } else if (tf && yearlyCount(tf) > 0) {
      steps.splice(2, 0, {
        key: "yearly",
        title: "Milestones: Year by Year",
        helper:
          "Where should you be by the end of each year to stay on track? (We’ll stop at the final year — that’s your Big Goal.)",
      });
    }

    setDynamicSteps(steps);

    // Ensure the visible step matches the new flow
    if (goalData.timeframe) {
      setCurrent(2);
    } else {
      setCurrent((prev) => Math.min(prev, steps.length - 1));
    }
  }, [goalData.timeframe]);

  const total = dynamicSteps.length;
  const step = dynamicSteps[current];
  const pct = Math.round((current / (total - 1)) * 100);

  /* ----------------------------- Field helpers ---------------------------- */
  const addField = (field) =>
    setGoalData((p) => ({ ...p, [field]: [...(p[field] || []), ""] }));

  const updateField = (field, idx, val) =>
    setGoalData((p) => {
      const copy = [...(p[field] || [])];
      copy[idx] = val;
      return { ...p, [field]: copy };
    });

  // Generate Year 1..(N-1) inputs for 2–5 year goals
  function ensureYearlyFields() {
    const n = yearlyCount(goalData.timeframe);
    if (n <= 0) return;
    setGoalData((p) => {
      const arr = Array.from(
        { length: n },
        (_, i) => p.yearlyMilestones?.[i] || ""
      );
      return { ...p, yearlyMilestones: arr };
    });
  }

  /* --------------------------------- Nav ---------------------------------- */
  const next = () => setCurrent((c) => Math.min(c + 1, total - 1));
  const back = () => setCurrent((c) => Math.max(c - 1, 0));

  async function finish() {
    try {
      setSaving(true);
      const res1 = await saveGoalToDatabase(userId, goalData);
      const res2 = await addTasksToTodo(
        userId,
        goalData.dailyActions,
        goalData.weeklyActions
      );
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

  /* ------------------------------ Validation ------------------------------ */
  function canProceed() {
    const k = step.key;
    if (k === "bigGoal") return !!goalData.bigGoal?.trim();
    if (k === "timeframe") return !!goalData.timeframe;
    if (k === "midpoint") return !!goalData.midpoint?.trim();
    if (k === "yearly") return (goalData.yearlyMilestones || []).some(Boolean);
    if (k === "monthly") return (goalData.monthlyActions || []).some(Boolean);
    if (k === "weekly") return (goalData.weeklyActions || []).some(Boolean);
    if (k === "daily") return (goalData.dailyActions || []).some(Boolean);
    return true;
  }

  /* --------------------------------- UI ----------------------------------- */
  return (
    <div style={s.wrap}>
      <div style={s.quote}>“{quote}” — Zig Ziglar</div>

      <div style={s.progressWrap} aria-label="Progress">
        <div style={{ ...s.progressBar, width: `${pct}%` }} />
        <div style={s.progressText}>
          {step.title} ({current + 1} of {total})
        </div>
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
              onChange={(e) =>
                setGoalData({ ...goalData, bigGoal: e.target.value })
              }
            />
          </div>
        )}

        {step.key === "timeframe" && (
          <div style={s.body}>
            <select
              style={s.select}
              value={goalData.timeframe}
              onChange={(e) =>
                setGoalData({ ...goalData, timeframe: e.target.value })
              }
            >
              <option value="">Select timeframe</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3 years">3 years</option>
              <option value="4 years">4 years</option>
              <option value="5 years">5 years</option>
            </select>
          </div>
        )}

        {step.key === "midpoint" && (
          <div style={s.body}>
            <input
              style={s.input}
              placeholder={`By the ${midpointLabel(
                goalData.timeframe
              )}, what must be true?`}
              value={goalData.midpoint}
              onChange={(e) =>
                setGoalData({ ...goalData, midpoint: e.target.value })
              }
            />
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
            <button style={s.btn} onClick={ensureYearlyFields}>
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
            <button style={s.btn} onClick={() => addField("monthlyActions")}>
              + Add monthly target
            </button>
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
            <button style={s.btn} onClick={() => addField("weeklyActions")}>
              + Add weekly action
            </button>
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
            <button style={s.btn} onClick={() => addField("dailyActions")}>
              + Add daily habit
            </button>
          </div>
        )}

        {step.key === "finish" && (
          <div style={s.body}>
            <div style={s.summaryBox}>
              <div>
                <strong>Goal:</strong> {goalData.bigGoal || "—"}
              </div>
              <div>
                <strong>Timeframe:</strong> {goalData.timeframe || "—"}
              </div>
              {needsMidpoint(goalData.timeframe) && (
                <div>
                  <strong>{midpointLabel(goalData.timeframe)}:</strong>{" "}
                  {goalData.midpoint || "—"}
                </div>
              )}
              {yearlyCount(goalData.timeframe) > 0 && (
                <div>
                  <strong>Yearly milestones:</strong>{" "}
                  {listOrDash(goalData.yearlyMilestones)}
                </div>
              )}
              <div>
                <strong>Monthly actions:</strong>{" "}
                {listOrDash(goalData.monthlyActions)}
              </div>
              <div>
                <strong>Weekly actions:</strong>{" "}
                {listOrDash(goalData.weeklyActions)}
              </div>
              <div>
                <strong>Daily actions:</strong>{" "}
                {listOrDash(goalData.dailyActions)}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={s.nav}>
          <button style={s.btnLight} onClick={back} disabled={current === 0}>
            Back
          </button>
          {step.key !== "finish" ? (
            <button
              style={s.btn}
              onClick={next}
              disabled={!canProceed()}
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

/* ------------------------------- Tiny utils ------------------------------- */
function listOrDash(arr) {
  const a = (arr || []).filter(Boolean);
  return a.length ? a.join(" • ") : "—";
}

/* --------------------------------- Styles -------------------------------- */
const s = {
  wrap: { marginTop: 12 },
  quote: {
    padding: "10px 12px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  progressWrap: {
    position: "relative",
    height: 8,
    background: "#eee",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    transition: "width .2s",
    background: "#16a34a",
  },
  progressText: { marginTop: 8, fontSize: 12, color: "#666" },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  },
  h2: { margin: "0 0 6px 0" },
  helper: { margin: "0 0 12px 0", color: "#555" },
  body: { display: "grid", gap: 8 },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
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
  summaryBox: {
    border: "1px dashed #ddd",
    borderRadius: 8,
    padding: 12,
    background: "#fafafa",
    display: "grid",
    gap: 6,
  },
};
