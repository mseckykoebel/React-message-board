import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// initialize the application
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAn7SbuBhKPMlIh1JjVIRX-lGhODx81ONk",
    authDomain: "ladder-react-challenge.firebaseapp.com",
    projectId: "ladder-react-challenge",
    storageBucket: "ladder-react-challenge.appspot.com",
    messagingSenderId: "584391455757",
    appId: "1:584391455757:web:b014c05af9858a58889144",
  });
} else {
  firebase.app(); // if already initialized, use that one
}

export const firestore = firebase.firestore();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
// export const auth = firebase.auth();
