import { firebase } from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

//https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html
// Reference: https://firebase.google.com/docs/firestore/query-data/order-limit-data
// Example citiesRef.orderBy("state").orderBy("population", "desc")
const fetchChallengeData = (challengeDataUid): Promise<any> => {    
    return firebase.firestore().collection(FIREBASE_COLLECTIONS.CHALLENGES_DATA_COLLECTION).doc(challengeDataUid).get()
}

export { fetchChallengeData }