import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import AsyncStorage from '@react-native-async-storage/async-storage';
import {initializeAuth} from 'firebase/auth';
import {getReactNativePersistence} from 'firebase/auth/react-native';

// Need to define process.env as variable: Reference https://github.com/goatandsheep/react-native-dotenv/issues/251#issuecomment-1176894101
const environment = process.env
console.log('firebaseConfig, process.env',environment)
const firebaseConfig = {
    apiKey: environment.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: environment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,  
    projectId: environment.EXPO_PUBLIC_FIREBASE_PROJECT_ID,  
    storageBucket: environment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,  
    messagingSenderId: environment.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: environment.EXPO_PUBLIC_FIREBASE_APP_ID,  
    measurementId: environment.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID 
};  


if (!firebase.apps.length) {
    const firebaseInstance = firebase.initializeApp(firebaseConfig);
    // Reference from: https://stackoverflow.com/questions/71551192/best-way-to-persist-firebase-login-using-expo-go
    initializeAuth(firebaseInstance, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}
export { firebase };