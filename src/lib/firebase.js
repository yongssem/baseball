// Firebase 클라이언트 초기화 (선택 사용)
// 환경변수가 없으면 db 는 null 로 두고 캐시 훅에서 graceful fallback 한다.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let db = null

export function isFirebaseConfigured() {
  return Boolean(config.apiKey && config.projectId && config.appId)
}

export function getDb() {
  if (db) return db
  if (!isFirebaseConfigured()) return null
  app = initializeApp(config)
  db = getFirestore(app)
  return db
}
