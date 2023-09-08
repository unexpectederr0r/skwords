import { firebase } from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateLikeCountBy = (userUid: string, challengeIndexUid: string, likedTriggeredUpdate: boolean): Promise<number> => {
    const firebaseUser = firebase.auth().currentUser
    // If the user is not authenticated, reject the action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }
    // Get the reference of both main documents
    const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
    const challengeIndexDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION).doc(challengeIndexUid)
    
    // Safety check if the document exists
    return challengeIndexDocumentRef.get().then(async (document) => {
        if (!document.exists) {
            return Promise.reject('missing challengeIndexDocumentRef')
        }else{
            // the obtain the likeCount from the document stored in the 'index' collection
            let currentLikeCount = await document.data().likeCount

            // Operate inside the user data document
            return userDocumentRef.get().then((userDocumentSnapshot) => {
                const userData = userDocumentSnapshot.data()
                if (userData) {
                    const { likedChallengesIndexUids, dislikedChallengesIndexUids } = userData
                    // Check if the challengeIndexUid is present in the liked or disliked arrays
                    const challengeWasLikedByUser = likedChallengesIndexUids.includes(challengeIndexUid)
                    const challengeWasDisLikedByUser = dislikedChallengesIndexUids.includes(challengeIndexUid)
                    
                    // User gave a like to the challenge
                    if (likedTriggeredUpdate) {
                        // The user has already liked the challenge so pressing like again will be interpreted as a remove like vote
                        if(challengeWasLikedByUser){
                            userDocumentRef.update({
                                likedChallengesIndexUids: firebase.firestore.FieldValue.arrayRemove(challengeIndexUid)
                            })
                            return challengeIndexDocumentRef.update({
                                likeCount: firebase.firestore.FieldValue.increment(-1)
                            }).then(()=>{return Promise.resolve(currentLikeCount-1)})
                            //return Promise.resolve(currentLikeCount-1)
                        }else{
                            // The user previously disliked the challenge and now gave it a like
                            if(!challengeWasLikedByUser && challengeWasDisLikedByUser){
                                userDocumentRef.update({
                                    dislikedChallengesIndexUids: firebase.firestore.FieldValue.arrayRemove(challengeIndexUid),
                                    likedChallengesIndexUids: firebase.firestore.FieldValue.arrayUnion(challengeIndexUid)
                                })
                                return challengeIndexDocumentRef.update({
                                    // Add one Like and remove one Dislike so a total of two have to be added
                                    likeCount: firebase.firestore.FieldValue.increment(2)
                                }).then(()=>{return Promise.resolve(currentLikeCount+2)})
                            }
                            // The user is giving a like and had no voted previously
                            else if(!challengeWasLikedByUser && !challengeWasDisLikedByUser){
                                userDocumentRef.update({
                                    likedChallengesIndexUids: firebase.firestore.FieldValue.arrayUnion(challengeIndexUid)
                                })
                                return challengeIndexDocumentRef.update({
                                    likeCount: firebase.firestore.FieldValue.increment(1)
                                }).then(()=>{return Promise.resolve(currentLikeCount+1)})
                            }
                            //return Promise.resolve(currentLikeCount+1)
                        }
                    }else{                        
                        if(challengeWasDisLikedByUser){
                            // The user has already liked the challenge so pressing like again will be interpreted as a remove like vote
                            userDocumentRef.update({
                                dislikedChallengesIndexUids: firebase.firestore.FieldValue.arrayRemove(challengeIndexUid)
                            })
                            return challengeIndexDocumentRef.update({
                                likeCount: firebase.firestore.FieldValue.increment(1)
                            }).then(()=>{return Promise.resolve(currentLikeCount+1)})                            
                        }else{
                            // The user previously liked the challenge and now gave it a dislike
                            if(!challengeWasDisLikedByUser && challengeWasLikedByUser){
                                userDocumentRef.update({
                                    likedChallengesIndexUids: firebase.firestore.FieldValue.arrayRemove(challengeIndexUid),
                                    dislikedChallengesIndexUids: firebase.firestore.FieldValue.arrayUnion(challengeIndexUid)
                                })
                                return challengeIndexDocumentRef.update({
                                    // Remove one Like and add one Dislike so a total of two have to be substracted
                                    likeCount: firebase.firestore.FieldValue.increment(-2)
                                }).then(()=>{return Promise.resolve(currentLikeCount-2)})
                            }
                            // The user is giving a dislike and had no voted previously
                            else if(!challengeWasLikedByUser && !challengeWasDisLikedByUser){
                                userDocumentRef.update({
                                    dislikedChallengesIndexUids: firebase.firestore.FieldValue.arrayUnion(challengeIndexUid)
                                })
                                return challengeIndexDocumentRef.update({
                                    likeCount: firebase.firestore.FieldValue.increment(-1)
                                }).then(()=>{return Promise.resolve(currentLikeCount-1)})
                            }
                        }
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

export { updateLikeCountBy }
