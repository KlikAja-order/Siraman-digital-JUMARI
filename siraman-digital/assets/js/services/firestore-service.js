/**
 * Firestore Database Service - Siraman Digital
 * Full CRUD Data Operations
 */

import { db } from "../config/firebase-config.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ambil Semua Dokumen dari Koleksi
export const getAllDocuments = async (collectionName, orderByField = "createdAt", orderDirection = "desc") => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, orderBy(orderByField, orderDirection));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

// Ambil Dokumen berdasarkan Limit
export const getLimitedDocuments = async (collectionName, limitCount = 6, orderByField = "createdAt") => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, orderBy(orderByField, "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching limited ${collectionName}:`, error);
    throw error;
  }
};

// Ambil Satu Dokumen Berdasarkan ID
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error(`Error fetching doc ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Tambah Dokumen Baru (Auto ID)
export const createDocument = async (collectionName, data) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating doc in ${collectionName}:`, error);
    throw error;
  }
};

// Set Dokumen dengan Custom ID / Update jika sudah ada
export const setSingleDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error setting doc ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update Dokumen
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error(`Error updating doc ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Hapus Dokumen
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting doc ${docId} in ${collectionName}:`, error);
    throw error;
  }
};
