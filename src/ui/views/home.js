import { state } from "../../main.js";
import {
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { openRoutineSelectionModal } from "../components/modals.js";
import { openFormModal } from "../components/forms.js";
import { deleteData, getDataDoc } from "../../data/firestore.js";

const WEEKS_TO_SHOW = 10;
let unsubscribeTimeline;

export function renderHomeView(container) {
  container.innerHTML = `
        <div data-view="home" class="space-y-6 active">
            <header class="flex justify-between items-center">
                <div>
                    <p class="text-sm" style="color: var(--text-secondary);">Aura</p>
                    <h1 class="text-2xl font-bold">Kalender, To-Do & Gewohnheiten</h1>
                </div>
            </header>
            <div id="summary-container"></div>
            <div id="date-picker-container"></div>
            <div id="timeline-container"></div>
        </div>`;

  setupDatePicker();
  loadDataForSelectedDate();

  // Listen for data changes to reload the timeline
  document.addEventListener("dataChanged", loadDataForSelectedDate);
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeeks(today) {
  const weeks = [];
  const startOfCurrentWeek = getStartOfWeek(today);

  for (
    let i = -Math.floor(WEEKS_TO_SHOW / 2);
    i < Math.ceil(WEEKS_TO_SHOW / 2);
    i++
  ) {
    const week = [];
    const weekStartDate = new Date(startOfCurrentWeek);
    weekStartDate.setDate(weekStartDate.getDate() + i * 7);
    for (let j = 0; j < 7; j++) {
      const day = new Date(weekStartDate);
      day.setDate(day.getDate() + j);
      week.push(day);
    }
    weeks.push(week);
  }
  return weeks;
}

async function fetchEventDates() {
  if (!state.userId) return;
  const appointmentsPath = `users/${state.userId}/appointments`;
  const todosPath = `users/${state.userId}/todos`;

  const [appointmentDocs, todoDocs] = await Promise.all([
    getDocs(collection(db, appointmentsPath)),
    getDocs(collection(db, todosPath)),
  ]);

  state.eventDates.clear();
  appointmentDocs.forEach((doc) => state.eventDates.add(doc.data().date));
  todoDocs.forEach((doc) => state.eventDates.add(doc.data().date));
}

async function setupDatePicker() {
  await fetchEventDates();
  const container = document.getElementById("date-picker-container");
  if (!container) return;
  const weeks = getWeeks(new Date());

  container.innerHTML = `
        <div class="date-picker-wrapper">
            <div id="date-picker" class="date-picker-content">
            ${weeks
              .map(
                (week, weekIndex) => `
                <div class="week-view" data-week-index="${weekIndex}">
                    ${week
                      .map((date) => {
                        const isSelected =
                          date.toDateString() ===
                          state.selectedDate.toDateString();
                        const dateStr = date.toISOString().split("T")[0];
                        const hasEvent = state.eventDates.has(dateStr);
                        return `<button data-date="${date.toISOString()}" class="date-picker-btn flex flex-col items-center justify-center p-2 rounded-full w-12 h-16 transition-colors ${
                          isSelected ? "selected" : "hover:opacity-80"
                        }">
                            <span class="text-xs" style="color: var(--text-secondary);">${date.toLocaleDateString(
                              "de-DE",
                              { weekday: "short" }
                            )}</span>
                            <span class="font-bold text-lg mt-1">${date.getDate()}</span>
                            ${
                              hasEvent
                                ? '<div class="h-1.5 w-1.5 bg-red-500 rounded-full mt-1"></div>'
                                : '<div class="h-1.5 w-1.5"></div>'
                            }
                        </button>`;
                      })
                      .join("")}
                </div>
            `
              )
              .join("")}
            </div>
        </div>`;

  document.querySelectorAll(".date-picker-btn").forEach((btn) => {
    btn.onclick = () => {
      state.selectedDate = new Date(btn.dataset.date);
      document
        .querySelector(".date-picker-btn.selected")
        ?.classList.remove("selected");
      btn.classList.add("selected");
      loadDataForSelectedDate();
    };
  });

  const datePicker = document.querySelector(".date-picker-wrapper");
  if (datePicker) {
    const currentWeekIndex = Math.floor(WEEKS_TO_SHOW / 2);
    datePicker.scrollLeft = datePicker.offsetWidth * currentWeekIndex;
  }
}

async function loadDataForSelectedDate() {
  const summaryContainer = document.getElementById("summary-container");
  const timelineContainer = document.getElementById("timeline-container");
  if (!summaryContainer || !timelineContainer || !state.userId) return;

  const selectedDateStr = state.selectedDate.toISOString().split("T")[0];
  const appointmentsPath = `users/${state.userId}/appointments`;
  const todosPath = `users/${state.userId}/todos`;
  const habitsPath = `users/${state.userId}/habits`;

  try {
    const [appointmentDocs, todoDocs, habitDocs] = await Promise.all([
      getDocs(
        query(
          collection(db, appointmentsPath),
          where("date", "==", selectedDateStr)
        )
      ),
      getDocs(
        query(collection(db, todosPath), where("date", "==", selectedDateStr))
      ),
      getDocs(collection(db, habitsPath)),
    ]);

    const appointments = appointmentDocs.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      type: "appointment",
    }));
    let todos = todoDocs.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      type: "todo",
    }));
    const habits = habitDocs.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      type: "habit",
    }));

    appointments.sort((a, b) =>
      (a.time || "00:00").localeCompare(b.time || "00:00")
    );

    // Sort todos: incomplete first (by time), then complete
    todos.sort((a, b) => {
      if (a.isDone !== b.isDone) {
        return a.isDone ? 1 : -1;
      }
      return (a.time || "23:59").localeCompare(b.time || "23:59");
    });

    renderSummary(summaryContainer, appointments, todos, habits);
    renderTimeline(timelineContainer, appointments, todos, habits);
  } catch (error) {
    console.error("Error loading timeline:", error);
    timelineContainer.innerHTML = `<p class="text-center text-red-500 mt-8">Timeline konnte nicht geladen werden.</p>`;
  }
}

