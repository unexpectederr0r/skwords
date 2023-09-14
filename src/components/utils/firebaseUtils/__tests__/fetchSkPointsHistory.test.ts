import { fetchSkPointsHistory } from "../fetchSkPointsHistory"
import { firebase } from '../../../../../firebaseConfig'

import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchSkPointsHistory', () => {    
  it('Should return an array', async () => {
    const pointHistoryArray = await fetchSkPointsHistory(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
    if(pointHistoryArray!=null){
        expect(Object.keys(pointHistoryArray).length).toBeGreaterThanOrEqual(1)
        expect(typeof pointHistoryArray[0]).toBe('number');
    }else{
        throw 'Query failed'
    }
  })
  it('The array of skPoints should be of type number', async () => {
    const pointHistoryArray = await fetchSkPointsHistory(JEST_TESTS_CONSTANTS.EXISTING_USER_ID)
    if(pointHistoryArray!=null){
        expect(typeof pointHistoryArray[0]).toBe('number');
    }else{
        throw 'Query failed'
    }
  })
})