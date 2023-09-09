import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateUserSkChallengesPlayed = (userUid: string,challengeIndexUid:string,challengeIndexData: Object):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{        
        const newPlayedChallengeObject = {
            date: new Date(new Date().toUTCString()),
            category:challengeIndexData.category,
            challengeIndexUid:challengeIndexUid,
            challengeDataUid:challengeIndexData.challengeDataUid,
            completed: false,
            score:null,
            timeTakenInSeconds:null,
            skPointsEarned:null,
        }        
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        return userDocumentRef.update({
            skChallengesPlayed: firebase.firestore.FieldValue.arrayUnion(newPlayedChallengeObject)
        })
    }
}
export {updateUserSkChallengesPlayed}