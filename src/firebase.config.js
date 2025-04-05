// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics;
let isFirebaseAuthAvailable = false;

try {
  // Initialize Firebase app first
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");

  // Initialize Firebase Auth
  auth = getAuth(app);
  if (auth) {
    isFirebaseAuthAvailable = true;
    console.log("Firebase Auth initialized successfully");
  }

  // Initialize Firestore
  db = getFirestore(app);
  if (db) {
    console.log("Firestore initialized successfully");
  }

  // Initialize Analytics (only in production environments)
  if (import.meta.env.PROD) {
    analytics = getAnalytics(app);
    if (analytics) {
      console.log("Firebase Analytics initialized successfully");
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error.message);
  console.error("Full error:", error);
  isFirebaseAuthAvailable = false;
}

export { app, analytics, auth, db, isFirebaseAuthAvailable };