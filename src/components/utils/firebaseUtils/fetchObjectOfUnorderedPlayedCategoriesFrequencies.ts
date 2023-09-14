import {firebase} from '../../../../firebaseConfig'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const fetchObjectOfUnorderedPlayedCategoriesFrequencies = async (userUid: string):Promise<any> =>{
    /* const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{ */
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        let userDocumentSnapshot = null
        try {
            userDocumentSnapshot = await userDocumentRef.get()    
        } catch (error) {
            return Promise.reject('Error fetching user document')
        }
        if(userDocumentSnapshot){
            try {
                const arrayOfObjectsSkChallengesPlayed = userDocumentSnapshot.data().skChallengesPlayed                
                let arrayOfCategories = []                
                arrayOfObjectsSkChallengesPlayed.forEach(challengePlayed => {
                    arrayOfCategories.push(challengePlayed.category)
                })
                //console.log("arrayOfCategories",arrayOfCategories)
                /* 
                    =======
                    The following line of code was copied from https://stackoverflow.com/questions/19395257/how-to-count-duplicate-value-in-an-array-in-javascript
                    
                */
                var map = arrayOfCategories.reduce(function(prev, cur) {
                    prev[cur] = (prev[cur] || 0) + 1;
                    return prev;
                  }, {});
                /* 
                    ==================
                 */
                return Promise.resolve(map)
            } catch (error) {
                return Promise.reject('Error fetching user skChallengesPlayed')    
            }            
        }else{
            return Promise.reject('Error fetching user document')
        }
    /* } */
}
export {fetchObjectOfUnorderedPlayedCategoriesFrequencies}