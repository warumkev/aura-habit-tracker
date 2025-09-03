import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { state } from "./main";
// KORRIGIERT: Importiert jetzt direkt aus forms.js
import { openFormModal } from "./ui/components/forms.js";

/**
 * Renders the login/registration screen into the main app container.
 * @param {HTMLElement} container - The main app container element.
 */
export function renderLoginScreen(container) {
  container.innerHTML = `
        <div data-view="login" class="max-w-sm mx-auto mt-16 space-y-6 active">
            <div class="text-center">
                <img src="/icons/icon-128x128.png" alt="App Icon" class="mx-auto h-20 w-20 mb-4 rounded-full">
                <h1 class="text-3xl font-bold" style="color: var(--text-primary);">Aura</h1>
                <p style="color: var(--text-secondary);">Melden Sie sich an, um fortzufahren.</p>
            </div>
            <div id="auth-error" class="hidden p-3 rounded-md bg-red-100 text-red-700 text-sm"></div>
            <form id="login-form" class="space-y-4">
                <input type="text" id="username" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-secondary); border-color: var(--border-color);" placeholder="Anzeigename" />
                <input type="email" id="email" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-secondary); border-color: var(--border-color);" placeholder="E-Mail" required />
                <input type="password" id="password" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-secondary); border-color: var(--border-color);" placeholder="Passwort" required />
                <div class="flex items-center space-x-2">
                    <input type="checkbox" id="privacy-check" class="h-4 w-4 rounded" />
                    <label for="privacy-check" class="text-sm" style="color: var(--text-secondary);">Ich stimme den <a href="#" id="privacy-link" class="underline">Datenschutzbestimmungen</a> zu.</label>
                </div>
                <div class="flex flex-col gap-2 pt-2">
                    <button type="submit" id="login-btn" class="w-full text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-opacity" style="background-color: var(--accent-color);">Anmelden</button>
                    <button type="button" id="register-btn" class="w-full p-3 rounded-lg font-semibold hover:opacity-90 transition-opacity" style="background-color: var(--bg-secondary); color: var(--text-primary);" disabled>Konto erstellen</button>
                </div>
            </form>
        </div>
    `;
  setupAuthFormListeners();
}

/**
 * Sets up event listeners for the authentication form (login, register, etc.).
 */
function setupAuthFormListeners() {
  const loginForm = document.getElementById("login-form");
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const errorDiv = document.getElementById("auth-error");
  const privacyCheck = document.getElementById("privacy-check");
  const usernameInput = document.getElementById("username");

  privacyCheck.onchange = () => {
    registerBtn.disabled = !privacyCheck.checked;
  };

  document.getElementById("privacy-link").onclick = (e) => {
    e.preventDefault();
    openFormModal("privacy-policy");
  };

  const showError = (message) => {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  };

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      showError("Anmeldung fehlgeschlagen: " + error.message)
    );
  });

  registerBtn.addEventListener("click", () => {
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    const username = usernameInput.value;

    if (!username) {
      showError("Bitte gib einen Anzeigenamen ein.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        const profileRef = doc(db, `users/${user.uid}/profile/data`);
        await setDoc(profileRef, { displayName: username });
        // The onAuthStateChanged listener in main.js will handle the UI update
      })
      .catch((error) =>
        showError("Registrierung fehlgeschlagen: " + error.message)
      );
  });
}
