import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

/**
 * Adds a new document to a specified collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {object} data - The data for the new document.
 * @returns {Promise<DocumentReference>}
 */
export async function addData(collectionPath, data) {
  return await addDoc(collection(db, collectionPath), data);
}

/**
 * Updates an existing document in a specified collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} docId - The ID of the document to update.
 * @param {object} data - The data to update.
 * @returns {Promise<void>}
 */
export async function updateData(collectionPath, docId, data) {
  const docRef = doc(db, collectionPath, docId);
  return await updateDoc(docRef, data);
}

/**
 * Updates a specific document, creating it if it doesn't exist.
 * @param {string} docPath - The full path to the document.
 * @param {object} data - The data to set/merge.
 * @returns {Promise<void>}
 */
export async function updateDataDoc(docPath, data) {
  const docRef = doc(db, docPath);
  return await setDoc(docRef, data, { merge: true });
}

/**
 * Deletes a document from a specified collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} docId - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export async function deleteData(collectionPath, docId) {
  const docRef = doc(db, collectionPath, docId);
  return await deleteDoc(docRef);
}

/**
 * Retrieves a single document from a specified collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} docId - The ID of the document to retrieve.
 * @returns {Promise<DocumentSnapshot>}
 */
export async function getDataDoc(collectionPath, docId) {
  const docRef = doc(db, collectionPath, docId);
  return await getDoc(docRef);
}
