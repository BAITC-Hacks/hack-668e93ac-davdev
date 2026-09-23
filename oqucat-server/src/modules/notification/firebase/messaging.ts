import { getMessaging } from 'firebase-admin/messaging'

import { firebaseApp } from './app'

export const firebaseMessaging = getMessaging(firebaseApp)
