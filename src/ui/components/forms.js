import { state } from "../../main.js";
import { addData, updateData } from "../../data/firestore.js";
import { closeModal } from "./modals.js";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase.js";
import { showFeedback } from "../views/accountSettings.js";

const modalContainer = document.getElementById("modal-container");

function renderFormModal(content) {
  modalContainer.innerHTML = `
        <div id="form-modal-backdrop" class="modal-backdrop fixed inset-0 z-40 hidden">
          <div id="form-modal-content" class="modal-content fixed bottom-0 left-0 right-0 p-4 rounded-t-2xl" style="background-color: var(--bg-secondary);">
             ${content}
          </div>
        </div>
    `;
  const backdrop = document.getElementById("form-modal-backdrop");
  backdrop.classList.remove("hidden");
  setTimeout(() => backdrop.classList.add("active"), 10);

  // Attach close listeners
  backdrop.querySelector(".close-form-btn").onclick = () =>
    closeModal("form-modal");
}

export function openFormModal(formType, data = null) {
  state.editingItem = data;
  const formRenderers = {
    appointment: setupAppointmentForm,
    todo: setupTodoForm,
    habit: setupHabitForm,
    "routine-item": setupRoutineItemForm,
    "privacy-policy": setupPrivacyPolicyView,
  };

  if (formRenderers[formType]) {
    formRenderers[formType]();
  } else {
    console.error(`Unknown form type: ${formType}`);
  }
}

export function setupAppointmentForm() {
  const content = `
          <div class="space-y-6 p-4 max-w-lg mx-auto">
              <div class="flex justify-between items-center">
                  <h2 class="text-3xl font-bold">${
                    state.editingItem ? "Termin bearbeiten" : "Neuer Termin"
                  }</h2>
                  <button class="close-form-btn text-2xl">&times;</button>
              </div>
              <form id="appointment-form" class="space-y-3">
                  <input name="title" placeholder="Titel" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required />
                  <textarea name="description" placeholder="Beschreibung" class="w-full p-3 border rounded-lg h-24" style="background-color: var(--bg-primary); border-color: var(--border-color);"></textarea>
                  <div class="flex gap-4">
                      <input name="date" type="date" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required />
                      <input name="time" type="time" placeholder="Startzeit" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required />
                      <input name="endTime" type="time" placeholder="Endzeit" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" />
                  </div>
                  <button type="submit" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color);">${
                    state.editingItem ? "Speichern" : "Hinzufügen"
                  }</button>
              </form>
          </div>`;
  renderFormModal(content);

  const form = document.getElementById("appointment-form");
  if (state.editingItem) {
    form.elements.title.value = state.editingItem.title || "";
    form.elements.description.value = state.editingItem.description || "";
    form.elements.date.value = state.editingItem.date || "";
    form.elements.time.value = state.editingItem.time || "";
    form.elements.endTime.value = state.editingItem.endTime || "";
  } else {
    const now = new Date();
    form.elements.date.value = now.toISOString().split("T")[0];
    form.elements.time.value = now.toTimeString().split(" ")[0].substring(0, 5);
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    if (!formData.title || !formData.date || !formData.time) return;

    const collectionPath = `users/${state.userId}/appointments`;
    if (state.editingItem) {
      await updateData(collectionPath, state.editingItem.id, formData);
    } else {
      await addData(collectionPath, formData);
    }
    state.editingItem = null;
    closeModal("form-modal");
    document.dispatchEvent(new CustomEvent("dataChanged"));
  };
}

