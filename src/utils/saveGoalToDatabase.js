import { supabase } from "../supabaseClient";

export async function saveGoalToDatabase(userId, goalData) {
  // Always keep a local backup
  try {
    const existing = JSON.parse(localStorage.getItem("byb:bigGoal") || "null");
    localStorage.setItem("byb:bigGoal", JSON.stringify({ ...goalData, userId, savedAt: new Date().toISOString() }));
    if (!supabase) return { ok: true, localOnly: true, message: "Saved locally (no Supabase client)" };
    const payload = {
  user_id: userId, // MUST be the UUID above
  bigGoal: goalData.bigGoal || null,
  timeframe: goalData.timeframe || null,
  yearlyMilestones: goalData.yearlyMilestones || [],
  monthlyActions: goalData.monthlyActions || [],
  weeklyActions: goalData.weeklyActions || [],
  dailyActions: goalData.dailyActions || [],
};

    const { error } = await supabase.from("big_goals").insert([payload]);
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error("saveGoalToDatabase error:", err);
    return { ok: false, error: err.message };
  }
}
