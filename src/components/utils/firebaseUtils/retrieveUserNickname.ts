import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const retrieveUserNickname = (userUid:string):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject upload
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        return firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid).get()
    }
}
export {retrieveUserNickname}