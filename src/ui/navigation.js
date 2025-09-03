import { state } from "../main.js";
import { renderHomeView } from "./views/home.js";
import { renderSettingsView } from "./views/settings.js";
import { openAddModal } from "./components/modals.js";
import { renderAccountSettingsView } from "./views/accountSettings.js";
import { renderAppearanceSettingsView } from "./views/appearanceSettings.js";
import { renderInfoSettingsView } from "./views/infoSettings.js";
import { renderRoutinesView } from "./views/routines.js";
import { renderRoutineEditorView } from "./views/routineEditor.js";

const views = {
  home: renderHomeView,
  settings: renderSettingsView,
  "settings-account": renderAccountSettingsView,
  "settings-appearance": renderAppearanceSettingsView,
  "settings-info": renderInfoSettingsView,
  "settings-routines": renderRoutinesView,
  "routine-editor": renderRoutineEditorView,
};

// KORREKTUR: Diese Funktion ist nur dafür verantwortlich, das Grundgerüst zu rendern.
export function renderAppLayout(container) {
  container.innerHTML = `
        <div id="view-container" class="h-full">
            <!-- Views will be rendered here -->
        </div>
    `;
}

export function setupNavigation() {
  const navContainer = document.getElementById("nav-container");
  navContainer.querySelectorAll(".nav-button").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.target));
  });

  const addBtn = document.getElementById("add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", openAddModal);
  }
}

export function switchView(viewName, data = null) {
  state.editingItem = data; // Used for passing data to editor views
  state.currentView = viewName;

  const viewContainer = document.getElementById("view-container");
  if (!viewContainer) {
    console.error("#view-container not found in the DOM!");
    return;
  }

  // Get the render function for the view
  const renderFunction = views[viewName];

  if (typeof renderFunction === "function") {
    // Render the new view
    renderFunction(viewContainer);
  } else {
    console.error(`View "${viewName}" not found.`);
    views["home"](viewContainer); // Fallback to home view
  }
  updateNavButtons(viewName);
}

function updateNavButtons(currentView) {
  document.querySelectorAll(".nav-button").forEach((btn) => {
    const svg = btn.querySelector("svg");
    const targetView = btn.dataset.target;

    // Settings is a special case, as it's a parent view
    const isActive =
      currentView === targetView ||
      (currentView.startsWith("settings") && targetView === "settings");

    if (isActive) {
      btn.classList.add("active");
      svg.style.color = "var(--accent-color)";
    } else {
      btn.classList.remove("active");
      svg.style.color = "#9ca3af"; // Default secondary text color
    }
  });
}
