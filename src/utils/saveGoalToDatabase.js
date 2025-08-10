import { supabase } from "../supabaseClient";
import { ensureUuid } from "../constants";

export async function saveGoalToDatabase(userId, goalData) {
  try {
    if (!supabase) return { ok: false, error: "supabase-not-configured" };

    const uid = ensureUuid(userId); // ← force UUID
    const payload = {
      user_id: uid,
      bigGoal: goalData.bigGoal ?? null,
      timeframe: goalData.timeframe ?? null,
      yearlyMilestones: (goalData.yearlyMilestones || []).filter(Boolean),
      monthlyActions: (goalData.monthlyActions || []).filter(Boolean),
      weeklyActions: (goalData.weeklyActions || []).filter(Boolean),
      dailyActions: (goalData.dailyActions || []).filter(Boolean),
    };

    console.log("[BYB] inserting big_goals payload:", payload);
    const { error } = await supabase.from("big_goals").insert([payload]);
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (err) {
    console.error("saveGoalToDatabase error:", err);
    return { ok: false, error: err?.message || "unknown" };
  }
}
