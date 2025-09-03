import {
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { setDoc } from "firebase/firestore";
import { auth } from "../../firebase.js";
import { state } from "../../main.js";
import { switchView } from "../navigation.js";
import { setupReauthForm } from "../components/forms.js";
import { updateDataDoc } from "../../data/firestore.js";

export function renderAccountSettingsView(container) {
  container.innerHTML = `
        <div data-view="settings-account" class="space-y-6">
            <div class="flex items-center gap-4">
                <button class="back-to-settings-btn text-2xl">&larr;</button>
                <h2 class="text-3xl font-bold">Account</h2>
            </div>
            <div id="settings-feedback" class="hidden p-3 rounded-md bg-green-100 text-green-700 text-sm"></div>
            <div class="p-4 rounded-lg space-y-4" style="background-color: var(--bg-secondary);">
                <form id="name-form" class="space-y-2">
                    <label for="displayName" class="font-medium">Anzeigename</label>
                    <input type="text" id="displayName" value="${
                      state.userProfile.displayName || ""
                    }" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" />
                    <button type="submit" class="w-full text-white p-2 rounded-lg text-sm font-semibold" style="background-color: var(--accent-color);">Namen speichern</button>
                </form>
                <hr style="border-color: var(--border-color);" />
                <form id="email-form" class="space-y-2">
                    <label for="newEmail" class="font-medium">E-Mail ändern</label>
                    <input type="email" id="newEmail" placeholder="Neue E-Mail" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required />
                    <button type="submit" class="w-full text-white p-2 rounded-lg text-sm font-semibold" style="background-color: var(--accent-color);">E-Mail aktualisieren</button>
                </form>
                <hr style="border-color: var(--border-color);" />
                <form id="password-form" class="space-y-2">
                    <label for="newPassword" class="font-medium">Passwort ändern</label>
                    <input type="password" id="newPassword" placeholder="Neues Passwort" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required />
                    <button type="submit" class="w-full text-white p-2 rounded-lg text-sm font-semibold" style="background-color: var(--accent-color);">Passwort aktualisieren</button>
                </form>
                <hr style="border-color: var(--border-color);" />
                <button id="settings-logout-btn" class="w-full text-left text-red-500 font-semibold p-2">Abmelden</button>
            </div>
        </div>
    `;
  setupAccountSettingsListeners();
}

function setupAccountSettingsListeners() {
  document.querySelector(".back-to-settings-btn").onclick = () =>
    switchView("settings");
  document.getElementById("settings-logout-btn").onclick = () => signOut(auth);

  document.getElementById("name-form").onsubmit = async (e) => {
    e.preventDefault();
    const newName = document.getElementById("displayName").value;
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: newName });
      const profilePath = `users/${state.userId}/profile/data`;
      await updateDataDoc(profilePath, { displayName: newName });
      state.userProfile.displayName = newName;
      showFeedback("Name erfolgreich aktualisiert.");
    }
  };

  document.getElementById("email-form").onsubmit = (e) => {
    e.preventDefault();
    const newEmail = document.getElementById("newEmail").value;
    setupReauthForm(async () => {
      await updateEmail(auth.currentUser, newEmail);
      showFeedback("E-Mail erfolgreich aktualisiert.");
    });
  };

  document.getElementById("password-form").onsubmit = (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    setupReauthForm(async () => {
      await updatePassword(auth.currentUser, newPassword);
      showFeedback("Passwort erfolgreich aktualisiert.");
    });
  };
}

export function showFeedback(message, isError = false) {
  const feedbackDiv = document.getElementById("settings-feedback");
  if (!feedbackDiv) return;
  feedbackDiv.textContent = message;
  feedbackDiv.classList.remove("hidden");
  feedbackDiv.classList.toggle("bg-red-100", isError);
  feedbackDiv.classList.toggle("text-red-700", isError);
  feedbackDiv.classList.toggle("bg-green-100", !isError);
  feedbackDiv.classList.toggle("text-green-700", !isError);
  setTimeout(() => feedbackDiv.classList.add("hidden"), 3000);
}
