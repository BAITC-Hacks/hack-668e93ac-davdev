import { cert, getApps, initializeApp } from 'firebase-admin/app'

import cfg from '../../../config'

const serviceAccount = cfg.FIREBASE_SERVICE_ACCOUNT

export const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    })
