import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const updateSkPointsHistory = async (userUid: string,changeInSkPoints: number):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        let userDocumentSnapshot = null
        try {
            userDocumentSnapshot = await userDocumentRef.get()    
        } catch (error) {
            return Promise.reject('Error fetching user document')
        }
        if(userDocumentSnapshot){
            const newSkPointsBalance = userDocumentSnapshot.data().skPoints + (changeInSkPoints)            
            return userDocumentRef.update({
                skPointsHistory: firebase.firestore.FieldValue.arrayUnion(newSkPointsBalance)
            })
        }else{
            return Promise.reject('Error fetching user document')
        }
    }
}
export {updateSkPointsHistory}