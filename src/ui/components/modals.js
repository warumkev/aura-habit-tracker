import { state } from "../../main.js";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { applyRoutine } from "../../data/routines.js";
import { openFormModal } from "./forms.js";

const modalContainer = document.getElementById("modal-container");

function renderModal(id, content, extraClasses = "") {
  const modalTemplate = `
        <div id="${id}-backdrop" class="modal-backdrop fixed inset-0 z-40 hidden ${extraClasses}">
            <div id="${id}-content" class="modal-content fixed bottom-0 left-0 right-0 p-4 rounded-t-2xl" style="background-color: var(--bg-secondary);">
                <div class="max-w-lg mx-auto">
                    ${content}
                </div>
            </div>
        </div>
    `;
  return modalTemplate;
}

function showModal(id) {
  const backdrop = document.getElementById(`${id}-backdrop`);
  if (backdrop) {
    backdrop.classList.remove("hidden");
    setTimeout(() => backdrop.classList.add("active"), 10);
  }
}

export function closeModal(id) {
  const backdrop = document.getElementById(`${id}-backdrop`);
  if (backdrop) {
    backdrop.classList.remove("active");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
  }
}

export function openAddModal() {
  const content = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg">Neu erstellen</h3>
            <button id="close-add-modal-btn" class="text-2xl">&times;</button>
        </div>
        <div class="space-y-3">
            <button data-form="appointment" class="modal-option-btn w-full text-left p-4 rounded-lg font-semibold" style="background-color: var(--bg-primary)">Neuer Termin</button>
            <button data-form="todo" class="modal-option-btn w-full text-left p-4 rounded-lg font-semibold" style="background-color: var(--bg-primary)">Neue Aufgabe</button>
            <button data-form="habit" class="modal-option-btn w-full text-left p-4 rounded-lg font-semibold" style="background-color: var(--bg-primary)">Neue Gewohnheit</button>
        </div>
    `;
  modalContainer.innerHTML = renderModal("add-modal", content);
  showModal("add-modal");

  document.getElementById("close-add-modal-btn").onclick = () =>
    closeModal("add-modal");
  document.getElementById("add-modal-backdrop").onclick = (e) => {
    if (e.target.id === "add-modal-backdrop") closeModal("add-modal");
  };

  document.querySelectorAll(".modal-option-btn").forEach((btn) => {
    btn.onclick = () => {
      closeModal("add-modal");
      state.editingItem = null;
      openFormModal(btn.dataset.form);
    };
  });
}

export async function openRoutineSelectionModal() {
  const routinesPath = `users/${state.userId}/routines`;
  const routinesSnap = await getDocs(collection(db, routinesPath));
  let routineButtons;

  if (routinesSnap.empty) {
    routineButtons = `<p style="color: var(--text-secondary);">Keine Routinen gefunden. Erstelle zuerst eine in den Einstellungen.</p>`;
  } else {
    routineButtons = routinesSnap.docs
      .map((d) => {
        const routine = { id: d.id, ...d.data() };
        return `<button data-id="${routine.id}" class="routine-select-btn w-full text-left p-4 rounded-lg font-semibold" style="background-color: var(--bg-primary);">${routine.name}</button>`;
      })
      .join("");
  }

  const content = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg">Routine anwenden</h3>
            <button id="close-routine-modal-btn" class="text-2xl">&times;</button>
        </div>
        <div id="routines-selection-list" class="space-y-3">
            ${routineButtons}
        </div>
    `;
  modalContainer.innerHTML = renderModal("routine-modal", content);
  showModal("routine-modal");

  document.getElementById("close-routine-modal-btn").onclick = () =>
    closeModal("routine-modal");
  document.getElementById("routine-modal-backdrop").onclick = (e) => {
    if (e.target.id === "routine-modal-backdrop") closeModal("routine-modal");
  };

  document.querySelectorAll(".routine-select-btn").forEach((btn) => {
    btn.onclick = async () => {
      const routineId = btn.dataset.id;
      const routineDoc = await getDoc(doc(db, routinesPath, routineId));
      if (routineDoc.exists()) {
        // Pass state directly to the function to break the circular dependency
        await applyRoutine(
          routineDoc.data().items,
          state.userId,
          state.selectedDate
        );
      }
      closeModal("routine-modal");
    };
  });
}
