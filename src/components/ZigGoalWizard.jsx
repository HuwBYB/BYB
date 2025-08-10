async function finish() {
  try {
    setSaving(true);

    // 🔒 Force the UUID here so nothing upstream can override it
    const FIXED_UUID = "11111111-1111-1111-1111-111111111111";
    console.log("[BYB] Using user_id:", FIXED_UUID);

    const res1 = await saveGoalToDatabase(FIXED_UUID, goalData);
    const res2 = await addTasksToTodo(
      FIXED_UUID,
      goalData.dailyActions,
      goalData.weeklyActions
    );

    if (!res1.ok || !res2.ok) {
      console.error("[BYB] Cloud save errors:", { res1, res2 });
      alert("Saved locally, but cloud save had an issue.");
    } else {
      console.log("[BYB] Cloud save OK");
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