function calculateFreeTimeMessage(events) {
  if (events.length === 0) return "Dein Tag ist heute frei.";

  const dayStart = 8 * 60; // 8:00 AM
  const dayEnd = 22 * 60; // 10:00 PM

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const busySlots = events
    .map((e) => ({
      start: timeToMinutes(e.time),
      end: timeToMinutes(e.endTime) || timeToMinutes(e.time) + 60,
    }))
    .sort((a, b) => a.start - b.start);

  let freeSlots = [];
  let lastBusyTime = dayStart;

  busySlots.forEach((slot) => {
    if (slot.start > lastBusyTime) {
      freeSlots.push({ start: lastBusyTime, end: slot.start });
    }
    lastBusyTime = Math.max(lastBusyTime, slot.end);
  });

  if (dayEnd > lastBusyTime) {
    freeSlots.push({ start: lastBusyTime, end: dayEnd });
  }

  if (freeSlots.length === 0) return "Dein Tag ist ziemlich voll.";

  const longestSlot = freeSlots.reduce(
    (max, slot) => (slot.end - slot.start > max.end - max.start ? slot : max),
    { start: 0, end: 0 }
  );

  return `Deine längste freie Zeit ist von ${minutesToTime(
    longestSlot.start
  )} bis ${minutesToTime(longestSlot.end)}.`;
}

function renderSummary(container, appointments, todos, habits) {
  const eventsWithTime = [...appointments, ...todos].filter(
    (item) => item.time
  );
  const freeTimeMessage = calculateFreeTimeMessage(eventsWithTime);
  const welcomeMessage = `Guten Morgen, ${
    state.userProfile.displayName || ""
  }!`;

  container.innerHTML = `
        <div class="summary-view">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-4xl font-bold">${state.selectedDate.toLocaleDateString(
                  "de-DE",
                  { weekday: "short" }
                )}<span class="text-red-500">.</span></h2>
                <p style="color: var(--text-secondary);">${state.selectedDate.toLocaleDateString(
                  "de-DE",
                  { day: "numeric", month: "long", year: "numeric" }
                )}</p>
            </div>
            <p class="text-lg mb-2">${welcomeMessage}</p>
            <p style="color: var(--text-secondary);">
                Du hast
                <span class="font-semibold" style="color: var(--text-primary);">${
                  appointments.length
                } Termin(e)</span>,
                <span class="font-semibold" style="color: var(--text-primary);">${
                  todos.length
                } Aufgabe(n)</span> und
                <span class="font-semibold" style="color: var(--text-primary);">${
                  habits.length
                } Gewohnheit(en)</span>
                heute.
            </p>
            <p class="text-sm mt-2" style="color: var(--text-secondary);">${freeTimeMessage}</p>
            <button id="apply-routine-btn" class="w-full mt-4 text-white p-2 rounded-lg text-sm font-semibold" style="background-color: var(--accent-color);">Routine anwenden</button>
        </div>`;

  document.getElementById("apply-routine-btn").onclick =
    openRoutineSelectionModal;
}

