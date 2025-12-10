import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyCngJO48Dzd7VcZuS63beLZTYmawiJxmaU",
    authDomain: "yolofi-48fc6.firebaseapp.com",
    projectId: "yolofi-48fc6",
    storageBucket: "yolofi-48fc6.firebasestorage.app",
    messagingSenderId: "592460882276",
    appId: "1:592460882276:web:cc072b4241793757359a71",
    measurementId: "G-XCZBT33CC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence not supported by browser');
    }
});

// Initialize Analytics
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);

export { db, auth, analytics };
