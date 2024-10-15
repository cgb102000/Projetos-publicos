// firebaseConfig.js
const firebaseConfig = {
    apiKey: "AIzaSyDqqkG-GiLKqnVKG0J4GNEOGlF0OXG6_ek",
    authDomain: "teste-8f37b.firebaseapp.com",
    projectId: "teste-8f37b",
    storageBucket: "teste-8f37b.appspot.com",
    messagingSenderId: "556521719102",
    appId: "1:556521719102:web:b41dbaef17c2b3a061d86f",
    measurementId: "G-29YHYCTNLN"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = firebase.firestore();

export { db };