function renderTimeline(container, appointments, todos, habits) {
  let timelineHTML = "";
  if (appointments.length > 0) {
    timelineHTML +=
      `<h3 class="font-bold mb-2">Termine</h3>` +
      appointments.map(renderTimelineItem).join("");
  }
  if (todos.length > 0) {
    timelineHTML +=
      `<h3 class="font-bold mt-4 mb-2">Aufgaben</h3>` +
      todos.map(renderTimelineItem).join("");
  }
  if (habits.length > 0) {
    timelineHTML +=
      `<h3 class="font-bold mt-4 mb-2">Gewohnheiten</h3>` +
      habits.map(renderTimelineItem).join("");
  }

  if (timelineHTML === "") {
    container.innerHTML = `<div class="timeline-list-container"><p class="p-4 text-center" style="color: var(--text-secondary);">Keine Einträge für heute.</p></div>`;
  } else {
    container.innerHTML = `<div class="timeline-list-container">${timelineHTML}</div>`;
  }
  setupTimelineListeners();
}

function renderTimelineItem(item) {
  const title = item.title || item.task || item.habitName;
  let timeDisplay = "";
  let icon;

  const selectedDateStr = state.selectedDate.toISOString().split("T")[0];

  // Build the display based on item type
  if (item.type === "appointment") {
    icon = "☀️";
    if (item.time && item.endTime) {
      timeDisplay = `<div class="text-sm" style="color: var(--text-secondary);">${item.time} - ${item.endTime}</div>`;
    } else if (item.time) {
      timeDisplay = `<div class="text-sm" style="color: var(--text-secondary);">${item.time}</div>`;
    }
  } else if (item.type === "todo") {
    icon = `
            <input 
                type="checkbox" 
                data-id="${item.id}" 
                class="todo-checkbox h-6 w-6 rounded-lg border-2" 
                style="border-color: var(--border-color); background-color: var(--bg-primary);"
                ${item.isDone ? "checked" : ""}
            />`;
    if (item.time) {
      timeDisplay = `<div class="text-sm" style="color: var(--text-secondary);">${item.time}</div>`;
    }
  } else if (item.type === "habit") {
    icon = "🔄";
    const progress = item.dailyCompletions?.[selectedDateStr] || 0;
    const goal = item.dailyGoal;
    const streak = calculateStreak(item);
    timeDisplay = `
            <div class="flex flex-col items-end">
                <div class="habit-progress">${progress}</div>
                <div class="habit-streak">${streak} 🔥</div>
            </div>
        `;
  }

  const isDone =
    item.isDone ||
    (item.type === "habit" &&
      (item.dailyCompletions?.[selectedDateStr] || 0) >= (item.dailyGoal || 1));
  const doneClass = isDone ? "task-done" : "";

  return `<div class="timeline-list-item-wrapper">
                <div class="timeline-list-item-actions">
                     <div data-id="${item.id}" data-type="${
    item.type
  }" class="action-btn edit-btn">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                    </div>
                    <div data-id="${item.id}" data-type="${
    item.type
  }" class="action-btn delete-btn">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                </div>
                <div class="timeline-list-item-content ${
                  item.type === "habit" ? "habit-item-content" : ""
                } ${doneClass}" data-id="${item.id}" data-type="${item.type}">
                    <div class="flex-shrink-0 w-8 flex items-center justify-center">${icon}</div>
                    <div class="flex-grow ml-2"><p class="font-medium">${title}</p></div>
                    ${timeDisplay}
                </div>
            </div>`;
}

function calculateStreak(habit) {
  if (!habit.dailyCompletions) return 0;

  let streak = 0;
  // KORREKTUR: Startet die Überprüfung vom aktuell ausgewählten Datum.
  let currentDate = new Date(state.selectedDate);
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const progress = habit.dailyCompletions[dateStr] || 0;
    const goal = habit.dailyGoal || 1;

    if (progress >= goal) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Gehe zum Vortag
    } else {
      break; // Die Serie ist unterbrochen
    }
  }
  return streak;
}

