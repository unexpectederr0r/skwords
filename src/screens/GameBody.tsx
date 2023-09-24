import React, {useEffect, useState, MutableRefObject} from "react"
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, useColorScheme, Alert, Keyboard, TouchableWithoutFeedback, BackHandler, useWindowDimensions} from "react-native"
import { Text as RNEText, Icon, useTheme, Dialog, Input, Button as RNEButton} from "@rneui/themed"
import LigthningSVG from '../assets/images/misc/lightning.svg'
import { ChallengeDataDocumentInterface, ChallengeIndexDocumentInterface } from "../components/utils/firebaseUtils/types/firebaseDocumentInterfaces"
import { GAME_CONSTANTS } from "../constants/gameConstants"
import { updateNumberOfSkPointsBy } from "../components/utils/firebaseUtils/updateNumberOfSkPointsBy"

import { useUserMetadataSharedValue } from "../context/UserMetadataProvider"
import { updateStatsOfPlayedChallenge } from "../components/utils/firebaseUtils/updateStatsOfPlayedChallenge"
import { updateSkPointsHistory } from "../components/utils/firebaseUtils/updateSkPointsHistory"

/*
==========================================
==========================================
==========================================

ATTENTION: This file was developed upon the code originally found in the following website: https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
The keyboard and overall Wordle resemblant UI was copied AS IS from that website and is not of my authorship.
The rest of the logic that integrates the copied UI code is mine.

==========================================
==========================================
========================================== 
*/


let colorMode = null

interface GameBodyProps {
  isFeaturedRef: React.RefObject<boolean>,
  challengeData: ChallengeDataDocumentInterface,
  challengeIndexData: ChallengeIndexDocumentInterface,
  navigation: any,
  maxNumberOfSeconds: number,
  props?:any
  countdownTimerMinutesRef: React.RefObject<number>,
  countdownTimerSecondsRef: React.RefObject<number>,
  timerRunOut: boolean,
  stopCountDown: MutableRefObject<boolean>
  setReloadMemoizedCountdownTimer: React.Dispatch<React.SetStateAction<boolean>>
  reloadMemoizedCountdownTimer: boolean
}

