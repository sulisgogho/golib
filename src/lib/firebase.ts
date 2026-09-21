import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCouagxd7d4_CAWMPOqjAaMBsQXqr_yF7k",
  authDomain: "golib-f6401.firebaseapp.com",
  projectId: "golib-f6401",
  storageBucket: "golib-f6401.firebasestorage.app",
  messagingSenderId: "466682524701",
  appId: "1:466682524701:web:e33956477e038f5c19c2f4",
  measurementId: "G-KX8K93MYSD"
};

// Initialize Firebase (make sure we don't initialize multiple times in Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Conditionally initialize analytics only on the client side
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes ? (analytics = getAnalytics(app)) : null);
}

export { app, db, storage, auth, googleProvider, analytics };
