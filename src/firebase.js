// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgOt3nvCaOJYX-4RBOeiLPnweih3R9_Os",
  authDomain: "thacherlaundry.firebaseapp.com",
  databaseURL: "https://thacherlaundry-default-rtdb.firebaseio.com",
  projectId: "thacherlaundry",
  storageBucket: "thacherlaundry.firebasestorage.app",
  messagingSenderId: "589795146697",
  appId: "1:589795146697:web:01d304994f522286304618",
  measurementId: "G-LQZQC2QGNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if the current browser supports Firebase Cloud Messaging
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging is not supported in this browser:', error);
  }
}

export { app, database, auth, messaging, storage };
