import {firebase} from '../../../../firebaseConfig'

const saveNewOrUpdateDocumentInCollection = (documentObject,collectionName:string,documentUid?:string):Promise<any> =>{
    const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject upload
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{
        if (documentUid) {
            // If documentUid is provided, update the existing document
            return firebase.firestore().collection(collectionName).doc(documentUid).set(documentObject)
        } else {
            // If documentUid is not provided, create a new document
            return firebase.firestore().collection(collectionName).add(documentObject)
        }
    }
}
export {saveNewOrUpdateDocumentInCollection}