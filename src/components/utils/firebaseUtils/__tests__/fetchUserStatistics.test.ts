import { fetchUserDataDocument } from "../fetchUserDataDocument"
import { firebase } from '../../../../../firebaseConfig'
import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { UserDocumentInterface } from "../types/firebaseDocumentInterfaces"
import { fetchUserStatistics } from "../fetchUserStatistics"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchUserStatistics', () => {
    it('fetchUserStatistics should return the userRecords, the averageScorePerChallenge and the averageSkPointsEarnedPerChallenge', async () => {
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
        const userStatistics = await fetchUserStatistics(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
        if(userStatistics!=null){
            expect(userStatistics).toHaveProperty('userRecords')
            expect(userStatistics).toHaveProperty('averageScorePerChallenge')
            expect(userStatistics).toHaveProperty('averageSkPointsEarnedPerChallenge')
        }else{
            throw 'Query failed'
        }
    }) 
})  