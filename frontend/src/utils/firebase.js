import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-8VcbtkElTxNH92oDq8bdXit58WHqPAk",
  authDomain: "swiftly-marketplace.firebaseapp.com",
  projectId: "swiftly-marketplace",
  storageBucket: "swiftly-marketplace.firebasestorage.app",
  messagingSenderId: "15351666134",
  appId: "1:15351666134:web:b9b92cfc1d325d8bdd8077",
  measurementId: "G-Z9XTQDYJ1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Language is Hindi/English autodetection
auth.languageCode = 'en';

export { RecaptchaVerifier, signInWithPhoneNumber };
