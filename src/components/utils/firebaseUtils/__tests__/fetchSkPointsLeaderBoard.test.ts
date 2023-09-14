import { fetchSkPointsHistory } from "../fetchSkPointsHistory"
import { firebase } from '../../../../../firebaseConfig'

import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { fetchSkPointsLeaderBoard } from "../fetchSkPointsLeaderBoard"

import { UserDocumentInterface } from "../types/firebaseDocumentInterfaces"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchSkPointsLeaderBoard', () => {    
    it('All user documents must comform to the userDocument interface', async () => {
        // Create an object that implements the typescript interface to later compare its keys with the result from the database
        const sampleUserDocument: UserDocumentInterface = {
            uid:'',
            skPoints: 0,
            postsIndexCollectionUids:[''],
            likedChallengesIndexUids:[''],
            dislikedChallengesIndexUids:[''],
            name: '',
            nickname: '',
            birthday: new Date,
            email: '',
            accCreationDate: new Date,
        }
        const querySnapshot = await fetchSkPointsLeaderBoard()
        if(querySnapshot.docs!=null){
            let arrayOfUserDocuments = []
            querySnapshot.docs.forEach(document => {
                arrayOfUserDocuments.push(document.data())
            })
            arrayOfUserDocuments.forEach((userDocument)=>{
                Object.keys(sampleUserDocument).forEach((key)=>{
                    expect(Object.keys(userDocument)).toContain(key)
                })
                
            })
            
        }else{
            throw 'Query failed'
        }
    })
    it('All user documents must have a defined number of skpoints', async () => {
        const querySnapshot = await fetchSkPointsLeaderBoard()
        if(querySnapshot.docs!=null){
            querySnapshot.docs.forEach(document => {
                expect(document.data()).toHaveProperty('skPoints')            
            })
        }else{
            throw 'Query failed'
        }
    }) 
})  