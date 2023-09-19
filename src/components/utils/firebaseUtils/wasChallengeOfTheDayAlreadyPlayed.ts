import { getCountFromServer, query, collection, documentId, where} from '@firebase/firestore'
import { firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

export default async function wasChallengeOfTheDayAlreadyPlayed(challengeOfTheDayIndexUid): Promise<boolean>{
    const userUid = firebase.auth().currentUser.uid
    const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
    
    return userDocumentRef.get().then((userDocumentSnapshot)=>{
        const currentDate = new Date()
        if (userDocumentSnapshot.exists) {
            const arrayOfObjectsSkChallengesPlayed = userDocumentSnapshot.data().skChallengesPlayed
            let wasPlayedFlag = false            
            arrayOfObjectsSkChallengesPlayed.forEach(playedSkChallengeObject => {
                let convertedFirestoreDate = playedSkChallengeObject.date.toDate()
                if(playedSkChallengeObject.challengeIndexUid === challengeOfTheDayIndexUid && convertedFirestoreDate.getFullYear() === currentDate.getFullYear() && convertedFirestoreDate.getMonth() === currentDate.getMonth() && convertedFirestoreDate.getDate() === currentDate.getDate()){                    
                    wasPlayedFlag = true
                }
            })
            if(wasPlayedFlag){
                return true
            }else{
                return false
            }
            
        }
    })
}