import admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import 'server-only'

// Firebase Adminの設定
const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Firebase Adminの初期化
const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
    })
  : admin.app()

const adminAuth = getAuth(app)
const adminDb = getFirestore(app)

export { adminAuth, adminDb }
