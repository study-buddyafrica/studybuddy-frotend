// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTc2pDl2smJoE1hHu0LqOydDbS_qt575Q",
  authDomain: "studybuddy-2e54b.firebaseapp.com",
  projectId: "studybuddy-2e54b",
  storageBucket: "studybuddy-2e54b.firebasestorage.app",
  messagingSenderId: "104317671386",
  appId: "1:104317671386:web:4a1406cfd38596e0ded2e3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);

export { firebaseAuth };