export default function GameBody({isFeaturedRef, challengeData, challengeIndexData, navigation, maxNumberOfSeconds,countdownTimerMinutesRef,countdownTimerSecondsRef,timerRunOut,stopCountDown,setReloadMemoizedCountdownTimer,reloadMemoizedCountdownTimer,...props}:GameBodyProps) {
  
  
  colorMode = useColorScheme()
  const { theme, updateTheme } = useTheme()
  
  const [wordToDiscover, setWordToDiscover] = useState<string>('')
  const [playerGuessTryIndex, setPlayerGuessTryIndex] = useState(0)
  const [playerGuessesEntriesObject, setPlayerGuessesEntriesObject] = useState({})

  const [showConfirmationDialogAboutHintsUsage, setShowConfirmationDialogAboutHintsUsage] = useState(false)
  const [showSolveHintComponent, setShowSolveHintComponent] = useState(false)
  
  const [hintIndex, setHintIndex] = useState(null)
  const [statefulHintQuestion, setStatefulHintQuestion] = useState('')
  const [statefulHintAnswer, setStatefulHintAnswer] = useState('')

  const [characterHintUsedMapArray, setCharacterHintUsedMapArray] = useState([])

  const [disableVirtualKeyboardInput, setDisableVirtualKeyboardInput] = useState<boolean>(false)
  const [showGameFinishedComponent, setShowGameFinishedComponent] = useState<boolean>(false)

  const [playerLost, setPlayerLost] = useState<boolean>(false)

  const [finalPlayerScoreAsPercentage, setFinalPlayerScoreAsPercentage] = useState<number>(0)
  const [awardedSkPoints, setAwardedSkPoints] = useState<number>(0)

  const { sharedValue: userMetadataSharedValue } =useUserMetadataSharedValue()
  const USER_UID = userMetadataSharedValue.uid

  function preprocessFetchedData(challengeData){
    // Based on the word to discover length, build an empty array. This array of characters represent each row in the UI
    let userGuessRowArrayOfCharacters : string[] = new Array(challengeData.wordToDiscover.length)        
    let auxCharacterHintUsedMapArray : boolean[] = new Array(challengeData.wordToDiscover.length)        

    // Using the word-to-discover length, initialize the content of each of the row's array contents and an array that will keep track of the hints used (remember there's one hint per character)
    for (let index = 0; index < userGuessRowArrayOfCharacters.length; index++) {
      userGuessRowArrayOfCharacters[index] = ""
      auxCharacterHintUsedMapArray[index] = false
    }
    // Define the object (and set its typescript type)
    let playerGuessesObject : { [key: number]: string[] }  = {}
    
    // Build an object in which each of its indexes represent the a 'guess try' which stores the correpoding row of characters array
    // Notice how the maximum number of tries is determined by a game constant but, if later iterations of the game allowed players to make new quizzes with custom 'number of guesses allowed', this could be easily changed here
    for (let index = 0; index < GAME_CONSTANTS.CHALLENGE_NUMBER_OF_GUESSES_ALLOWED; index++) {            
        // Destructuring the array like this will force the creation of new arrays, failing to do it will make all the object indeces point to the same array
        playerGuessesObject[index]=[...userGuessRowArrayOfCharacters]
    }
    // force lower case
    const wordToDiscoverLowerCase = challengeData.wordToDiscover.toLowerCase()
    // update the states and trigger the render    
    setWordToDiscover(wordToDiscoverLowerCase)
    setPlayerGuessesEntriesObject(playerGuessesObject)
    setCharacterHintUsedMapArray(auxCharacterHintUsedMapArray)    
  }

  useEffect(() => {
    preprocessFetchedData(challengeData)
  },[])

  // This callback is for android devices only. See https://reactnative.dev/docs/backhandler
  BackHandler.addEventListener('hardwareBackPress', ()=>{
    if(reloadMemoizedCountdownTimer){
      navigation.goBack()
    }else{
      Alert.alert('Warning', 'If you give up, SKPoints will be substracted from your account. Are you sure you want to give up?', [          
        {
          text: 'Cancel', style: 'cancel'
        },
        {
          text: 'Give up 😔', 
          style: 'destructive',
          onPress: () => handlePlayerLost()
        },
      ])
    }
    return true
  })

  useEffect(() => {
    if(timerRunOut){
      handlePlayerLost()
    }
  },[timerRunOut])

  const {height: screenHeight, width: screenWidth} = useWindowDimensions()

  // As mentioned above, the styling was adapted from the following source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native 
  const styles = StyleSheet.create({
    guessRow: {
      flexDirection: "row",
      justifyContent: "center",
    },
    guessSquare: {
      borderColor: "#d3d6da",
      borderWidth: 2,
      // By default the size of the box for the character is 50 but if giving the length of the word, the sum of the boxes exceeds 80% of the width, decrease the box width
      // Notice that the '5' value multiplied by the length of the word-to-discover is for the margin between the boxes
      width:((wordToDiscover.length * 50) > Math.floor(screenWidth*0.8-wordToDiscover.length * 5))?Math.floor(Math.floor(screenWidth*0.8-wordToDiscover.length * 5)/wordToDiscover.length):50,
      // set maxWidth and min Width
      maxWidth: 50,
      minWidth: 7,
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
      // same formula as for the character boxes but always substract 10 points for the hints lightning circle
      width:((wordToDiscover.length * 50) > Math.floor(screenWidth*0.8-wordToDiscover.length * 5))?Math.floor(Math.floor(screenWidth*0.8-wordToDiscover.length * 5)/wordToDiscover.length)-10:40,
      height:((wordToDiscover.length * 50) > Math.floor(screenWidth*0.8-wordToDiscover.length * 5))?Math.floor(Math.floor(screenWidth*0.8-wordToDiscover.length * 5)/wordToDiscover.length)-10:40,
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

  // As mentioned above, the following component was adapted from the following original source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
  const CharacterComponent = ({ index, playerCharacter, wordToDiscover, guessAlreadyUsed}) => {
  
    let wordLetter = wordToDiscover[index]
    
    // convert to lowecase
  
    const blockStyles = [styles.guessSquare]
    const textStyles = [styles.guessLetter]
  
    if (playerCharacter.toLowerCase() === wordLetter && guessAlreadyUsed) {
      blockStyles.push(styles.guessCorrect)
      textStyles.push(styles.guessedLetter)
    } else if (wordToDiscover.includes(playerCharacter.toLowerCase()) && guessAlreadyUsed) {
      blockStyles.push(styles.guessInWord)
      textStyles.push(styles.guessedLetter)
    } else if (guessAlreadyUsed) {
      blockStyles.push(styles.guessNotInWord)
      textStyles.push(styles.guessedLetter)
    }
  
    return (
      <View style={blockStyles}>
        <Text style={textStyles}>{playerCharacter}</Text>
      </View>
    )
  }
  
  // As mentioned above, the following component was adapted from the following original source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
  const GuessRow = ({guess,wordToDiscover,guessAlreadyUsed}) => {    
    return (
      <View style={styles.guessRow}>
        {Array.apply(null, Array(wordToDiscover.length)).map(function (item,index) {
          return(
            <CharacterComponent key={index} index={index} playerCharacter={guess[index]} wordToDiscover={wordToDiscover} guessAlreadyUsed={guessAlreadyUsed} />
          )
        })}
      </View>
    )
  }
  
  // As mentioned above, the following component was adapted from the following original source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
  const KeyboardRow = ({ arrayOfCharacters, onKeyPress}) => (
    <View style={styles.keyboardRow}>
      {arrayOfCharacters.map(character => (
        <TouchableOpacity onPress={() => onKeyPress(character)} key={character}>
          <View style={styles.key}>
            <Text style={styles.keyLetter}>{character}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
  
  // As mentioned above, the following component was adapted from the following original source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
  const KeyboardComponent = ({ onKeyPress }) => {
    const charactersInKeyboardFirstRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
    const charactersInKeyboardSecondRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
    const charactersInKeyboardThirdRow = ["Z", "X", "C", "V", "B", "N", "M", "⌫"]
  
    return (
      <View style={styles.keyboard}>
        <KeyboardRow arrayOfCharacters={charactersInKeyboardFirstRow} onKeyPress={onKeyPress} />
        <KeyboardRow arrayOfCharacters={charactersInKeyboardSecondRow} onKeyPress={onKeyPress} />
        <KeyboardRow arrayOfCharacters={charactersInKeyboardThirdRow} onKeyPress={onKeyPress} />
        <View style={styles.keyboardRow}>
          <TouchableOpacity onPress={() => onKeyPress("SUBMIT")}>
            <View style={styles.key}>
              <Text style={styles.keyLetter}>SUBMIT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  function getSecondsLeft():number{
    return countdownTimerMinutesRef.current * 60 + countdownTimerSecondsRef.current
  }

  function calculatePlayerScoreAsPercentage():number{    
    
    let totalHintsUsed:number = 0
    characterHintUsedMapArray.forEach((content)=>{
      content===true?(totalHintsUsed+=1):null
    })

   //const secondsLeft:number = countdownTimerMinutesRef.current * 60 + countdownTimerSecondsRef.current
   const secondsLeft:number = getSecondsLeft()
   const timeFactorRatio:number = (secondsLeft / maxNumberOfSeconds)

   const hintsUsedFactorRatio:number = 1 -  (1 * (totalHintsUsed / characterHintUsedMapArray.length))

   let averageHintsAndTimeFactorsRatio = (timeFactorRatio+hintsUsedFactorRatio)/2
   // the score can never be zero
   averageHintsAndTimeFactorsRatio = averageHintsAndTimeFactorsRatio==0?0.01:averageHintsAndTimeFactorsRatio
   
    // difficuly in the database ranges from 0 to 6, being 0 the easiest difficulty and 6 the hardest, 1 will be added to calculate the ratio and avoid dealing with 0
    const difficultyFactor:number = challengeIndexData.difficulty+1

    return parseFloat((((difficultyFactor*averageHintsAndTimeFactorsRatio)/difficultyFactor)*100).toFixed(2))
  }

  function calculateAwardedSkPoints(playerPerformanceAsPercentage):number{       
    const challengeIsFeaturedMultiplier = (isFeaturedRef.current===true?GAME_CONSTANTS.SKPOINTS_MULTIPLIER_WHEN_CHALLENGE_IS_FEATURED:1)
    const awardedPoints = Math.floor((challengeIndexData.difficulty+1) * GAME_CONSTANTS.CHALLENGE_SUCESSFULLY_SOLVED_MIN_AWARDED_POINTS * (playerPerformanceAsPercentage/100)) * challengeIsFeaturedMultiplier
    return (awardedPoints)>0?awardedPoints:1
  }

  function calculatePenalizedSkPoints(playerPerformanceAsPercentage:number):number{       
    return (Math.floor((challengeIndexData.difficulty+1) * GAME_CONSTANTS.CHALLENGE_FAILED__MIN_PENALIZED_POINTS * (playerPerformanceAsPercentage/100)))
  }

  async function handlePlayerSuccessfullySolvedTheChallenge():void{
    stopCountDown.current = true
    setReloadMemoizedCountdownTimer(true)
    const playerScoreAsPercentage:number = calculatePlayerScoreAsPercentage()    
    const awardedSkPoints:number = calculateAwardedSkPoints(playerScoreAsPercentage)
    
    await updateSkPointsHistory(USER_UID,awardedSkPoints).catch(()=>{
      Alert.alert('Warning', "There was an error updating your statistics in the database, the 'My Stats' tab may not reflect accurate information", [{text: 'OK',}])    
    })
    updateNumberOfSkPointsBy(USER_UID,awardedSkPoints).then(async ()=>{
        const timeTakenInSeconds = maxNumberOfSeconds - getSecondsLeft()
      updateStatsOfPlayedChallenge(USER_UID,playerScoreAsPercentage,timeTakenInSeconds,awardedSkPoints).then(()=>{
      }).catch(()=>{
          Alert.alert('Warning', "There was an error updating your statistics in the database, the 'My Stats' tab may not reflect accurate information", [{text: 'OK',}])    
      })
    }).catch(()=>{

    })
    setFinalPlayerScoreAsPercentage(playerScoreAsPercentage)    
    setAwardedSkPoints(awardedSkPoints)
    setShowGameFinishedComponent(true)
  }

  async function handlePlayerLost():void{
    setShowSolveHintComponent(false)
    stopCountDown.current = true
    setReloadMemoizedCountdownTimer(true)
    const playerScoreAsPercentage:number = calculatePlayerScoreAsPercentage()    
    const penalizedSkPoints:number = calculatePenalizedSkPoints(playerScoreAsPercentage)
    // Notice the negative number (-1) mutipliying the number of penalized skPoints
    await updateSkPointsHistory(USER_UID,((-1)*penalizedSkPoints)).catch(()=>{
      Alert.alert('Warning', "There was an error updating your statistics in the database, the 'My Stats' tab may not reflect accurate information", [{text: 'OK',}])    
    })
    // Notice the negative number (-1) mutipliying the number of penalized skPoints
    updateNumberOfSkPointsBy(USER_UID,((-1) * penalizedSkPoints)).then(async ()=>{
        const timeTakenInSeconds = maxNumberOfSeconds - getSecondsLeft()
        const scoreToStoreInDb = 0
      updateStatsOfPlayedChallenge(USER_UID,scoreToStoreInDb,timeTakenInSeconds,((-1)*penalizedSkPoints)).then(()=>{
      }).catch(()=>{
          Alert.alert('Warning', "There was an error updating your statistics in the database, the 'My Stats' tab may not reflect accurate information", [{text: 'OK',}])    
      })
    })
    .catch(()=>{
      Alert.alert('Warning', "There was an error updating your SkPoints in the database", [{text: 'OK',}])    
    })
    setPlayerLost(true)
    setFinalPlayerScoreAsPercentage(playerScoreAsPercentage)    
    setAwardedSkPoints(penalizedSkPoints)
    setShowGameFinishedComponent(true)
  }

  const handleKeyPress = (virtualKeyboardInputCharacter: string):void => {        
    if(disableVirtualKeyboardInput===true){
      return
    }
    
    let currentWordGuess: string[]= playerGuessesEntriesObject[playerGuessTryIndex]
    
    let lengthOfCurrentWordGuess: number = null
    for (let index = 0; index < currentWordGuess.length; index++) {
      if(currentWordGuess[index]!=""){
        lengthOfCurrentWordGuess+=1
      }
    }
  
    // When the user presses "submit" in the virtual keyboard it means that a word guess is submitted to check whether it is the word to be discovered or not
    if (virtualKeyboardInputCharacter === "SUBMIT") {
      // If the length of the current guess is lower than the length of the word to be discovered return
      if (lengthOfCurrentWordGuess !== wordToDiscover.length) {
        alert("Word too short.")
        return
      }

      // create a lowercase string from the user input characters array
      const currentWordGuessLowerCase = currentWordGuess.join('').toLowerCase()
      // Compare if the current guess is equal to the word to be discovered
      if (currentWordGuessLowerCase === wordToDiscover) {
        handlePlayerSuccessfullySolvedTheChallenge()
        return
      }
       
      // The word entered by the player was not the word-to-discover
      // remove 1 from the number of guesses allowed since playerGuessTryIndex starts counting at zero
      if (playerGuessTryIndex < GAME_CONSTANTS.CHALLENGE_NUMBER_OF_GUESSES_ALLOWED-1) {
        // If the current index is less than the maximum amount, add 1 to the tracking state and the player can continue playing
        setPlayerGuessTryIndex(playerGuessTryIndex + 1)
      } else {
        // The player has used all the tries possible to find the word, show a you lose message
        handlePlayerLost()
        return
      }
    }

    if (virtualKeyboardInputCharacter === "⌫") {
      // Loop starting from the end of the array of characters, the first non-blank entry is deleted
      for (let index = currentWordGuess.length-1; index >= 0; index--) {
        if(currentWordGuess[index]!=""){
          currentWordGuess[index] = ""
          break
        }
      }
      setPlayerGuessesEntriesObject({ ...playerGuessesEntriesObject, [playerGuessTryIndex]:  currentWordGuess})
      return
    }

    // Ignore the user input if the currentWordGuess is full
    if (lengthOfCurrentWordGuess >= wordToDiscover.length) {
      return
    }

    // Loop over the array of characters that correspond to the current guess (row in the UI), the first blank entry should store the new input character
    for (let index = 0; index < currentWordGuess.length; index++) {
      if(currentWordGuess[index]==""){
        currentWordGuess[index] = virtualKeyboardInputCharacter
        break
      }
    }              
    // update the state and rerender
    setPlayerGuessesEntriesObject({ ...playerGuessesEntriesObject, [playerGuessTryIndex]:  currentWordGuess})    
  }  

  const ThemeAwareSafeAreaView = (props) => {
    const { theme, updateTheme } = useTheme()           
    return(
        <SafeAreaView style={{backgroundColor:theme.colors.background, justifyContent: "space-between",flex: 1,}}>
            {props.children}
        </SafeAreaView>
    )
  }  

  const handleShowHint = (index)=>{
    setHintIndex(index)
    setShowConfirmationDialogAboutHintsUsage(true)    
  }

  const handleSolvedHintSuccessfully = ()=>{    
    // retrive character index and fill boxes with character
    for (let index = 0; index < Object.keys(playerGuessesEntriesObject).length; index++) {
      // match virtual keyboard uppercase style
      playerGuessesEntriesObject[index][hintIndex]=wordToDiscover[hintIndex].toUpperCase()
    }    
    // close hint window        
    setShowSolveHintComponent(false)
    setDisableVirtualKeyboardInput(false)
  }

  const SolveRevealCharacterComponent = (props)=>{        
    const [userAnswer, setUserAnswer] = useState('')    
    const [errorMessage, setErrorMessage] = useState('')

    const handleCheckCorrectAnswer = ()=>{      
      if (props.correctAnswer.trim().toLowerCase()===userAnswer.trim().toLowerCase()){
        handleSolvedHintSuccessfully()
      }else{
        setErrorMessage("Oops! that's not correct...try again...")
      }
    }

    const handleCloseGiveUp = ()=>{      
      Alert.alert('Warning', 'If you give up, SKPoints will be substracted from your account. Are you sure you want to give up?', [          
        {
          text: 'Cancel', 
        },
        {
          text: 'Give up 😔', 
          onPress: () => handlePlayerLost()
        },
      ])      
    }

    return(
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{margin:'5%',position:'absolute',width:'90%', height:'95%', borderRadius:20, borderWidth:1, borderColor: theme.colors.greyOutline,backgroundColor:theme.colors.background, opacity:0.95, zIndex:5,paddingVertical:'15%',paddingHorizontal:'5%'}}> 
          <View style={{position:'absolute',zIndex:2, marginLeft:10, marginTop:10, left:0, top:0, borderRadius:50}}>
            <Icon
              name= 'close-circle'
              type= 'material-community'
              size= {30}
              color= {colorMode==='dark'?'white':'black'}
              onPress={()=>handleCloseGiveUp()}
            />
          </View>
          <View id={'textContainer'} style={{flex:1, display:'flex', justifyContent:'flex-start', alignItems:'center'}}>
            <View>          
              <RNEText h1 style={{color:theme.colors.secondary}}>Hint #{hintIndex+1}</RNEText>
            </View>
            <View style={{marginTop:'10%'}}>          
              <RNEText h4>{props.question}</RNEText>
            </View>
            <View style={{marginTop:'5%'}}>
              <Input
                errorStyle={{ color: 'red' }}
                errorMessage={errorMessage}
                value={userAnswer}
                onChangeText={value => setUserAnswer(value)}
                containerStyle={{minWidth:'100%',padding:0,margin:0,zIndex:5}}
                placeholder='Your answer'
              />
            </View>
            <RNEButton containerStyle={{alignSelf:'center', marginTop:'5%'}} title="Check answer" onPress={() => {handleCheckCorrectAnswer()}}/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  function BoldRNEText (props){
    return(
      <RNEText style={{fontWeight:'bold'}}>
        {props.children}
      </RNEText>
    )
  }

  const GameFinishedComponent = ()=>{
    const emojiArray = [
      '🥺',
      '😓',
      '🥱',
      '😬🤡',
      '🧐',
      '😌',
      '😁',
      '🤩',
      '😎👌',
      '💯🔥',
    ]    
    const ScoreComponent = ()=>{
      return(
        <View>
        <RNEText h3 style={{marginTop:'10%'}}>Your overall score:</RNEText>
        {emojiArray[Math.floor(finalPlayerScoreAsPercentage / 10)].length==4?
          (
            <View style={{display:'flex', flexDirection:"row", gap:10 ,alignItems:'center', justifyContent:'center', marginTop:'5%'}}>
              <RNEText style={{fontSize:50}}>{emojiArray[Math.floor(finalPlayerScoreAsPercentage / 10)].slice(0,2)}</RNEText>
              <RNEText style={{fontSize:55, fontWeight:'bold'}}>{finalPlayerScoreAsPercentage}%</RNEText>
              <RNEText style={{fontSize:50}}>{emojiArray[Math.floor(finalPlayerScoreAsPercentage / 10)].slice(2,4)}</RNEText>
            </View>
          )
          :
          (
            <RNEText style={{fontSize:50}}>{finalPlayerScoreAsPercentage}% {emojiArray[Math.floor(finalPlayerScoreAsPercentage / 10)]}</RNEText>
          )
        }
        </View>
      )
    }
    return(      
      <View style={{marginHorizontal:'5%', marginTop:'15%',position:'absolute',width:'90%', height:'60%', borderRadius:20, borderWidth:1, borderColor: theme.colors.greyOutline,backgroundColor:theme.colors.background, opacity:0.95, zIndex:5,paddingVertical:'5%',paddingHorizontal:'5%',display:'flex'}}>
        <View id={'gameFinishedFlexContainer'} style={{flex:1, display:'flex', justifyContent:'center'}}>
          <View id={'textContainer'} style={{flex:5, justifyContent:'center', alignItems:'center'}}>
            <RNEText h1>{!playerLost?'Success!':'You lost 🥺'}</RNEText>            
            {!playerLost?<ScoreComponent/>:null}            
            <RNEText h4 style={{marginTop:'10%'}}>{!playerLost?'You won':'You lost'} <BoldRNEText>{awardedSkPoints}</BoldRNEText> SKPoints</RNEText>
          </View>
          <View id={'buttonContainer'} style={{flex:1, justifyContent:'flex-end'}}>
            <RNEButton
              containerStyle={{justifyContent:'flex-end'}}
              title="Finish"
              onPress={() => {navigation.goBack()}}
            />
          </View>
        </View>
      </View>      
    )
  }

  return (              
      <ThemeAwareSafeAreaView>         
        <SafeAreaView style={styles.container}>
          {/* The GameFinishedComponent will render on top of the UI */}         
          {showGameFinishedComponent?<GameFinishedComponent/>:null}
          <Dialog isVisible={showConfirmationDialogAboutHintsUsage} onBackdropPress={()=>setShowConfirmationDialogAboutHintsUsage(false)}>
            <Dialog.Title title="Confirm reveal character"/>
            <Text>If you use the reveal character option you will be required to answer a question correctly before you can continue playing. Failing to solve the hint will penalize you by substracting SKPoints from your account.</Text>
            <Text>Are you sure you want to continue?</Text>
            <Dialog.Actions>
              <Dialog.Button
                title="CONTINUE"
                onPress={()=>{
                  setDisableVirtualKeyboardInput(true)
                  setStatefulHintQuestion(challengeData.hintsQuestions[hintIndex])
                  setStatefulHintAnswer(challengeData.hintsAnswers[hintIndex])
                  let auxCharacterHintUsedMapArray = [...characterHintUsedMapArray]
                  auxCharacterHintUsedMapArray[hintIndex] = true
                  setCharacterHintUsedMapArray(auxCharacterHintUsedMapArray)
                  setShowSolveHintComponent(true)
                  setShowConfirmationDialogAboutHintsUsage(false)
                }}
              />
              <Dialog.Button title="CANCEL" onPress={()=>setShowConfirmationDialogAboutHintsUsage(false)} />
            </Dialog.Actions>
          </Dialog>
          {showSolveHintComponent?<SolveRevealCharacterComponent navigation={navigation} question={statefulHintQuestion} correctAnswer={statefulHintAnswer} />:null}                  
          <View style={{flexDirection: "row",justifyContent: "center"}}>
            {Array.apply(null, Array(wordToDiscover.length)).map(function (item,index) {
              return(
                <TouchableOpacity key={index} onPress={()=>handleShowHint(index)} style={[styles.lightningButtonTouchableOpacity,{backgroundColor:characterHintUsedMapArray[index]===true?theme.colors.background:styles.lightningButtonTouchableOpacity.backgroundColor}]} disabled={characterHintUsedMapArray[index] || disableVirtualKeyboardInput}>                          
                  {characterHintUsedMapArray[index]===false?<LigthningSVG style={styles.buttonSVG}/>:null}                            
                </TouchableOpacity>
              )
            })}                    
          </View>
          <View>        
              {
                Object.keys(playerGuessesEntriesObject).map(function (key,index) {
                  // As mentioned above, the following code was adapted from the following original source https://www.reactnativeschool.com/build-a-wordle-clone-with-react-native
                  return(
                    <GuessRow
                        key={index}
                        // This is the row word (array of characters) that the player has typed as the guess
                        guess={playerGuessesEntriesObject[index]}
                        // the correct word to discover is passed to compare the player entry with it and based on its results, color the boxes accordingly to match Wordle styling
                        wordToDiscover={wordToDiscover}
                        // The following boolean value will color the row grey when the user has already submited the guess and was wrong
                        guessAlreadyUsed={playerGuessTryIndex > index}
                    />
                  )
                })
              }
          </View>    
          <View>
              <KeyboardComponent onKeyPress={handleKeyPress} />
          </View>
        </SafeAreaView>
      </ThemeAwareSafeAreaView>
  ) 
}

  

