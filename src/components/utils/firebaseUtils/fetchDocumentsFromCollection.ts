import { firebase } from '../../../../firebaseConfig'
import { FetchDocumentsFromCollectionOptionsInterface } from './types/fetchDocumentsFromCollectionOptionsInterface'

//https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html
// Reference: https://firebase.google.com/docs/firestore/query-data/order-limit-data
// Example citiesRef.orderBy("state").orderBy("population", "desc")
const fetchDocumentsFromCollection = (collection: string, options?:FetchDocumentsFromCollectionOptionsInterface): Promise<any> => {    
    if ('where' in options){
        if('whereTwo' in options){
            // Reference: https://firebase.google.com/docs/firestore/query-data/queries#compound_and_queries
            if ('startAfter' in options){
                // This query is the case when both filters (of the two available) are set and the user triggered a fetch using the infinite scroll
                console.log("fetchDocumentsFromCollection I options", options)
                return firebase.firestore().collection(collection).where(options.where.key,options.where.comparisonSymbol,options.where.comparisonValue).where(options.whereTwo.key,options.whereTwo.comparisonSymbol,options.whereTwo.comparisonValue).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').startAfter(options.startAfter).limit(options.limit?options.limit:10).get()
            }else{
                // This query is the case when the second filter (of the two available) is set
                console.log("fetchDocumentsFromCollection II options", options)
                return firebase.firestore().collection(collection).where(options.where.key,options.where.comparisonSymbol,options.where.comparisonValue).where(options.whereTwo.key,options.whereTwo.comparisonSymbol,options.whereTwo.comparisonValue).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
            }
        }else{
            if ('startAfter' in options){
                // This query is the case when only one filter (of the two available) is active and the user triggered a fetch using the infinite scroll
                console.log("fetchDocumentsFromCollection III options", options)
                return firebase.firestore().collection(collection).where(options.where.key,options.where.comparisonSymbol,options.where.comparisonValue).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').startAfter(options.startAfter).limit(options.limit?options.limit:10).get()
            }else{
                // This query is the case when only one filter (of the two available) is just set
                console.log("fetchDocumentsFromCollection IV options", options)
                return firebase.firestore().collection(collection).where(options.where.key,options.where.comparisonSymbol,options.where.comparisonValue).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
            }
        }
    }else{
        if ('startAfter' in options){
            console.log("fetchDocumentsFromCollection VI options", options)
            // This query is the case when no filters are active and the user triggered a fetch using the infinite scroll
            return firebase.firestore().collection(collection).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').startAfter(options.startAfter).limit(options.limit?options.limit:10).get()
        }else{
            console.log("fetchDocumentsFromCollection VII options", options)
            // This query is the case when no filters are active (triggered when just (re) loading the homescreen)
            return firebase.firestore().collection(collection).orderBy(options.orderBy?options.orderBy:'likeCount', options.descending ? 'desc' : 'asc').limit(options.limit?options.limit:10).get()
        }
    }
}
export { fetchDocumentsFromCollection }