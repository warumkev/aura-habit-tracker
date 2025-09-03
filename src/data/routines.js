import { addData } from "./firestore.js";

/**
 * Applies a routine by adding its items to the current day's timeline.
 * @param {Array<object>} items - The array of items from the routine.
 * @param {string} userId - The ID of the current user.
 * @param {Date} selectedDate - The date to which the routine should be applied.
 */
export async function applyRoutine(items, userId, selectedDate) {
  const dateStr = selectedDate.toISOString().split("T")[0];
  const appointmentsPath = `users/${userId}/appointments`;
  const todosPath = `users/${userId}/todos`;

  for (const item of items) {
    const data = {
      ...item,
      date: dateStr,
    };
    // The 'title' from a routine item becomes 'title' for an appointment
    // or 'task' for a todo.
    if (item.type === "appointment") {
      data.title = item.title;
      await addData(appointmentsPath, data);
    } else if (item.type === "todo") {
      data.task = item.title;
      delete data.title; // Remove redundant field
      await addData(todosPath, { ...data, isDone: false });
    }
  }
  // Notify the app that data has changed so the UI can refresh
  document.dispatchEvent(new CustomEvent("dataChanged"));
}
