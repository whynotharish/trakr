import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdkJ0rnj8SMiup_JHL7YLuRNe8R0kIWkY",
  authDomain: "trakr-ed77b.firebaseapp.com",
  projectId: "trakr-ed77b",
  storageBucket: "trakr-ed77b.firebasestorage.app",
  messagingSenderId: "777624663491",
  appId: "1:777624663491:web:4a83ab8da906e2116ab976",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
