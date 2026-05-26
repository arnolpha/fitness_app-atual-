import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyASLjbeALWDUMCxqEMKHZH5e33GEaiqVCM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fitness-app-8f5e6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitness-app-8f5e6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fitness-app-8f5e6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "741968757960",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:741968757960:web:46e2265ef9f892ae8e91fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);