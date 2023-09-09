import React, {useEffect, useState, useRef} from "react"
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Alert} from "react-native"
import { useTheme } from "@rneui/themed"
import CountdownTimer from '../components/utils/CountdownTimer'
import GameBody from "./GameBody"

import { fetchChallengeData } from "../components/utils/firebaseUtils/fetchChallengeData"
import { ChallengeDataDocumentInterface, ChallengeIndexDocumentInterface } from "../components/utils/firebaseUtils/types/firebaseDocumentInterfaces"
import { GAME_CONSTANTS } from "../constants/gameConstants"

import { updateUserSkChallengesPlayed } from "../components/utils/firebaseUtils/updateUserSkChallengesPlayed"

import { useUserMetadataSharedValue } from "../context/UserMetadataProvider"

const ThemeAwareSafeAreaView = (props) => {
    const { theme, updateTheme } = useTheme()           
    //console.log('playscreen ThemeAwareSafeAreaView theme.colors.background',theme.colors.background)
    return(
        <SafeAreaView style={{backgroundColor:theme.colors.background, justifyContent: "space-between",flex: 1,}}>
            {props.children}
        </SafeAreaView>
    )
  }
const CountdownTimerMemo = React.memo(CountdownTimer)

export default function PlayScreen({navigation,route}) {
  
  // Define React states
  const [fetchingChallengeData, setFetchingChallengeData] = useState<boolean>(true)  
  const [timerRunOut, setTimerRunOut] = useState<boolean>(false)
  const [reloadMemoizedCountdownTimer, setReloadMemoizedCountdownTimer] = useState<boolean>(false)
  // Define references
  const countdownTimerMinutesRef = useRef(GAME_CONSTANTS.CHALLENGE_TIMER_INITIAL_MINUTES)
  const countdownTimerSecondsRef = useRef(GAME_CONSTANTS.CHALLENGE_TIMER_INITIAL_SECONDS)
  const challengeDataRef = useRef<ChallengeDataDocumentInterface>(null)
  const stopCountDown = useRef<boolean>(false)
  // Define constants
  const CHALLENGE_INDEX_UID:string = route.params.challengeIndexUid
  const CHALLENGE_UID:string = route.params.challengeUid
  const CHALLENGE_INDEX_DATA: ChallengeIndexDocumentInterface =  route.params.challengeIndexData
  const MAX_NUMBER_SECONDS:number = GAME_CONSTANTS.CHALLENGE_TIMER_INITIAL_MINUTES * 60 + GAME_CONSTANTS.CHALLENGE_TIMER_INITIAL_SECONDS
  
  const { sharedValue: userMetadataSharedValue } = useUserMetadataSharedValue()  
  

  useEffect(() => {
    fetchChallengeData(CHALLENGE_UID).then(async (document)=>{
      challengeDataRef.current = document.data()
      if(challengeDataRef.current!=undefined){
        // before start, let the backend know the user started        
        updateUserSkChallengesPlayed(userMetadataSharedValue.userDataDocument.uid,CHALLENGE_INDEX_UID,CHALLENGE_INDEX_DATA).then(()=>{
          setFetchingChallengeData(false)  
        }).catch(()=>{
          Alert.alert('Error', 'There was an database error ', [{text: 'OK',onPress:()=> navigation.goBack()},])
        })
        
      }else{
        Alert.alert('Error', 'There was an error retrieving the selected challenge', [{text: 'OK',onPress:()=> navigation.goBack()},])
      }
      
    }).catch((error)=>{
      Alert.alert('Error', 'There was an error retrieving the selected challenge', [{text: 'OK',onPress:()=> navigation.goBack()},])
    })
  },[])
  

  return (              
    <ThemeAwareSafeAreaView> 
      {fetchingChallengeData?(
        <SafeAreaView style={styles.container}>
            <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
                <ActivityIndicator size="large" />
            </View>
        </SafeAreaView>
      )
      :
      (
      <>
        <CountdownTimerMemo countdownTimerMinutesRef={countdownTimerMinutesRef} countdownTimerSecondsRef={countdownTimerSecondsRef} setTimerRunOut={setTimerRunOut} stopCountDown={stopCountDown} reloadMemoizedCountdownTimer={reloadMemoizedCountdownTimer}/>
        {console.log('right before JSX returns challengeDataRef.current',challengeDataRef.current)}
        <GameBody navigation={navigation} challengeData={challengeDataRef.current} challengeIndexData={CHALLENGE_INDEX_DATA} maxNumberOfSeconds={MAX_NUMBER_SECONDS} countdownTimerMinutesRef={countdownTimerMinutesRef} countdownTimerSecondsRef={countdownTimerSecondsRef} timerRunOut={timerRunOut} stopCountDown={stopCountDown} setReloadMemoizedCountdownTimer={setReloadMemoizedCountdownTimer} reloadMemoizedCountdownTimer={reloadMemoizedCountdownTimer}/>
      </>
      )}
    </ThemeAwareSafeAreaView>
  )
}

const styles = StyleSheet.create({
  guessRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  guessSquare: {
    borderColor: "#d3d6da",
    borderWidth: 2,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  guessLetter: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#878a8c",
  },
  guessedLetter: {
    color: "#fff",
  },
  guessCorrect: {
    backgroundColor: "#6aaa64",
    borderColor: "#6aaa64",
  },
  guessInWord: {
    backgroundColor: "#c9b458",
    borderColor: "#c9b458",
  },
  guessNotInWord: {
    backgroundColor: "#787c7e",
    borderColor: "#787c7e",
  },

  container: {
    justifyContent: "space-between",
    flex: 1,    
  },

  // keyboard
  keyboard: { flexDirection: "column" },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  key: {
    backgroundColor: "#d3d6da",
    padding: 10,
    margin: 3,
    borderRadius: 5,
  },
  keyLetter: {
    fontWeight: "500",
    fontSize: 15,
  },

  // Game complete
  gameCompleteWrapper: {
    alignItems: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  lightningButtonTouchableOpacity:{
    borderColor: "#d3d6da",
    borderWidth: 0,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop:10,
    overflow:'hidden',
    backgroundColor:'black',    
  },
  overlay: {    
    borderColor: "#d3d6da",
    borderWidth: 0,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop:10,
    overflow:'hidden',
    backgroundColor:'black',
  },
  buttonSVG:{
    flex:1,
    height:100,
    width:100,    
    /* height:24,
    width:24,
    fontSize: 20,
    fontWeight: "bold",
    color: "#878a8c", */
  }
})