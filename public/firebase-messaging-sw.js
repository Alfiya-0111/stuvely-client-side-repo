// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkIWaJyAaHpyFJfknMOWoMqrojt4npC4k",
  authDomain: "stuvely-data.firebaseapp.com",
  databaseURL: "https://stuvely-data-default-rtdb.firebaseio.com",
  projectId: "stuvely-data",
  storageBucket: "stuvely-data.firebasestorage.app",
  messagingSenderId: "369051556031",
  appId: "1:369051556031:web:5f43472d12905505b7ce0a",
  measurementId: "G-HYT54BJEQS",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
