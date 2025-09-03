import { state } from '../../main.js';
import { switchView } from '../navigation.js';
import { openFormModal } from '../components/forms.js';
import { addData, updateData } from '../../data/firestore.js';

let routineItems = [];

export function renderRoutineEditorView(container) {
    routineItems = state.editingItem ? [...state.editingItem.items] || [] : [];

    container.innerHTML = `
        <div data-view="routine-editor" class="space-y-6">
            <div class="flex items-center gap-4">
                <button class="back-to-routines-btn text-2xl">&larr;</button>
                <h2 class="text-3xl font-bold">${state.editingItem ? "Routine bearbeiten" : "Neue Routine"}</h2>
            </div>
            <form id="routine-form" class="space-y-4 p-4 rounded-xl" style="background-color: var(--bg-secondary);">
                <input name="name" placeholder="Name der Routine" value="${state.editingItem?.name || ''}" class="w-full p-3 border rounded-lg" style="background-color: var(--bg-primary); border-color: var(--border-color);" required/>
                <div id="routine-items-list" class="space-y-2"></div>
                <button type="button" id="add-routine-item-btn" class="w-full p-2 rounded-lg text-sm font-semibold" style="background-color: var(--bg-primary); color: var(--text-primary);">Element hinzufügen</button>
                <button type="submit" class="w-full text-white p-3 rounded-lg font-semibold" style="background-color: var(--accent-color);">${state.editingItem ? "Speichern" : "Hinzufügen"}</button>
            </form>
        </div>
    `;
    renderRoutineItems();
    setupRoutineEditorListeners();
}

function renderRoutineItems() {
    const itemsList = document.getElementById('routine-items-list');
    if (!itemsList) return;
    itemsList.innerHTML = routineItems.map((item, index) => `
        <div class="flex justify-between items-center p-2 rounded-lg" style="background-color: var(--bg-primary);">
            <span>${item.title || item.task} (${item.type})</span>
            <button type="button" data-index="${index}" class="remove-item-btn text-red-500 font-bold">X</button>
        </div>
    `).join('');

    itemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.onclick = () => {
            routineItems.splice(parseInt(btn.dataset.index), 1);
            renderRoutineItems();
        };
    });
}

function setupRoutineEditorListeners() {
    document.querySelector('.back-to-routines-btn').onclick = () => switchView('settings-routines');
    document.getElementById('add-routine-item-btn').onclick = () => openFormModal('routine-item');

    // Listen for the custom event to add an item
    document.addEventListener('addRoutineItem', handleAddRoutineItem);

    const routineForm = document.getElementById('routine-form');
    routineForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = routineForm.elements.name.value;
        if (!name) return;
        
        const routineData = { name, items: routineItems };
        const collectionPath = `users/${state.userId}/routines`;
        
        if (state.editingItem) {
            await updateData(collectionPath, state.editingItem.id, routineData);
        } else {
            await addData(collectionPath, routineData);
        }
        
        // Clean up
        document.removeEventListener('addRoutineItem', handleAddRoutineItem);
        state.editingItem = null;
        routineItems = [];
        switchView('settings-routines');
    };
}

function handleAddRoutineItem(e) {
    routineItems.push(e.detail);
    renderRoutineItems();
}
