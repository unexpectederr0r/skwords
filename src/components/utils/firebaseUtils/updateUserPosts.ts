import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateUserPosts = (userUid: string,postUid: string):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        return userDocumentRef.update({
            postsIndexCollectionUids: firebase.firestore.FieldValue.arrayUnion(postUid)
        })
    }
}
export {updateUserPosts}