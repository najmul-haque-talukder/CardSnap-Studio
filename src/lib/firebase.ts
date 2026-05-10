// Legacy configuration removed. Use @/firebase instead.
import { initializeFirebase } from "@/firebase";
const { firebaseApp: app, firestore: db, auth } = initializeFirebase();
export { app, db, auth };
