import { firebase } from '../../../../../firebaseConfig'
import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { retrieveUserNickname } from '../retrieveUserNickname'

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing retrieveUserNickname', () => {
    it("Should return the existing user's nickname", async () => {
        const result =await retrieveUserNickname(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
        if(result.data()!=null){
            expect(typeof result.data().nickname).toBe("string")
        }
    }) 
    it("Should return undefined for the non-existing user's nickname", async () => {
        const result =await retrieveUserNickname(JEST_TESTS_CONSTANTS.NON_EXISTING_USER_ID)
        expect(result.data()).toBeUndefined()
    }) 
})