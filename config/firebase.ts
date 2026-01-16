import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ CONFIG CỦA BẠN
const firebaseConfig = {
    apiKey: "AIzaSyBvEsjv64HZWaFWux8zBWJV-ghIcfbf30k",
    authDomain: "app-car-56a56.firebaseapp.com",
    projectId: "app-car-56a56",
    storageBucket: "app-car-56a56.firebasestorage.app",
    messagingSenderId: "1087743822620",
    appId: "1:1087743822620:web:93e181f2a513f59fb848d9",
    measurementId: "G-ZJP7YJ6TE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase v12 initialized successfully');