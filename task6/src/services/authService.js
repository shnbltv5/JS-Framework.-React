// All Firebase Authentication calls live here.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logOut() {
  return signOut(auth);
}

// Firebase errors have a code like "auth/invalid-credential".
// We turn it into a message a user can understand.
const ERROR_MESSAGES = {
  "auth/invalid-email": "This email address is not valid.",
  "auth/missing-password": "Enter your password.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "The browser blocked the Google window. Allow pop-ups and try again.",
  "auth/unauthorized-domain": "This website is not in Firebase Authorized domains.",
  "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
};

export function getAuthErrorMessage(error) {
  return ERROR_MESSAGES[error?.code] ?? "Something went wrong. Please try again.";
}
