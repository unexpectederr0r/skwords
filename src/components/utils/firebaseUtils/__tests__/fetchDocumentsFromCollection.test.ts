import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { firebase } from '../../../../../firebaseConfig'
import { fetchChallengeData } from "../fetchChallengeData"
import { fetchDocumentsFromCollection } from "../fetchDocumentsFromCollection"

import { ChallengeDataDocumentInterface } from "../types/firebaseDocumentInterfaces"
import { FetchDocumentsFromCollectionOptionsInterface } from "../types/fetchDocumentsFromCollectionOptionsInterface"
import FIREBASE_COLLECTIONS from "../constants/firebaseCollections"

import { ChallengeIndexDocumentInterface } from "../types/firebaseDocumentInterfaces"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchDocumentsFromCollection', () => {  
  // Create an options object that implements the typesript interface to check the correct functioning
  
  it('The query should return the correct number of requested skChallenges', async () => {
    const options:FetchDocumentsFromCollectionOptionsInterface = {orderBy:'likeCount',limit:JEST_TESTS_CONSTANTS.DOCUMENT_NUMBER_LIMIT,descending:true}
    const querySnapshot = await fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION,options)
    if(querySnapshot.docs!=null){
      let counter = 0
      querySnapshot.docs.forEach(document => {
        counter+=1
      })
      expect(counter).toEqual(JEST_TESTS_CONSTANTS.DOCUMENT_NUMBER_LIMIT)
    }else{
      throw 'Query failed'
    }
  })
  it('The skChallenges retrieved should be ordered by likeCount', async () => {
    const options:FetchDocumentsFromCollectionOptionsInterface = {orderBy:'likeCount',limit:JEST_TESTS_CONSTANTS.DOCUMENT_NUMBER_LIMIT,descending:true}
    const querySnapshot = await fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION,options)
    if(querySnapshot.docs!=null){
      let likeCountOrderedArray = []
      querySnapshot.docs.forEach(document => {
        const data: ChallengeIndexDocumentInterface = document.data()
        likeCountOrderedArray.push(data.likeCount)
      })
      if(likeCountOrderedArray.length==2){
        // Test correct likeCount ordering
        expect(likeCountOrderedArray[0]).toBeGreaterThanOrEqual(likeCountOrderedArray[1])
      }else{
        throw 'Query failed'
      }
    }else{
      throw 'Query failed'
    }
  }) 
  it('The skChallenges retrieved should be ordered by creationDate', async () => {
    const options:FetchDocumentsFromCollectionOptionsInterface = {orderBy:'creationDate',limit:JEST_TESTS_CONSTANTS.DOCUMENT_NUMBER_LIMIT,descending:true}
    const querySnapshot = await fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION,options)
    if(querySnapshot.docs!=null){
      let creationDateOrderedArray = []
      
      querySnapshot.docs.forEach(document => {
        const data: ChallengeIndexDocumentInterface = document.data()
        creationDateOrderedArray.push(data.creationDate)
      })
      if(creationDateOrderedArray.length==2){
        // Test correct creationDate ordering
        expect(creationDateOrderedArray[0].seconds).toBeGreaterThanOrEqual(creationDateOrderedArray[1].seconds)
      }else{
        throw 'Query failed'
      }
    }else{
      throw 'Query failed'
    }
  })
  it('The skChallenges retrieved should be filtered by the desired category', async () => {
    const options:FetchDocumentsFromCollectionOptionsInterface = {where:{key:'category',comparisonSymbol:'==',comparisonValue:JEST_TESTS_CONSTANTS.EXISTING_CATEGORY},orderBy:'category'}
    const querySnapshot = await fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION,options)
    if(querySnapshot.docs!=null){
      let categoriesOfChallengesArray = []
      
      querySnapshot.docs.forEach(document => {
        const data: ChallengeIndexDocumentInterface = document.data()
        categoriesOfChallengesArray.push(data.category)
      })
      if(categoriesOfChallengesArray.length>=1){
        // Test that the correct category has been retrieved
        // Create a set (unique values) from the array
        expect([...new Set(categoriesOfChallengesArray)][0]).toBe(JEST_TESTS_CONSTANTS.EXISTING_CATEGORY)
      }else{
        throw 'Query failed'
      }
    }else{
      throw 'Query failed'
    }
  })
  
})

