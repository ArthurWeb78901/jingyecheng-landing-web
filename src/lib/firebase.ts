// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
// 之后如果要用 Firestore，可以顺便 export getFirestore

const firebaseConfig = {
  apiKey: "AIzaSyCYF_rrzyWrkjp4q2-3uJNPVP_3b1tBkdQ",
  authDomain: "nooko-hub.firebaseapp.com",
  databaseURL: "https://nooko-hub-default-rtdb.firebaseio.com",
  projectId: "nooko-hub",
  storageBucket: "nooko-hub.firebasestorage.app",
  messagingSenderId: "46349385457",
  appId: "1:46349385457:web:f0de24be165829abccf350",
  measurementId: "G-LRP7PSXN2E"
};

// 避免在 Next / 热重载时重复初始化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const storage = getStorage(app);
// 如果以后要 Firestore：export const db = getFirestore(app);
