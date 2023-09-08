import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateNumberOfSkPointsBy = (userUid: string,changeInSkPoints: number):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        return userDocumentRef.update({
            skPoints: firebase.firestore.FieldValue.increment(changeInSkPoints)
        })
    }
}
export {updateNumberOfSkPointsBy}