// Check if Firebase is already initialized
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyB9kpvmJ1ATPGu8_7yxHB3kAMs3k0wdBRs",
    authDomain: "redflix-f0e95.firebaseapp.com",
    projectId: "redflix-f0e95",
    storageBucket: "redflix-f0e95.appspot.com",
    messagingSenderId: "949672737950",
    appId: "1:949672737950:web:79fbd06112b3115b2e0f8f",
    measurementId: "G-VNGWEZJEVR"
  };
  
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const googleProvider = new firebase.auth.GoogleAuthProvider();