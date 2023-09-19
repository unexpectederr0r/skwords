import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'
import { challengeOfTheDayInterface } from './types/firebaseDocumentInterfaces';

const currentDate = new Date();
const dateYYMMDD = `${currentDate.getFullYear()}${currentDate.getMonth() + 1}${currentDate.getDate()}`
const fetchOrCreateChallengeOfTheDay = async (challengeOfTheDayData:challengeOfTheDayInterface):Promise<any> =>{
    const documentReference = firebase.firestore().collection(FIREBASE_COLLECTIONS.CHALLENGES_FEATURED_DAILY_CHALLENGE_COLLECTION).doc(dateYYMMDD)
    return documentReference.get().then(async (documentSnapshot)=>{
        if (documentSnapshot.exists) {
            return documentSnapshot.data()
        }else{
            return documentReference.set(challengeOfTheDayData, { merge: true }).then(() => {
                return challengeOfTheDayData
            }).catch((error) => {
                throw "Error while storing daily challenge"
            })
        }
    })
}
export {fetchOrCreateChallengeOfTheDay}