export function setupTodoForm() {
  const content = `
        <div class="space-y-6 p-4 max-w-lg mx-auto">
             <div class="flex justify-between items-center">
                <h2 class="text-3xl font-bold">${
                  state.editingItem ? "Aufgabe bearbeiten" : "Neue Aufgabe"
                }</h2>
                <button class="close-form-btn text-2xl">&times;</button>
            </div>
            <form id="todo-form" class="space-y-3">
                <input name="task" placeholder="Aufgabe" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                <input name="category" placeholder="Kategorie" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);"/>
                <div class="flex gap-2">
                    <input name="date" type="date" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                    <input name="time" type="time" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);"/>
                </div>
                <button type="submit" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color);">${
                  state.editingItem ? "Speichern" : "Hinzufügen"
                }</button>
            </form>
        </div>`;
  renderFormModal(content);

  const form = document.getElementById("todo-form");
  if (state.editingItem) {
    form.elements.task.value = state.editingItem.task || "";
    form.elements.category.value = state.editingItem.category || "";
    form.elements.date.value = state.editingItem.date || "";
    form.elements.time.value = state.editingItem.time || "";
  } else {
    const now = new Date();
    form.elements.date.value = now.toISOString().split("T")[0];
    form.elements.time.value = now.toTimeString().split(" ")[0].substring(0, 5);
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    if (!formData.task || !formData.date) return;

    const collectionPath = `users/${state.userId}/todos`;
    if (state.editingItem) {
      await updateData(collectionPath, state.editingItem.id, formData);
    } else {
      await addData(collectionPath, { ...formData, isDone: false });
    }
    state.editingItem = null;
    closeModal("form-modal");
    document.dispatchEvent(new CustomEvent("dataChanged"));
  };
}

export function setupHabitForm() {
  const content = `
          <div class="space-y-6 p-4 max-w-lg mx-auto">
              <div class="flex justify-between items-center">
                  <h2 class="text-3xl font-bold">${
                    state.editingItem
                      ? "Gewohnheit bearbeiten"
                      : "Neue Gewohnheit"
                  }</h2>
                  <button class="close-form-btn text-2xl">&times;</button>
              </div>
              <form id="habit-form" class="space-y-3">
                  <input name="habitName" placeholder="Gewohnheit" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                  <input name="dailyGoal" type="number" min="1" placeholder="Tagesziel (z.B. 3 mal)" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                  <button type="submit" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color);">${
                    state.editingItem ? "Speichern" : "Hinzufügen"
                  }</button>
              </form>
          </div>`;
  renderFormModal(content);

  const form = document.getElementById("habit-form");
  if (state.editingItem) {
    form.elements.habitName.value = state.editingItem.habitName || "";
    form.elements.dailyGoal.value = state.editingItem.dailyGoal || 1;
  } else {
    form.elements.dailyGoal.value = 1;
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const habitName = form.elements.habitName.value;
    const dailyGoal = parseInt(form.elements.dailyGoal.value) || 1;
    if (!habitName.trim()) return;

    const collectionPath = `users/${state.userId}/habits`;
    const data = { habitName, dailyGoal };

    if (state.editingItem) {
      await updateData(collectionPath, state.editingItem.id, data);
    } else {
      await addData(collectionPath, { ...data, dailyCompletions: {} });
    }
    state.editingItem = null;
    closeModal("form-modal");
    document.dispatchEvent(new CustomEvent("dataChanged"));
  };
}

export function setupRoutineItemForm() {
  const content = `
        <div class="space-y-6 p-4 max-w-lg mx-auto">
            <div class="flex justify-between items-center">
                <h2 class="text-3xl font-bold">Element zur Routine hinzufügen</h2>
                <button class="close-form-btn text-2xl">&times;</button>
            </div>
            <form id="add-routine-item-form" class="space-y-3">
                <select name="type" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);">
                    <option value="appointment">Termin</option>
                    <option value="todo">Aufgabe</option>
                </select>
                <input name="title" placeholder="Titel" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                <div class="flex gap-2">
                    <input name="time" type="time" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" placeholder="Startzeit"/>
                    <input name="endTime" id="routine-item-end-time" type="time" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" placeholder="Endzeit"/>
                </div>
                <button type="submit" class="w-full p-2 rounded-lg text-sm font-semibold" style="background-color: var(--bg-primary); color: var(--text-primary);">Hinzufügen</button>
            </form>
        </div>`;
  renderFormModal(content);

  const form = document.getElementById("add-routine-item-form");
  const typeSelect = form.elements.type;
  const endTimeInput = document.getElementById("routine-item-end-time");

  // Function to toggle endTime visibility
  const toggleEndTime = () => {
    if (typeSelect.value === "appointment") {
      endTimeInput.classList.remove("hidden");
    } else {
      endTimeInput.classList.add("hidden");
    }
  };

  // Initial check and event listener
  toggleEndTime();
  typeSelect.addEventListener("change", toggleEndTime);

  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (data.type !== "appointment") {
      delete data.endTime; // Ensure endTime is not present for todos
    }

    document.dispatchEvent(new CustomEvent("addRoutineItem", { detail: data }));
    closeModal("form-modal");
  };
}

