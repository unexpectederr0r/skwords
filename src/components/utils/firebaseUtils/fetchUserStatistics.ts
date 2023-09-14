import {firebase} from '../../../../firebaseConfig'
import getArrayAverage from '../getArrayAverage'
import FIREBASE_COLLECTIONS from './constants/firebaseCollections'

const fetchUserStatistics = async (userUid: string):Promise<any> =>{
    /* const firebaseUser = firebase.auth().currentUser
    // If the user is not auth, reject action
    if (!firebaseUser) {
        return Promise.reject('User is not authenticated.')
    }else{ */
        const userDocumentRef = firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(userUid)
        let userDocumentSnapshot = null
        try {
            userDocumentSnapshot = await userDocumentRef.get()    
        } catch (error) {
            return Promise.reject('Error fetching user document')
        }
        if(userDocumentSnapshot){
            try {
                const arrayOfObjectsSkChallengesPlayed = userDocumentSnapshot.data().skChallengesPlayed                                
                let arrayOfScores = []                
                let arrayOfTimes = []
                let arrayOfSkPointsEarned = []
                let successfullyPassedChallenges = 0
                let notPassedChallenges = 0
                if(Array.isArray(arrayOfObjectsSkChallengesPlayed)){
                    if(arrayOfObjectsSkChallengesPlayed.length>=1){
                        arrayOfObjectsSkChallengesPlayed.forEach(challengePlayed => {
                            if (challengePlayed.skPointsEarned>0){
                                successfullyPassedChallenges+=1
                            }else{
                                notPassedChallenges+=1
                            }
                            arrayOfScores.push(challengePlayed.score)
                            arrayOfTimes.push(challengePlayed.timeTakenInSeconds)
                            arrayOfSkPointsEarned.push(challengePlayed.skPointsEarned)
                        })
                        // Sort to get record score and record time                
                        // Reference consulted: https://www.w3schools.com/jsref/jsref_sort.asp
                        arrayOfScores = arrayOfScores.sort((a, b)=>b-a) // Score: higher is better so descending order
                        arrayOfTimes = arrayOfTimes.sort((a, b)=>a-b) // time taken: lower is better so ascending order
                        arrayOfSkPointsEarned = arrayOfSkPointsEarned.sort((a, b)=>b-a) // Points earned: higher is better so descending order
                        const userRecords = {score:arrayOfScores[0], time:arrayOfTimes[0], skPoints:arrayOfSkPointsEarned[0]}
                        const userStatistics = {userRecords:userRecords,successfullyPassedChallenges:successfullyPassedChallenges,notPassedChallenges:notPassedChallenges,averageScorePerChallenge:getArrayAverage(arrayOfScores),averageSkPointsEarnedPerChallenge:getArrayAverage(arrayOfSkPointsEarned)}                        
                        return Promise.resolve(userStatistics)
                    }else{
                        const userRecords = {score:null, time:null, skPoints:null}
                        const userStatistics = {userRecords:null,successfullyPassedChallenges:null,notPassedChallenges:null,averageScorePerChallenge:null,averageSkPointsEarnedPerChallenge:null}                        
                        return Promise.resolve(userStatistics)
                    }
                }else{
                    const userRecords = {score:null, time:null, skPoints:null}
                    const userStatistics = {userRecords:null,successfullyPassedChallenges:null,notPassedChallenges:null,averageScorePerChallenge:null,averageSkPointsEarnedPerChallenge:null}                    
                    return Promise.resolve(userStatistics)
                }
            } catch (error) {
                return Promise.reject('Error fetching user skPoint history')    
            }            
        }else{
            return Promise.reject('Error fetching user document')
        }
    }
/* } */
export {fetchUserStatistics}