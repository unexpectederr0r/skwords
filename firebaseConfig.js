import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {initializeAuth} from 'firebase/auth'
import {getReactNativePersistence} from 'firebase/auth/react-native'
import API_KEYS from './SECRET_API_KEYS'

const firebaseConfig = {
    apiKey: API_KEYS.FIREBASE_API_KEYS.API_KEY,
    authDomain: API_KEYS.FIREBASE_API_KEYS.AUTH_DOMAIN,  
    projectId: API_KEYS.FIREBASE_API_KEYS.PROJECT_ID,  
    storageBucket: API_KEYS.FIREBASE_API_KEYS.STORAGE_BUCKET,  
    messagingSenderId: API_KEYS.FIREBASE_API_KEYS.MESSAGING_SENDER_ID,
    appId: API_KEYS.FIREBASE_API_KEYS.APP_ID,  
    measurementId: API_KEYS.FIREBASE_API_KEYS.MEASUREMENT_ID
}

if (!firebase.apps.length) {
    const firebaseInstance = firebase.initializeApp(firebaseConfig);
    // Reference from: https://stackoverflow.com/questions/71551192/best-way-to-persist-firebase-login-using-expo-go
    initializeAuth(firebaseInstance, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}
export { firebase , firebaseConfig }