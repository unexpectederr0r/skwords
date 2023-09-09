import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const fetchSkPointsHistory = async (userUid: string):Promise<any> =>{
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
            try {
                return Promise.resolve(userDocumentSnapshot.data().skPointsHistory)
            } catch (error) {
                return Promise.reject('Error fetching user skPoint history')    
            }            
        }else{
            return Promise.reject('Error fetching user document')
        }
    }
}
export {fetchSkPointsHistory}