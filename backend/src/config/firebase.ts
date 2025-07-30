import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    // יש להוסיף את הגדרות הפיירבייס שלך כאן
    apiKey: process.env.FIREBASE_API_KEY || 'dummy-api-key',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain',
    projectId: process.env.FIREBASE_PROJECT_ID || 'dudu-move-project',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.FIREBASE_APP_ID || 'dummy-app-id'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);