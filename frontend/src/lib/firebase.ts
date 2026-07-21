import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ponytail: null when NEXT_PUBLIC_FIREBASE_* isn't configured yet, so the rest
// of the admin console still works while realtime notifications stay disabled.
let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

if (config.databaseURL && config.projectId) {
  app = getApps().length ? getApp() : initializeApp(config);
  db = getDatabase(app);
  auth = getAuth(app);
}

export const firebaseDb = db;
export const firebaseAuth = auth;
