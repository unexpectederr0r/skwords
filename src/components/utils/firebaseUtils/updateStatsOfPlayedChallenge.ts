import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateStatsOfPlayedChallenge = async (userUid: string, score:number,timeTakenInSeconds:number,skPointsEarned:number):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        // 1. get array of objects from the field named "skChallengesPlayed" from userDocumentRef document
        const userDocumentSnapshot = await userDocumentRef.get()
        let skChallengesPlayedArray = null

        try {
            skChallengesPlayedArray = userDocumentSnapshot.data().skChallengesPlayed    
        } catch (error) {
            throw 'error fetching skChallengesPlayedArray'
        }
        // 2. get the latest entry from the array that consists of an object that corresponds to the last (and current) challenge launched by the user, and update the following fields: completed, score, timeTakenInSeconds and skPointsEarned,
        const latestChallenge = skChallengesPlayedArray[skChallengesPlayedArray.length - 1]        
        if (latestChallenge) {
            latestChallenge.completed = true
            latestChallenge.score = score
            latestChallenge.timeTakenInSeconds = timeTakenInSeconds
            latestChallenge.skPointsEarned = skPointsEarned

            // Update the Firestore document with the modified skChallengesPlayedArray
            await userDocumentRef.update({
                skChallengesPlayed: skChallengesPlayedArray,
            })
            return Promise.resolve()
        }else{
            throw 'error fetching the latest entry'
        }
    }
}
export {updateStatsOfPlayedChallenge}