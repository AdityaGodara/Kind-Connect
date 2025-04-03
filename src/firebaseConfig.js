// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebase_api = import.meta.env.VITE_FIREBASE_API;
const auth_domain = import.meta.env.VITE_AUTH_DOMAIN;
const project_id = import.meta.env.VITE_PROJECT_ID;
const storage_bucket = import.meta.env.VITE_STORAGE_BUCKET;
const messaging_sender = import.meta.env.VITE_MESSAGING_SENDER;
const app_id = import.meta.env.VITE_APP_ID;
const measurement_id = import.meta.env.VITE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: firebase_api,
  authDomain: auth_domain,
  projectId: project_id,
  storageBucket: storage_bucket,
  messagingSenderId: messaging_sender,
  appId: app_id,
  measurementId: measurement_id
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default app;