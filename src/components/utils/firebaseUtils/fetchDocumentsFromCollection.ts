import { firebase } from '../../../../firebaseConfig'
import { FetchDocumentsFromCollectionOptionsInterface } from './types/fetchDocumentsFromCollectionOptionsInterface'

//https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html
// Reference: https://firebase.google.com/docs/firestore/query-data/order-limit-data
// Example citiesRef.orderBy("state").orderBy("population", "desc")
const fetchDocumentsFromCollection = (collection: string, options?:FetchDocumentsFromCollectionOptionsInterface): Promise<any> => {    
    //return firebase.firestore().collection(collection).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
    if ('where' in options){
        return firebase.firestore().collection(collection).where(options.where.key,options.where.comparisonSymbol,options.where.comparisonValue).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
    }else{
        return firebase.firestore().collection(collection).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
    }
    
}
export { fetchDocumentsFromCollection }