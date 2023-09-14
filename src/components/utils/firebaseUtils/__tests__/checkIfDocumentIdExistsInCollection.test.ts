import checkIfDocumentIdExistsInCollection from "../checkIfDocumentIdExistsInCollection"
import FIREBASE_COLLECTIONS from "../constants/firebaseCollections"
import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { firebase } from '../../../../../firebaseConfig'


// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing checkIfDocumentIdExistsInCollection', () => {
  const existingUserNickname = 'thelegend27'
  it('Should return true if the nickname exists', async () => {
    const result: boolean|undefined = await checkIfDocumentIdExistsInCollection(FIREBASE_COLLECTIONS.USERS_NICKNAMES_COLLECTION,JEST_TESTS_CONSTANTS.EXISTING_USER_NICKNAME)
    expect(result).toBe(true)
  })
  it('Should return false if the nickname does not exist', async () => {
    const result: boolean|undefined = await checkIfDocumentIdExistsInCollection(FIREBASE_COLLECTIONS.USERS_NICKNAMES_COLLECTION,JEST_TESTS_CONSTANTS.NON_EXISTING_USER_NICKNAME)
    expect(result).toBe(false)
  })
})
