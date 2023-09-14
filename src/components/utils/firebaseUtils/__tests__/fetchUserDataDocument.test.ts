import { fetchUserDataDocument } from "../fetchUserDataDocument"
import { firebase } from '../../../../../firebaseConfig'
import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { UserDocumentInterface } from "../types/firebaseDocumentInterfaces"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchUserDataDocument', () => {
    it('User data document must satisfy predefined interface', async () => {
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
        const userDocument = await fetchUserDataDocument(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
        if(userDocument!=null){
            Object.keys(sampleUserDocument).forEach((key)=>{
                expect(Object.keys(userDocument.data())).toContain(key)
            })
        }else{
            throw 'Query failed'
        }
    }) 
})  