export function setupPrivacyPolicyView() {
  const content = `
        <div class="space-y-4 p-4 max-w-lg mx-auto">
            <div class="flex justify-between items-center">
                <h2 class="text-3xl font-bold">Datenschutz</h2>
                <button class="close-form-btn text-2xl">&times;</button>
            </div>
            <div class="prose dark:prose-invert max-w-none h-96 overflow-y-auto">
                <p><strong>Datenschutzerklärung</strong></p>
                <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Nachfolgend informieren wir Sie über die Erhebung, Verarbeitung und Nutzung Ihrer Daten.</p>
                <p><strong>1. Erhobene Daten</strong></p>
                <p>Wir erheben und verarbeiten folgende Daten: Anzeigename, E-Mail-Adresse, Passwort (verschlüsselt), sowie die von Ihnen erstellten Termine, Aufgaben und Gewohnheiten.</p>
                <p><strong>2. Zweck der Datenverarbeitung</strong></p>
                <p>Die Daten werden ausschließlich zur Bereitstellung der App-Funktionalitäten verwendet, insbesondere zur Authentifizierung und Speicherung Ihrer persönlichen Einträge.</p>
                <p><strong>3. Datenspeicherung</strong></p>
                <p>Ihre Daten werden sicher bei Google Firebase, einem Dienst der Google Ireland Limited, gespeichert. Die Datenübertragung erfolgt verschlüsselt.</p>
                <p><strong>4. Ihre Rechte</strong></p>
                <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Sie können Ihr Konto und alle damit verbundenen Daten in den Einstellungen löschen.</p>
            </div>
        </div>`;
  renderFormModal(content);
}

export function setupReauthForm(actionCallback) {
  const content = `
        <div class="max-w-lg mx-auto">
          <h3 class="font-bold text-lg mb-2">Bestätigung erforderlich</h3>
          <p class="text-sm mb-4" style="color: var(--text-secondary)">
            Bitte gib dein aktuelles Passwort ein, um fortzufahren.
          </p>
          <div id="reauth-error" class="hidden p-3 mb-4 rounded-md bg-red-100 text-red-700 text-sm"></div>
          <form id="reauth-form" class="space-y-4">
            <input type="password" id="reauth-password" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required placeholder="Aktuelles Passwort" />
            <div class="flex gap-2">
              <button type="button" id="cancel-reauth-btn" class="w-full p-3 rounded-lg font-semibold" style="background-color: var(--bg-primary)">Abbrechen</button>
              <button type="submit" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color)">Bestätigen</button>
            </div>
          </form>
        </div>
     `;
  modalContainer.innerHTML = `
        <div id="reauth-modal-backdrop" class="modal-backdrop fixed inset-0 z-50 hidden">
            <div class="modal-content fixed bottom-0 left-0 right-0 p-4 rounded-t-2xl" style="background-color: var(--bg-secondary)">
                ${content}
            </div>
        </div>
    `;

  const backdrop = document.getElementById("reauth-modal-backdrop");
  backdrop.classList.remove("hidden");
  setTimeout(() => backdrop.classList.add("active"), 10);

  document.getElementById("cancel-reauth-btn").onclick = () =>
    closeModal("reauth-modal");

  document.getElementById("reauth-form").onsubmit = async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById("reauth-error");
    errorDiv.classList.add("hidden");
    const password = document.getElementById("reauth-password").value;
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      await actionCallback();
      closeModal("reauth-modal");
    } catch (error) {
      errorDiv.textContent = "Falsches Passwort. Bitte versuche es erneut.";
      errorDiv.classList.remove("hidden");
    }
  };
}
