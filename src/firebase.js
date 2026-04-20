import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAjGxjgzdQqxKJ62Qn-aJScnD6208uQyzM",
  authDomain: "niop4g-sakupljac-140e2.firebaseapp.com",
  projectId: "niop4g-sakupljac-140e2",
  storageBucket: "niop4g-sakupljac-140e2.firebasestorage.app",
  messagingSenderId: "463758808848",
  appId: "1:463758808848:web:aa047220d9ee0da9847795",
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
