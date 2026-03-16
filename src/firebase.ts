import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBoruYZ3fjjRvX1dCPPlhG4l1mkco8dOMA",
  authDomain: "bjtyhi-4a78e.firebaseapp.com",
  projectId: "bjtyhi-4a78e",
  storageBucket: "bjtyhi-4a78e.firebasestorage.app",
  messagingSenderId: "680394095510",
  appId: "1:680394095510:web:45d526ed229b0693abbbb7",
  measurementId: "G-DXEPHNWHNK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
