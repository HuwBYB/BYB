import { supabase } from "../supabaseClient";

export async function saveGoalToDatabase(userId, goalData) {
  try {
    const { error } = await supabase
      .from("big_goals")
      .insert([{ user_id: userId, ...goalData, created_at: new Date() }]);

    if (error) throw error;
    console.log("✅ Goal saved successfully");
  } catch (err) {
    console.error("❌ Error saving goal:", err.message);
  }
}
