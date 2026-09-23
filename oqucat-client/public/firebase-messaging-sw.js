importScripts(
  'https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js'
)
importScripts(
  'https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js'
)
firebase.initializeApp({
  apiKey: 'AIzaSyAj3w2BcflBcAiCz3cPCzg9DAKOrTGmENE',
  authDomain: 'oqucat.firebaseapp.com',
  projectId: 'oqucat',
  storageBucket: 'oqucat.firebasestorage.app',
  messagingSenderId: '98728189349',
  appId: '1:98728189349:web:a64ec0e5d64940200e9c4c',
  measurementId: 'G-Q1Z0WW1EKF',
})
const messaging = firebase.messaging()
const appName = new URL(self.location.href).searchParams.get('appName') ?? ''
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? payload.data?.title ?? appName

  const body = payload.notification?.body ?? payload.data?.body ?? ''
  const options = {
    body,
    icon: '/app-icon.png',
    data: payload.data,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    badge: '/icon-badge.png',
  }
  self.registration
    .showNotification(title, options)
    .then(() => {
      console.log('[FCM SW] Notification shown successfully')
    })
    .catch((err) => {
      console.error('[FCM SW] Failed to show notification:', err)
    })
})
