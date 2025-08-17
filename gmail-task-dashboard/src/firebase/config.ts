import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Debug: Log environment variables (remove this after debugging)
console.log('Firebase Config Debug:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '***loaded***' : 'MISSING',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '***loaded***' : 'MISSING',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '***loaded***' : 'MISSING',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '***loaded***' : 'MISSING',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '***loaded***' : 'MISSING',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ? '***loaded***' : 'MISSING',
});

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is incomplete. Please check your .env.local file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;