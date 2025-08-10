import { supabase } from "../supabaseClient";
import { ensureUuid } from "../constants";

export async function addTasksToTodo(userId, dailyActions = [], weeklyActions = []) {
  try {
    if (!supabase) return { ok: false, error: "supabase-not-configured" };

    const uid = ensureUuid(userId); // ← force UUID
    const rows = [
      ...dailyActions.filter(Boolean).map((t) => ({
        user_id: uid,
        task: t,
        frequency: "daily",
        completed: false,
        rollover: true,
        big_goal_task: true,
      })),
      ...weeklyActions.filter(Boolean).map((t) => ({
        user_id: uid,
        task: t,
        frequency: "weekly",
        completed: false,
        rollover: true,
        big_goal_task: true,
      })),
    ];

    if (rows.length === 0) return { ok: true };
    console.log("[BYB] inserting todos rows:", rows);
    const { error } = await supabase.from("todos").insert(rows);
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (err) {
    console.error("addTasksToTodo error:", err);
    return { ok: false, error: err?.message || "unknown" };
  }
}
