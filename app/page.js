"use client"

import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {VAPID_KEY, DEFAULT_HOST_PORT, FIREBASE_CONFIG} from './credentials'

function sendTokenToServer(token) {
  // Make an HTTP request to your backend to send the FCM token
  // Example using fetch:
  fetch(`${DEFAULT_HOST_PORT}/api/saveToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then(response => {
      if (response.ok) {
        console.log('Token sent to server successfully');
      } else {
        console.error('Failed to send token to server');
      }
    })
    .catch(error => {
      console.error('Error sending token to server:', error);
    });
}

function subscribeToTopic(token, topic) {
  fetch(`${DEFAULT_HOST_PORT}/api/subscribeToTopic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, topic }),
  })
    .then(response => {
      if (response.ok) {
        console.log(`Successfully subscribed to topic: ${topic}`);
      } else {
        console.log(`Failed to subscribe to topic: ${topic}`);
      }
    })
    .catch(error => {
      console.log(`Error subscribing to topic: ${error}`);
    });
}

export default function Home() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Initialize Firebase
      const app = initializeApp(FIREBASE_CONFIG);
      const messaging = getMessaging(app);

      navigator.serviceWorker
        .register('/firebase-messaging-sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          // Request permission and get token
          return getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        })
        .then((currentToken) => {
          if (currentToken) {
            console.log('Token:', currentToken);
            sendTokenToServer(currentToken);
            subscribeToTopic(currentToken, "news");
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        })
        .catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });

      // Handle incoming messages
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        setSnackbarMessage(payload.notification?.title || 'New Message Received');
        setOpenSnackbar(true);
      });
    } else {
      console.log('This browser does not support the messaging API.');
    }
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Basic Push client

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="info">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </main>
  );
}
