import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { state } from '../../main.js';
import { switchView } from '../navigation.js';
import { deleteData, getDataDoc } from '../../data/firestore.js';

let unsubscribeRoutines;

export function renderRoutinesView(container) {
    container.innerHTML = `
        <div data-view="settings-routines" class="space-y-6">
            <div class="flex items-center gap-4">
                <button class="back-to-settings-btn text-2xl">&larr;</button>
                <h2 class="text-3xl font-bold">Routinen</h2>
            </div>
            <div id="routines-list" class="space-y-2"></div>
            <button id="add-routine-btn" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color);">Neue Routine erstellen</button>
        </div>
    `;
    setupRoutinesListeners();
}

function setupRoutinesListeners() {
    document.querySelector('.back-to-settings-btn').onclick = () => switchView('settings');
    document.getElementById('add-routine-btn').onclick = () => switchView('routine-editor', null);

    const routinesList = document.getElementById('routines-list');
    const routinesPath = `users/${state.userId}/routines`;
    
    // Unsubscribe from previous listener if it exists
    if (unsubscribeRoutines) unsubscribeRoutines();

    unsubscribeRoutines = onSnapshot(collection(db, routinesPath), (snapshot) => {
        if (snapshot.empty) {
            routinesList.innerHTML = `<p style="color: var(--text-secondary);">Noch keine Routinen erstellt.</p>`;
            return;
        }
        routinesList.innerHTML = snapshot.docs.map(doc => {
            const routine = { id: doc.id, ...doc.data() };
            return `<div class="flex justify-between items-center p-4 rounded-lg" style="background-color: var(--bg-primary);">
                        <span class="font-semibold">${routine.name}</span>
                        <div>
                            <button data-id="${routine.id}" class="edit-routine-btn text-blue-500 mr-4">Bearbeiten</button>
                            <button data-id="${routine.id}" class="delete-routine-btn text-red-500">Löschen</button>
                        </div>
                    </div>`;
        }).join('');

        routinesList.querySelectorAll('.delete-routine-btn').forEach(btn => {
            btn.onclick = async () => await deleteData(routinesPath, btn.dataset.id);
        });

        routinesList.querySelectorAll('.edit-routine-btn').forEach(btn => {
            btn.onclick = async () => {
                const docSnap = await getDataDoc(routinesPath, btn.dataset.id);
                if (docSnap.exists()) {
                    switchView('routine-editor', { id: docSnap.id, ...docSnap.data() });
                }
            };
        });
    });
}
