import { getCountFromServer, query, collection, documentId, where} from '@firebase/firestore'
import { firebase} from '../../../../firebaseConfig'

const db = firebase.firestore()

export default async function checkIfDocumentIdExistsInCollection(collectionName: string, queryDocumentId: string,): Promise<boolean>{
  const snap = await getCountFromServer(query(
    collection(db, collectionName), where(documentId(), '==', queryDocumentId)
  ))
  return !!snap.data().count  
}