import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// IMPORTANT: Create a firebase-config.js file in the root directory
// and export your Firebase configuration object.
// This file is gitignored by default.
// Example firebase-config.js:
// export const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   projectId: "...",
//   storageBucket: "...",
//   messagingSenderId: "...",
//   appId: "..."
// };
import { firebaseConfig } from "../firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable debug logging for Firestore
setLogLevel("debug");

// Export the necessary Firebase services
export { app, auth, db };
