/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Load config from JSON file or environment
import configData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configData.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCBETSlvLI6oJWP-R5le0YUTfmxYG7NNsk',
  authDomain: configData.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'e-learning-2ac36.firebaseapp.com',
  projectId: configData.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'e-learning-2ac36',
  storageBucket: configData.storageBucket || 'e-learning-2ac36.firebasestorage.app',
  messagingSenderId: configData.messagingSenderId || '799235161057',
  appId: configData.appId || '1:799235161057:web:328aaf8f31f7b9b682f0a0'
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, configData.firestoreDatabaseId || undefined);
