import { supabase } from "../supabaseClient";

export async function addTasksToTodo(userId, dailyActions = [], weeklyActions = []) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Local backup
    const local = JSON.parse(localStorage.getItem("byb:todos:seed") || "[]");
    const localTasks = [
      ...dailyActions.map(t => ({ user_id: userId, task: t, frequency: "daily", completed: false, created_at: today, rollover: true, big_goal_task: true })),
      ...weeklyActions.map(t => ({ user_id: userId, task: t, frequency: "weekly", completed: false, created_at: today, rollover: true, big_goal_task: true })),
    ];
    localStorage.setItem("byb:todos:seed", JSON.stringify([...local, ...localTasks]));

    if (!supabase) return { ok: true, localOnly: true };

    const rows = localTasks.map(t => ({
      user_id: t.user_id,
      task: t.task,
      frequency: t.frequency,
      completed: t.completed,
      created_at: t.created_at,  // date column in Supabase
      rollover: t.rollover,
      big_goal_task: t.big_goal_task,
    }));

    const { error } = await supabase.from("todos").insert(rows);
    if (error) throw error;

    return { ok: true };
  } catch (err) {
    console.error("addTasksToTodo error:", err);
    return { ok: false, error: err.message };
  }
}
