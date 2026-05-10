'use client';

import { initializeFirebase } from "@/firebase";

// Redirecting legacy exports to the new centralized system
const { firebaseApp: app, firestore: db, auth } = initializeFirebase();

export { app, db, auth };
