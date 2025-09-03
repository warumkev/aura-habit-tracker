import { switchView } from "../navigation.js";
import { applyTheme, saveTheme } from "../theme.js";

export function renderAppearanceSettingsView(container) {
  container.innerHTML = `
        <div data-view="settings-appearance" class="space-y-6">
            <div class="flex items-center gap-4">
                <button class="back-to-settings-btn text-2xl">&larr;</button>
                <h2 class="text-3xl font-bold">Darstellung</h2>
            </div>
            <div class="p-4 rounded-lg" style="background-color: var(--bg-secondary);">
                <div class="flex justify-between items-center">
                    <span>Dunkelmodus</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="theme-toggle-checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black"></div>
                    </label>
                </div>
            </div>
        </div>
    `;
  setupAppearanceSettingsListeners();
}

function setupAppearanceSettingsListeners() {
  document.querySelector(".back-to-settings-btn").onclick = () =>
    switchView("settings");

  const themeToggle = document.getElementById("theme-toggle-checkbox");
  themeToggle.checked = document.body.classList.contains("dark");
  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    saveTheme(newTheme);
    applyTheme(newTheme);
  });
}
