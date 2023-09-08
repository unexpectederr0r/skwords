import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import AsyncStorage from '@react-native-async-storage/async-storage';
import {initializeAuth} from 'firebase/auth';
import {getReactNativePersistence} from 'firebase/auth/react-native';

console.log('firebaseConfig, process.env',process.env.FIREBASE_API_KEY)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,  
    projectId: process.env.FIREBASE_PROJECT_ID,  
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,  
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,  
    measurementId: process.env.FIREBASE_MEASUREMENT_ID 
};  


if (!firebase.apps.length) {
    const firebaseInstance = firebase.initializeApp(firebaseConfig);
    // Reference from: https://stackoverflow.com/questions/71551192/best-way-to-persist-firebase-login-using-expo-go
    initializeAuth(firebaseInstance, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}
export { firebase };