import { supabase } from "../supabaseClient";

export async function addTasksToTodo(userId, dailyActions, weeklyActions) {
  const today = new Date().toISOString().split("T")[0];

  const formatTasks = (tasks, frequency) => {
    return tasks.map(task => ({
      user_id: userId,
      task,
      frequency, // 'daily' or 'weekly'
      completed: false,
      created_at: today,
      rollover: true,
      big_goal_task: true
    }));
  };

  const allTasks = [
    ...formatTasks(dailyActions, "daily"),
    ...formatTasks(weeklyActions, "weekly")
  ];

  try {
    const { error } = await supabase.from("todos").insert(allTasks);
    if (error) throw error;
    console.log("✅ To-do tasks added successfully");
  } catch (err) {
    console.error("❌ Error adding tasks:", err.message);
  }
}
