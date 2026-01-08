// src/utils/fcm.js
import { messaging } from "../firebaseConfig";
import { getToken } from "firebase/messaging";

export const registerFCM = async () => {
  try {
    if (!messaging) {
      console.warn("Firebase messaging not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY, // ADD THIS IN .env
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("No token generated");
      return null;
    }
  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
};
