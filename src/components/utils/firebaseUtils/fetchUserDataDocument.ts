import { firebase } from '../../../../firebaseConfig';
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const fetchUserDataDocument = (userDataUid): Promise<any> => {    
    return firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userDataUid).get()
}
export { fetchUserDataDocument }