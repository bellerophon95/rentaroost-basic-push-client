importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCB7KZ3YzxDiORp2eJgUmkZK3qgR3Fs3Ls",
  authDomain: "rentaroost-fb22c.firebaseapp.com",
  projectId: "rentaroost-fb22c",
  storageBucket: "rentaroost-fb22c.appspot.com",
  messagingSenderId: "40641912910",
  appId: "1:40641912910:web:ef963c161745acec8e631f",
  measurementId: "G-N5HSKHGY3W"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

self.addEventListener('activate', event => {
  console.log('Service worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  console.log('Push event received:', event);

  const data = event.data.json();
  const notificationTitle = data.notification?.title || 'Default Title';
  const notificationOptions = {
    body: data.notification?.body || 'Default Body',
    icon: '/firebase-logo.png' // Replace with your app icon URL
  };

  // event.waitUntil(
  //   self.registration.showNotification(notificationTitle, notificationOptions)
  // );
});

self.addEventListener('notificationclick', event => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  // Add your custom handling for notification click
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Check if there is already a window/tab open with the same URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

messaging.onBackgroundMessage(payload => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message Body',
    icon: '/cats.png' // Replace with your app icon URL
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
