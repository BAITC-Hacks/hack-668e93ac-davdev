import { getAnalytics } from 'firebase/analytics'
import { type FirebaseOptions, initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAj3w2BcflBcAiCz3cPCzg9DAKOrTGmENE",
  authDomain: "oqucat.firebaseapp.com",
  projectId: "oqucat",
  storageBucket: "oqucat.firebasestorage.app",
  messagingSenderId: "98728189349",
  appId: "1:98728189349:web:a64ec0e5d64940200e9c4c",
  measurementId: "G-Q1Z0WW1EKF"
}


const firebaseApp = initializeApp(firebaseConfig)

const analytics = getAnalytics(firebaseApp)

const getMessagingIfSupported = async () => {
  const supported = await isSupported()

  return supported ? getMessaging(firebaseApp) : null
}

const messagingPromise = getMessagingIfSupported()

export { analytics, firebaseApp, messagingPromise }
