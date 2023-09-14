import { firebase } from '../../../../../firebaseConfig'
import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { isChallengeLikedOrDislikedByUser } from "../isChallengeLikedOrDislikedByUser"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing isChallengeLikedOrDislikedByUser', () => {
    it('The query should return true, false or undefined (the user did not like nor dislike the challenge)', async () => {
        const result = await isChallengeLikedOrDislikedByUser(JEST_TESTS_CONSTANTS.EXISTING_USER_ID,JEST_TESTS_CONSTANTS.EXISTING_CHALLENGE_INDEX_UID)
        expect([true,false,undefined]).toContain(result)
    }) 
})