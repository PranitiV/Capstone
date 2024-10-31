import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBEkEadDPkf_8YhWOF04OX9Nq6_iNqy7SM",
    authDomain: "authentication-prac-ea88f.firebaseapp.com",
    projectId: "authentication-prac-ea88f",
    storageBucket: "authentication-prac-ea88f.appspot.com",
    messagingSenderId: "712939472832",
    appId: "1:712939472832:web:fd63bac3672a3c61cd6a25",
    measurementId: "G-5P6CFP8BW9"
};

export const FIREBASE_APP = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(FIREBASE_APP);
export const storage = getStorage(initializeApp(firebaseConfig));

export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});