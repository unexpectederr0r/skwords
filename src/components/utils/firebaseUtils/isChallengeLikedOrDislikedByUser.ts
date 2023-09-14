import { firebase } from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const isChallengeLikedOrDislikedByUser = (userUid: string, challengeIndexUid: string): Promise<boolean>=> {
    /* const firebaseUser = firebase.auth().currentUser
    // If the user is not authenticated, reject the action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    } */
    // Get the reference of both main documents
    const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
    const challengeIndexDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION).doc(challengeIndexUid)
    
    // Safety check if the document exists
    return challengeIndexDocumentRef.get().then((document) => {
        if (!document.exists) {
            return Promise.reject('missing challengeIndexDocumentRef')
        }else{
            // Operate inside the user data document
            return userDocumentRef.get().then((userDocumentSnapshot) => {
                const userData = userDocumentSnapshot.data()
                if (userData) {
                    const { likedChallengesIndexUids, dislikedChallengesIndexUids } = userData
                    // Check if the challengeIndexUid is present in the liked or disliked arrays
                    const challengeWasLikedByUser = likedChallengesIndexUids.includes(challengeIndexUid)
                    const challengeWasDisLikedByUser = dislikedChallengesIndexUids.includes(challengeIndexUid)
                    if(!challengeWasLikedByUser && !challengeWasDisLikedByUser){
                        return Promise.resolve(undefined)
                    }else if(challengeWasLikedByUser){
                        return Promise.resolve(true)
                    }else if(challengeWasDisLikedByUser){
                        return Promise.resolve(false)
                    }
                } else {
                    return Promise.reject('User data not found')
                }
            }).catch((error) => {
                return Promise.reject('Error fetching user document:')
            })
        }
    }).catch((error) => {
        return Promise.reject('error challengeIndexDocumentRef')
    })    
}

export { isChallengeLikedOrDislikedByUser }
