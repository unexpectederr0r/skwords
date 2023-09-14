import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { firebase } from '../../../../../firebaseConfig'
import { fetchObjectOfUnorderedPlayedCategoriesFrequencies } from "../fetchObjectOfUnorderedPlayedCategoriesFrequencies"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchObjectOfUnorderedPlayedCategoriesFrequencies', () => { 
  it('The query should return an array with the sk challenges categories played by the user', async () => {

    const objectOfCategories = await fetchObjectOfUnorderedPlayedCategoriesFrequencies(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
    if(objectOfCategories!=null){
        expect(Object.keys(objectOfCategories).length).toBeGreaterThanOrEqual(1)
    }else{
        throw 'Query failed'
    }
  })
})
