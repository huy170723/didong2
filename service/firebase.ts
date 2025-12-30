// app/service/firebase.ts
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBVESJV64HZNAFMux82BMJV-ghIcfbf3AK",
  authDomain: "app-car-56a56.firebaseapp.com",
  projectId: "app-car-56a56",
  storageBucket: "app-car-56a56.firebasestorage.app",
  messagingSenderId: "1087743822620",
  appId: "1:1087743822620:web:93e181f2a513f59fb848d9",
  measurementId: "G-ZJPYJ6IE7"
};

// Khởi tạo Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Khởi tạo Authentication
const auth: Auth = getAuth(app);

// Khởi tạo Firestore
const db: Firestore = getFirestore(app);

// Export
export { app, auth, db };
