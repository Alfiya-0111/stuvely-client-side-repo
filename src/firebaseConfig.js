// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDkIWaJyAaHpyFJfknMOWoMqrojt4npC4k",
  authDomain: "stuvely-data.firebaseapp.com",
  databaseURL: "https://stuvely-data-default-rtdb.firebaseio.com",
  projectId: "stuvely-data",
  storageBucket: "stuvely-data.firebasestorage.app",
  messagingSenderId: "369051556031",
  appId: "1:369051556031:web:5f43472d12905505b7ce0a",
  measurementId: "G-HYT54BJEQS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// 🔥 FIXED FCM
let messaging = null;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
    console.log("FCM Supported");
  } else {
    console.warn("FCM Not Supported");
  }
});

export { messaging };
