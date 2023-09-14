import { JEST_TESTS_CONSTANTS } from "../constants/jestTestsConstants"
import { firebase } from '../../../../../firebaseConfig'
import { fetchChallengeData } from "../fetchChallengeData"

import { ChallengeDataDocumentInterface } from "../types/firebaseDocumentInterfaces"

// Necessary because was triggering a failure due to timeout
jest.setTimeout(30000)
// Taken from: https://stackoverflow.com/a/61619639
firebase.firestore().settings({ experimentalForceLongPolling: true })

describe('Unit testing fetchChallengeData', () => {  
  it('The existing challengeData document should be retrieved and should match the Typescript interface', async () => {
    // Create an object that implements the typescript interface to later compare its keys with the result from the database
    const sampleChallengeData: ChallengeDataDocumentInterface = {hintsAnswers:{},hintsQuestions:{},wordToDiscover:'',wordToDiscoverDefinition:''}
    const result = await fetchChallengeData(JEST_TESTS_CONSTANTS.EXISTING_CHALLENGE_DATA_UID)
    if(result!=null){
      const data = result.data()
      // Sort the keys alphabetically so they always match
      expect(Object.keys(data).sort()).toEqual(Object.keys(sampleChallengeData).sort())
    }else{
      throw 'Query failed'
    }
  })

  it('The non-existent challengeData document should not exist', async () => {
    // Ask for a non-existent challengeData document
    const result = await fetchChallengeData(JEST_TESTS_CONSTANTS.NON_EXISTING_CHALLENGE_DATA_UID)
    if(result!=null){
      // Should be undefined
      expect(result.data()).toEqual(undefined)
    }else{
      throw 'Query failed'
    }
  })
})