function setupTimelineListeners() {
  const ACTION_WIDTH = 160;
  const SWIPE_THRESHOLD = ACTION_WIDTH / 3;

  document.querySelectorAll(".timeline-list-item-content").forEach((item) => {
    let startX = 0,
      currentTranslate = 0,
      isDragging = false;

    const closeCurrentlyOpen = () => {
      if (state.currentlyOpenSwipeItem) {
        state.currentlyOpenSwipeItem.style.transform = "translateX(0)";
        state.currentlyOpenSwipeItem = null;
      }
    };

    item.addEventListener(
      "touchstart",
      (e) => {
        if (
          state.currentlyOpenSwipeItem &&
          state.currentlyOpenSwipeItem !== item
        ) {
          closeCurrentlyOpen();
        }
        startX = e.touches[0].clientX;
        isDragging = true;
        item.style.transition = "none";
        const transformMatrix = window.getComputedStyle(item).transform;
        currentTranslate =
          transformMatrix !== "none"
            ? parseInt(transformMatrix.split(",")[4])
            : 0;
      },
      { passive: true }
    );

    item.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        let newTranslate = currentTranslate + e.touches[0].clientX - startX;
        if (newTranslate > 0) newTranslate = 0;
        if (newTranslate < -ACTION_WIDTH) newTranslate = -ACTION_WIDTH;
        item.style.transform = `translateX(${newTranslate}px)`;
      },
      { passive: true }
    );

    item.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;
      item.style.transition = "transform 0.3s ease";
      const finalTranslate =
        parseInt(window.getComputedStyle(item).transform.split(",")[4]) || 0;

      if (finalTranslate < -SWIPE_THRESHOLD) {
        item.style.transform = `translateX(-${ACTION_WIDTH}px)`;
        state.currentlyOpenSwipeItem = item;
      } else {
        item.style.transform = "translateX(0)";
        if (state.currentlyOpenSwipeItem === item) {
          state.currentlyOpenSwipeItem = null;
        }
      }
    });
  });

  document.body.addEventListener(
    "touchstart",
    (e) => {
      if (
        state.currentlyOpenSwipeItem &&
        !state.currentlyOpenSwipeItem.parentElement.contains(e.target)
      ) {
        state.currentlyOpenSwipeItem.style.transform = "translateX(0)";
        state.currentlyOpenSwipeItem = null;
      }
    },
    true
  );

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      const { id, type } = btn.dataset;
      const collectionName = type === "habit" ? "habits" : `${type}s`;
      await deleteData(`users/${state.userId}/${collectionName}`, id);
      document.dispatchEvent(new CustomEvent("dataChanged"));
    };
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = async () => {
      const { id, type } = btn.dataset;
      const collectionName = type === "habit" ? "habits" : `${type}s`;
      const docSnap = await getDataDoc(
        `users/${state.userId}/${collectionName}`,
        id
      );
      if (docSnap.exists()) {
        openFormModal(type, { id, ...docSnap.data() });
      }
    };
  });

  // Listener for todo checkboxes
  document.querySelectorAll(".todo-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const todoId = e.target.dataset.id;
      const isDone = e.target.checked;
      const collectionPath = `users/${state.userId}/todos`;

      const itemWrapper = e.target.closest(".timeline-list-item-wrapper");
      if (isDone) {
        itemWrapper.classList.add("task-completing");
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("dataChanged"));
        }, 400); // Wait for animation to finish
      } else {
        document.dispatchEvent(new CustomEvent("dataChanged"));
      }

      try {
        await updateData(collectionPath, todoId, { isDone: isDone });
      } catch (error) {
        console.error("Failed to update todo:", error);
        // Revert UI change on error
        document.dispatchEvent(new CustomEvent("dataChanged"));
      }
    });
  });

  // Listener for habit clicks
  document.querySelectorAll(".habit-item-content").forEach((item) => {
    item.addEventListener("click", async (e) => {
      const habitId = e.currentTarget.dataset.id;
      const habitRef = doc(db, `users/${state.userId}/habits`, habitId);
      const docSnap = await getDataDoc(`users/${state.userId}/habits`, habitId);

      if (docSnap.exists()) {
        const habit = docSnap.data();
        const selectedDateStr = state.selectedDate.toISOString().split("T")[0];
        const currentProgress = habit.dailyCompletions?.[selectedDateStr] || 0;
        const goal = habit.dailyGoal || 1;

        // KORREKTUR: Setzt den Fortschritt zurück, wenn das Ziel erreicht ist.
        let newProgress;
        if (currentProgress < goal) {
          newProgress = currentProgress + 1;
        } else {
          newProgress = 0; // Zurücksetzen auf 0
        }

        const updateData = {
          [`dailyCompletions.${selectedDateStr}`]: newProgress,
        };
        await updateDoc(habitRef, updateData);
        document.dispatchEvent(new CustomEvent("dataChanged"));
      }
    });
  });
}
