import { switchView } from "../navigation.js";
import { openFormModal } from "../components/forms.js";

export function renderInfoSettingsView(container) {
  container.innerHTML = `
        <div data-view="settings-info" class="space-y-6 active">
            <div class="flex items-center gap-4">
                <button class="back-to-settings-btn text-2xl">&larr;</button>
                <h2 class="text-3xl font-bold">Info</h2>
            </div>
            <div class="p-4 rounded-lg space-y-2" style="background-color: var(--bg-secondary);">
                <p><strong>Aura</strong> - Version 1.0.0</p>
                <p style="color: var(--text-secondary);">Eine App zur Organisation deines Alltags.</p>
                <a href="https://kevintamme.com" target="_blank" class="text-blue-500 hover:underline">Portfolio ansehen</a>
                <a href="#" class="privacy-link-info text-blue-500 hover:underline block pt-2">Datenschutz</a>
            </div>
        </div>
    `;
  setupInfoSettingsListeners();
}

function setupInfoSettingsListeners() {
  document.querySelector(".back-to-settings-btn").onclick = () =>
    switchView("settings");
  document.querySelector(".privacy-link-info").onclick = (e) => {
    e.preventDefault();
    openFormModal("privacy-policy");
  };
}
