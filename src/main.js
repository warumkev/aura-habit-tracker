// Importiert die Haupt-CSS-Datei, damit Vite sie verarbeiten kann.
import "./style.css";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { renderLoginScreen } from "./auth";
// KORREKTUR: Importiert die Layout-Funktion und benennt sie um, um Klarheit zu schaffen.
import {
  setupNavigation,
  switchView,
  renderAppLayout as renderNavigationLayout,
} from "./ui/navigation";
import { applyTheme, getSavedTheme } from "./ui/theme";
import { registerServiceWorker } from "./pwa";

// Globaler App-Zustand
export const state = {
  userId: null,
  userProfile: {},
  selectedDate: new Date(),
  eventDates: new Set(),
  currentlyOpenSwipeItem: null,
  editingItem: null,
  currentView: "home",
};

const appContainer = document.getElementById("app-container");
const mainNav = document.getElementById("main-nav");

/**
 * Initialisiert die Anwendung
 */
async function initialize() {
  // 1. Theme anwenden
  applyTheme(getSavedTheme());

  // 2. Service Worker registrieren
  registerServiceWorker();

  // 3. Authentifizierungs-Status überwachen
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      state.userId = user.uid;
      // Nutzerprofil laden oder erstellen
      const profileRef = doc(db, `users/${user.uid}/profile/data`);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        state.userProfile = profileSnap.data();
      } else {
        state.userProfile = { displayName: user.displayName || "" };
        await setDoc(profileRef, state.userProfile);
      }
      mainNav.classList.remove("hidden");
      renderAppLayout();
    } else {
      state.userId = null;
      state.userProfile = {};
      mainNav.classList.add("hidden");
      renderLoginScreen(appContainer);
    }
  });
}

/**
 * Baut das Hauptlayout der App auf, nachdem der Benutzer eingeloggt ist.
 */
function renderAppLayout() {
  // KORREKTUR: Stellt den korrekten Ablauf sicher.
  // 1. Zuerst das Grundgerüst mit dem #view-container in den appContainer rendern.
  renderNavigationLayout(appContainer);

  // 2. Dann die Navigationselemente (Buttons etc.) einrichten.
  setupNavigation();

  // 3. Erst jetzt, da der Container existiert, die Startansicht laden.
  switchView(state.currentView);
}

// Startet die Anwendung, sobald das DOM geladen ist.
document.addEventListener("DOMContentLoaded", initialize);
