# Aura - Habit Tracker PWA

Aura ist eine moderne, responsive Progressive Web App (PWA) zur Organisation des Alltags. Sie kombiniert einen Kalender, eine To-do-Liste und einen Gewohnheits-Tracker in einer einzigen, minimalistischen Oberfläche. Das Projekt wurde von einer monolithischen HTML-Datei in eine moderne, modulare Vite-Anwendung refaktorisiert.

## ✨ Features

- **Benutzerauthentifizierung:** Sichere Anmeldung und Registrierung über Firebase Authentication.
- **Dynamischer Kalender:** Eine wochenbasierte Kalenderansicht zur einfachen Navigation.
- **Tages-Timeline:** Eine übersichtliche Darstellung aller Termine, Aufgaben und Gewohnheiten für den ausgewählten Tag.
- **CRUD-Operationen:** Erstellen, Bearbeiten und Löschen von Terminen, Aufgaben und Gewohnheiten in Echtzeit.
- **Routinen:** Benutzerdefinierte Routinen (z.B. "Morgenroutine") können erstellt und auf jeden beliebigen Tag angewendet werden.
- **Responsive & Mobile-First:** Das Design ist vollständig responsiv und für eine optimale mobile Nutzung ausgelegt.
- **Dark Mode:** Ein anpassbarer Dark Mode, der sich die Präferenz des Benutzers merkt.
- **PWA-fähig:** Die Anwendung ist als Progressive Web App installierbar und bietet Offline-Grundfunktionalität durch einen Service Worker.

## 🚀 Tech Stack

- **Frontend:** Vanilla JavaScript (ES Modules)
- **Build-Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Datenbank:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **PWA:** Service Worker & Web Manifest

## 🛠️ Lokales Setup

Um das Projekt lokal auszuführen, folgen Sie bitte diesen Schritten:

**1. Repository klonen:**

```bash
git clone [https://github.com/warumkev/aura-habit-tracker.git](https://github.com/warumkev/aura-habit-tracker.git)
cd aura-habit-tracker
```

**2. Abhängigkeiten installieren:**

```bash
npm install
```

**3. Firebase-Konfiguration erstellen:**

Erstellen Sie eine Datei namens firebase-config.js im Hauptverzeichnis des Projekts. Kopieren Sie den folgenden Inhalt hinein und ersetzen Sie die Platzhalter durch Ihre eigenen Firebase-Projektdaten:

```bash
// firebase-config.js
export const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_STORAGE_BUCKET",
  messagingSenderId: "DEIN_MESSAGING_SENDER_ID",
  appId: "DEIN_APP_ID"
};
```

Wichtig: Diese Datei ist in der `.gitignore`-Datei aufgeführt, um zu verhindern, dass Ihre sensiblen Daten in das Git-Repository gelangen.

**4. Firestore-Sicherheitsregeln einrichten:**

Stellen Sie sicher, dass Sie die Sicherheitsregeln in Ihrer Firebase Firestore-Datenbank konfiguriert haben, um angemeldeten Benutzern den Zugriff auf ihre eigenen Daten zu ermöglichen. Navigieren Sie zu `Firestore Database -> Regeln` und verwenden Sie:

```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**5. Entwicklungsserver starten:**

```bash
npm run dev
```

Die Anwendung ist nun unter http://localhost:5173 (oder einem anderen von Vite angegebenen Port) verfügbar.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen finden Sie in der `LICENSE`-Datei.
