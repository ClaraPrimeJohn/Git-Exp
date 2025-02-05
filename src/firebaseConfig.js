// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjl0Zi4J8XmjxA_aaMyJKls5aSCWE3FYM",
  authDomain: "prime-demo-2bcf2.firebaseapp.com",
  projectId: "prime-demo-2bcf2",
  storageBucket: "prime-demo-2bcf2.firebasestorage.app",
  messagingSenderId: "913587946117",
  appId: "1:913587946117:web:04269ba8339c20299f9fec",
  measurementId: "G-8YSK4R1Q3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
