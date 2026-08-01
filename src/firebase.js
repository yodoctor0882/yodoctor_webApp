// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwtHw8JsWhWGhNObPqKm4gsAe4VnzSBrY",
  authDomain: "yodoctor-bf82e.firebaseapp.com",
  projectId: "yodoctor-bf82e",
  storageBucket: "yodoctor-bf82e.firebasestorage.app",
  messagingSenderId: "563822930417",
  appId: "1:563822930417:web:ae34ce1be3e01d302cfc50",
  measurementId: "G-8JQLBSYMXH"
};

const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;