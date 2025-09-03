import { switchView } from "../navigation.js";

export function renderSettingsView(container) {
  container.innerHTML = `
        <div data-view="settings" class="space-y-6 active">
            <h2 class="text-3xl font-bold">Einstellungen</h2>
            <div class="space-y-2">
                <button data-target="settings-account" class="settings-link w-full flex justify-between items-center p-4 rounded-lg" style="background-color: var(--bg-secondary);">
                    <span class="font-semibold">Account</span>
                    <span>></span>
                </button>
                <button data-target="settings-appearance" class="settings-link w-full flex justify-between items-center p-4 rounded-lg" style="background-color: var(--bg-secondary);">
                    <span class="font-semibold">Darstellung</span>
                    <span>></span>
                </button>
                <button data-target="settings-routines" class="settings-link w-full flex justify-between items-center p-4 rounded-lg" style="background-color: var(--bg-secondary);">
                    <span class="font-semibold">Routinen</span>
                    <span>></span>
                </button>
                <button data-target="settings-info" class="settings-link w-full flex justify-between items-center p-4 rounded-lg" style="background-color: var(--bg-secondary);">
                    <span class="font-semibold">Info</span>
                    <span>></span>
                </button>
            </div>
        </div>
    `;

  document.querySelectorAll(".settings-link").forEach((link) => {
    link.onclick = () => switchView(link.dataset.target);
  });
}
