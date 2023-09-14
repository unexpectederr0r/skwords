import { firebase } from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const fetchSkPointsLeaderBoard = (): Promise<any> => {    
    return firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).orderBy('skPoints','desc').limit(20).get()
}
export { fetchSkPointsLeaderBoard }