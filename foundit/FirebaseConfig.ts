import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBEkEadDPkf_8YhWOF04OX9Nq6_iNqy7SM",
    authDomain: "authentication-prac-ea88f.firebaseapp.com",
    projectId: "authentication-prac-ea88f",
    storageBucket: "authentication-prac-ea88f.appspot.com",
    messagingSenderId: "712939472832",
    appId: "1:712939472832:web:fd63bac3672a3c61cd6a25",
    measurementId: "G-5P6CFP8BW9"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

export const storage = getStorage(initializeApp(firebaseConfig));