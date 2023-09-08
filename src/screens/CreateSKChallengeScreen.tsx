import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Function components cannot be given refs.',
])

import { Alert, View, useColorScheme } from "react-native"
import { Text, useTheme, Button, Input, AirbnbRating } from "@rneui/themed"

import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { Dimensions } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'

import GuessRow from "../components/GuessRow"

import DropdownComponent from "../components/DropdownComponent"

import { WordLengthSharedValueProvider, useWordLengthSharedValue } from "../context/WordLengthSharedValueProvider"
import { ChallengeDetailsObjectSharedValueProvider, useChallengeDetailsObjectSharedValue } from "../context/ChallengeDetailsObjectProvider"

import { useUserMetadataSharedValue } from "../context/UserMetadataProvider"

import { analyzeComment } from "../components/utils/analyzeCommentToxicity"
import Filter from 'bad-words'
import {francAll} from 'franc-min'

import { saveNewOrUpdateDocumentInCollection } from "../components/utils/firebaseUtils/saveNewOrUpdateDocumentInCollection"

import FIREBASE_COLLECTIONS from "../components/utils/firebaseUtils/constants/firebaseCollections"

import { ChallengeDataDocumentInterface, ChallengeIndexDocumentInterface } from "../components/utils/firebaseUtils/types/firebaseDocumentInterfaces"

import { retrieveUserNickname } from "../components/utils/firebaseUtils/retrieveUserNickname"
import { updateUserPosts } from "../components/utils/firebaseUtils/updateUserPosts"
import { updateNumberOfSkPointsBy } from "../components/utils/firebaseUtils/updateNumberOfSkPointsBy"
import { GAME_CONSTANTS } from "../constants/gameConstants"
import SkPointsEarnedComponent from "../components/SkPointsEarnedComponent"

const { width } = Dimensions.get('window')
const { height } = Dimensions.get('screen')

export default function CreateSKChallengeScreen({navigation, route, ...props}){        
    const flatListRef = React.useRef(null)    

    const { theme, updateTheme } = useTheme()
    const colorMode = useColorScheme()

    const flatListChildStyle = {width:width}

    const currentScreenIndexRef = React.useRef(0)    

    const [submitChallengeLoading, setSubmitChallengeLoading] = useState(false)
    const [statefulPointsAwarded, setStatefulPointsAwarded] = useState(0)
    const [showPointsAwardedDialog, setShowPointsAwardedDialog] = useState(false)
    
    
    function mapPageIndexToCssXOffset(index: number): number{        
        return index * width
    }

    const scrollToNextPage = () => {        
        const nextPageIndex = currentScreenIndexRef.current + 1
        flatListRef.current.scrollToOffset({ offset: mapPageIndexToCssXOffset(nextPageIndex), animated: true })
        // save the current page index
        currentScreenIndexRef.current = nextPageIndex
    }

    const scrollToFirstPage = () => {        
        const nextPageIndex = 0
        flatListRef.current.scrollToOffset({ offset: mapPageIndexToCssXOffset(nextPageIndex), animated: true })
        // save the current page index
        currentScreenIndexRef.current = nextPageIndex
    }

    function showAlertMessage(message: string){
        Alert.alert('Attention', message, [          
            {text: 'OK'},
        ])
    }

    async function sKChallengeIsValid(challengeObjectDetails):Promise<boolean>{                
        try {
            // remove blank space from the inputs
            const wordToDiscover = challengeObjectDetails.wordToDiscover.trim()
            const wordDefinition = challengeObjectDetails.wordDefinition.trim()
            const challengeTitle = challengeObjectDetails.challengeTitle.trim()
            const challengeDescription = challengeObjectDetails.challengeDescription.trim()
            const challengeCategoryLabel = challengeObjectDetails.challengeCategoryLabel.trim()

            // check word to discover length
            if(!(wordToDiscover.length<12)){
                showAlertMessage('Word to discover maximum length exceeded')
                return false
            }
            if(!(wordToDiscover.length>1)){
                showAlertMessage('Word to discover minimum length is 2 characters')                
                return false
            }
            // check word definition length
            if(!(wordDefinition.length>2)){
                showAlertMessage('Word definition too short')                
                return false
            }
            // check title length
            if(!(challengeTitle.length>2)){
                showAlertMessage('Title too short')
                //Promise.resolve(false)
                return false
            }
            // check description length
            if(!(challengeDescription.length>5)){
                showAlertMessage('Decription too short')
                return false
            }
            // check if category is present
            if(!(challengeCategoryLabel!='')){
                showAlertMessage('Category is blank')
                return false
            }
            // check word to discover length equals number of hints questions
            if(!(wordToDiscover.length==Object.keys(challengeObjectDetails.challengeHintsQuestionAndAnswers).length)){
                showAlertMessage('Number of Hints Q&A do not match original word to discover length')
                return false
            }
            // check all hints Q&A are present
            for (let index = 0; index < Object.keys(challengeObjectDetails.challengeHintsQuestionAndAnswers).length; index++) {
                const question = challengeObjectDetails.challengeHintsQuestionAndAnswers[index].question.trim()
                const answer = challengeObjectDetails.challengeHintsQuestionAndAnswers[index].answer.trim()
                if(!(question.length>2)){
                    showAlertMessage(`Hint question #${index} is too short, a minimum of 3 characters are needed`)
                    return false
                }
                if(!(answer.length>2)){
                    showAlertMessage(`Hint answer #${index} is too short, a minimum of 3 characters are needed`)
                    return false
                }
            }
            // check skchallenge category is defined
            if(!(challengeObjectDetails.hasOwnProperty('challengeCategoryUid'))){
                showAlertMessage('Select a category for your SKChallenge')
                return false
            }

            // When reaching this point, all the inputs are of valid length, now the content of the text will be evalued            
            // Step 1: Generate two input aggregating versions, the one with punctuation is generated to be used with the library bad-words
            let generatedTextToAnalyze = `${wordToDiscover}.${wordDefinition}.${challengeTitle}.${challengeDescription}.${challengeCategoryLabel}.`        
            let generatedTextToAnalyzeNoPunctuation = `${wordToDiscover} ${wordDefinition} ${challengeTitle} ${challengeDescription} ${challengeCategoryLabel}`

            for (let index = 0; index < Object.keys(challengeObjectDetails.challengeHintsQuestionAndAnswers).length; index++) {
                // Append each Q&A
                //console.log("iterating inside")
                generatedTextToAnalyzeNoPunctuation = generatedTextToAnalyzeNoPunctuation + ` ${challengeObjectDetails.challengeHintsQuestionAndAnswers[index].question} ${challengeObjectDetails.challengeHintsQuestionAndAnswers[index].answer}`

                generatedTextToAnalyze = generatedTextToAnalyze + `.${challengeObjectDetails.challengeHintsQuestionAndAnswers[index].question}.${challengeObjectDetails.challengeHintsQuestionAndAnswers[index].answer}`
            }

            //console.log("generatedTextToAnalyze",generatedTextToAnalyze)

            
            // Step 2: Detect language, must be english
            let languageProbabilities=null;
            try {
                languageProbabilities = francAll(generatedTextToAnalyze, {})
                const englishProbability = languageProbabilities.find(langProbabilityPair => langProbabilityPair[0] === 'eng')[1]
                //console.log('englishProbability',englishProbability)
                if (!(englishProbability>0.7)) {
                    showAlertMessage('The input you entered do not seem to be in english')
                    Promise.resolve(false)
                    //return false
                }
            } catch (error) {
                showAlertMessage('An internal error occured while detecting the words\' language')
            }

            // Step 3: Filter banned words
            //instantiate filter
            const filter = new Filter()
            // the library bad-words not only includes words but combinations of words that are also banned, because of this
            // create array of words from user input 
            const arrayOfWordsToAnalyze = generatedTextToAnalyze.split('.')
            for (let index = 0; index < arrayOfWordsToAnalyze.length; index++) {
                //console.log("analyze",arrayOfWordsToAnalyze[index])
                if(filter.isProfane(arrayOfWordsToAnalyze[index])){
                    showAlertMessage(`The following word you entered "${arrayOfWordsToAnalyze[index]}" is banned, remove it to be able to submit the quiz`)
                    return false        
                }
            }
            
            // Step 4: use NLP 'perspective API' online REST API to detect banned content. If the banned conent score is above 0.5, the SKChallenge is not allowed
            let perspectiveFoundContentValid:boolean = await analyzeComment(generatedTextToAnalyzeNoPunctuation).then(scores => {
                //console.log("scores.toxicityScore",scores.toxicityScore)
                //console.log("scores.profanityScore",scores.profanityScore)
                //console.log("scores.sexuallyExplicitScore",scores.sexuallyExplicitScore)
                if(scores.profanityScore>0.5 || scores.toxicityScore>0.5 || scores.sexuallyExplicitScore>0.5){
                    showAlertMessage('The words you had entered are banned due content moderation policy. If you think this message is incorrect and still want to create the quiz please proceed to contact the administrative team of SKWords')
                    return false
                }else{
                    return true
                }
               
              }
            ).catch(error => {showAlertMessage('An error has ocurred while contacting the content moderation service'); return false})            
            return perspectiveFoundContentValid
        } catch (error) {
            return false
        }
    }

    const handleSkChallengeUpload = async (challengeObjectDetails,userUid): Promise<boolean> =>{

        // cast to correct Firebase document typescript interface definition
        let generatedHintsQuestions = {}
        let generatedHintsAnswers = {}        
        for (let index = 0; index < Object.keys(challengeObjectDetails.challengeHintsQuestionAndAnswers).length; index++) {            
            generatedHintsQuestions[index] = challengeObjectDetails.challengeHintsQuestionAndAnswers[index].question
            generatedHintsAnswers[index] = challengeObjectDetails.challengeHintsQuestionAndAnswers[index].answer
        }
        const documentData: ChallengeDataDocumentInterface = {
            wordToDiscover: challengeObjectDetails.wordToDiscover,
            wordToDiscoverDefinition: challengeObjectDetails.wordDefinition,
            hintsQuestions: generatedHintsQuestions,
            hintsAnswers: generatedHintsAnswers            
        }
        const collectionName: string = FIREBASE_COLLECTIONS.CHALLENGES_DATA_COLLECTION
                
        // IMPORTANT:
        // There's three collections to update: 1)the collection that stores the data, 
        // 2) the collection that acts as an index of the skchallenges and contains metadata (for the homescreeen) about the challenge but not the data in itself,
        // and 3) the user's own posts
        
        // retrieve the user nickname
        let retrievedNickname = null
        retrieveUserNickname(userUid).then((document)=>{
            retrievedNickname = document.data().nickname
        }).catch((error)=>{
                /*** CHECK RETURN STATEMENT, NOT AFFECT PARENT AS MEANT ****/
                showAlertMessage('An server error has ocurred while retrieving your nickname from the server')
                return Promise.resolve(false)
            }
        )

        // save skchallenge in (the first) 'data' collection, when stored, firebase will return its generated created unique ID
        return saveNewOrUpdateDocumentInCollection(documentData, collectionName).then((document)=>{            
            // Now with the UID from the 'data' collection from firebase, create a new document in the 'index' collection
            let skChallengeGeneratedUid = document.id
            const documentData: ChallengeIndexDocumentInterface = {
                creationDate:new Date(new Date().toUTCString()),
                category: challengeObjectDetails.challengeCategoryLabel,
                categoryUid:challengeObjectDetails.challengeCategoryUid,
                challengeDataUid: skChallengeGeneratedUid,
                commentCount:0,
                likeCount:0,
                title:challengeObjectDetails.challengeTitle,
                description:challengeObjectDetails.challengeDescription,
                difficulty:challengeObjectDetails.challengeDifficulty,
                userDisplayName:retrievedNickname,
                
            }
            const collectionName: string = FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION
            return saveNewOrUpdateDocumentInCollection(documentData, collectionName).then((document)=>{
                // Now with the UID from the 'index' collection, update the user posts array
                let skChallengeIndex = document.id
                return updateUserPosts(userUid,skChallengeIndex).then(()=>{
                    console.log('the three collections updates have been sucessful, return true')
                    // the three collections updates have been sucessful, return true
                    return true
                }).catch(()=>{
                    showAlertMessage('An server error has ocurred and the SKChallenge was not associated to your account')
                    return false
                })
            }).catch((error)=>{
                showAlertMessage('An server error has ocurred and the SKChallenge could not be created')
                return false
            })
        }).catch((error)=>{
            showAlertMessage('An server error has ocurred and the SKChallenge could not be created')
            return false
        })
    }
    const handleSubmitChallenge = async (challengeObjectDetails,userUid):Promise<boolean> => {        
        let  sKChallengeIsValidResult = await sKChallengeIsValid(challengeObjectDetails)        
        //console.log("sKChallengeIsValidResult",sKChallengeIsValidResult)
        if (sKChallengeIsValidResult===true) {
            // All fields are valid, start backend updates            
            if(handleSkChallengeUpload(challengeObjectDetails,userUid)){                
                // All the challenge-related data has been created, award the user with skpoints
                return updateNumberOfSkPointsBy(userUid,GAME_CONSTANTS.SKPOINTS_AWARD_CHALLENGE_CREATION).then(()=>{                    
                    return true
                }).catch(()=>{
                    showAlertMessage('An server error has ocurred and you were not awarded points for creating the SKChallenge')                        
                    return false
                })
            }else{
                // Challenge could not be uploaded
                return Promise.resolve(false)    
            }
        }else{
            // Challenge input data is not valid
            return Promise.resolve(false)
        }
                
    }

    const handleMomentumScrollEnd = (event) => {        
        const offset = event.nativeEvent.contentOffset.x
        currentScreenIndexRef.current = Math.round(offset / width)
    }


    const [syncedStatefulArrayOfCharacters, setSyncedStatefulArrayOfCharacters] = useState(null)

    useEffect(()=>{

    },[syncedStatefulArrayOfCharacters])

    const wordDefinitionInputRef = useRef(null)
    const titleInputRef = useRef(null)
    const descriptionInputRef = useRef(null)
    const categoryInputRef = useRef(null)
    const difficultyRatingInputRef = useRef(null)

    //const guessRowComponentRef = useRef()

    function FirstPage(props){        
        return(
        <View id="container" style={[flatListChildStyle,{display:'flex',paddingHorizontal:'5%',paddingTop:'2%',backgroundColor:theme.colors.background, height:'100%', minHeight:'100%'}]}>
            <Text h3>Create and share your SKChallenge 🧠</Text>
            <Text style={{marginTop:'2%', fontSize: 14,lineHeight: 21,}}>Become a content creator for the community of players and earn SKPoints. You can create as many SKChallenges as you want for any topic of your liking</Text>            
            <View id='row-3' style={{display:'flex', flexDirection:'row', justifyContent:'flex-end',marginTop:'10%'}}>
                <Button onPress={scrollToNextPage} color={'success'} buttonStyle={{}} containerStyle={{flex:0.5, borderRadius:20}}>Start creating</Button>
            </View>
        </View>
        )
    }    

    function SecondPage(props){        

        const { sharedValue, setSharedValue } = useChallengeDetailsObjectSharedValue()

        const WrapperDropdownComponent = forwardRef(function dropdownComponent(props,categoryInputRef){
            return(
                <DropdownComponent categoryInputRef={categoryInputRef}></DropdownComponent>
            )
        })        
        
        return(            
            <View id="container" style={[flatListChildStyle,{display:'flex',paddingHorizontal:'5%',paddingTop:'2%',backgroundColor:theme.colors.background, height:'100%', minHeight:'100%', alignItems:'flex-start'}]}>
                <Text h3>Type the challenge word</Text>
                <GuessRow style={{marginTop:'10%',alignSelf:'center',height:'5%',minHeight:'5%'}} fontSize={20} fontWeight={'bold'}></GuessRow>
                <Text h4 style={{marginTop:'10%'}}>Enter the details</Text>
                <View style={{marginTop:'5%',width:'100%'/* , backgroundColor:'red' */}}>
                    <Input
                        ref={wordDefinitionInputRef}
                        value={sharedValue.wordDefinition}
                        placeholder="Enter the definition of the word"
                        onChange={(event) => {wordDefinitionInputRef.current = event.nativeEvent.text; setSharedValue({...sharedValue,wordDefinition:event.nativeEvent.text})}}
                    />
                    <Input
                        ref={titleInputRef}
                        value={sharedValue.challengeTitle}
                        placeholder="Enter a title for your SKChallenge"
                        onChange={(event) => {titleInputRef.current = event.nativeEvent.text; setSharedValue({...sharedValue,challengeTitle:event.nativeEvent.text})}}
                    />
                    <Input
                        ref={descriptionInputRef}
                        value={sharedValue.challengeDescription}
                        placeholder="Enter a description for your SKChallenge"
                        onChange={(event) => {descriptionInputRef.current = event.nativeEvent.text; setSharedValue({...sharedValue,challengeDescription:event.nativeEvent.text})}}
                    />                    
                    <WrapperDropdownComponent categoryInputRef={categoryInputRef}></WrapperDropdownComponent>
                    <View style={{paddingHorizontal:11/*, backgroundColor:'red' */,display:'flex', flexDirection:'row', justifyContent:'space-between',marginTop:'10%', alignItems:'center', alignContent:'center'}}>
                        <Text style={{fontSize:18,color:colorMode==='dark'?theme.colors.grey3:'rgba(36, 36, 36,0.55)',}}>Select the difficulty</Text>
                        <AirbnbRating  ref={difficultyRatingInputRef} onFinishRating={(number)=>{difficultyRatingInputRef.current = number; setSharedValue({...sharedValue,challengeDifficulty:number})}} showRating={false} count={6} defaultRating={3} size={20}/>
                    </View>
                </View>
                
                <View id='row-3' style={{display:'flex', flexDirection:'row', justifyContent:'flex-end',marginTop:'10%',alignSelf:'flex-end'}}>
                    <Button onPress={scrollToNextPage} color={'success'} buttonStyle={{}} containerStyle={{flex:0.5, borderRadius:20,}}>Continue</Button>
                </View>
            </View>        )
    }

    function ThirdPage(props){        
        // Retrieve use sharedValue from context        
        const { sharedValue: wordLengthSharedValue, setSharedValue: setWordLengthSharedValue } =useWordLengthSharedValue()
        const { sharedValue: challengeDetailsObjectSharedValue, setSharedValue: setChallengeDetailsObjectSharedValue } = useChallengeDetailsObjectSharedValue()
        // rename variable for clarity
        let statefulArrayOfCharacters = wordLengthSharedValue

        useEffect(()=>{
            // On rerender, which means in any change in either of the React Context values (wordLengthSharedValue, challengeDetailsObjectSharedValue), the object challengeHintsQuestionAndAnswers must be updated to reflect the number of characters and therefore number of Q&A pairs
            // This is required because the Input components below do not intialize the Q&A entries, they only update them
            if (Object.keys(challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers)<wordLengthSharedValue) {
                for (let index = 0; index < wordLengthSharedValue.length; index++) {
                    if(challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers.hasOwnProperty(index)==false){
                        setChallengeDetailsObjectSharedValue({...challengeDetailsObjectSharedValue, challengeHintsQuestionAndAnswers:{...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers,[index]: {...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index],'question': '','answer': ''}}})
                    }
                }
            }
        },[wordLengthSharedValue])
        
        

        return(            
            <View id="container" style={[flatListChildStyle,{/* display:'flex', */paddingHorizontal:'5%',paddingTop:'2%',backgroundColor:theme.colors.background, height:'100%', minHeight:'100%'}]}>
                <Text h3>Enter the hints 🤔</Text>          
                <Text style={{marginTop:'2%', fontSize: 14,lineHeight: 21,}}>Enter the hints Q&A for each of the word-to-discover characters. Remember that each hint question should be more difficult that the previous one</Text>  
                {/* <View id='row-3' style={{position:'absolute',bottom:20,zIndex:999,backgroundColor:'red',width:'100%', height:'10%',display:'flex', flexDirection:'row', justifyContent:'flex-end',marginTop:'10%',alignSelf:'flex-end'}}>
                    <Button onPress={scrollToNextPage} color={'success'} buttonStyle={{}} containerStyle={{flex:0.5, borderRadius:20,}}>Continue</Button>
                </View> */}
                
                <View style={{backgroundColor:theme.colors.background,width:'100%',height:'50%',maxHeight:'50%',marginTop:'5%',borderRadius:8, borderWidth:1, borderColor:theme.colors.divider}}>
                    <ScrollView 
                        persistentScrollbar={true}
                        // required for Android https://stackoverflow.com/questions/51098599/flatlist-inside-scrollview-doesnt-scroll
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        //showsHorizontalScrollIndicator={true}
                        contentContainerStyle={{flexGrow:1, display:'flex', justifyContent:'flex-start',gap:20, paddingBottom:5}}
                    >
                    {
                        statefulArrayOfCharacters.map((data, index)=>{
                            //console.log("third screen data",data)
                            return(
                                <View key={`${index}`} style={{display:'flex',justifyContent:'flex-start', alignItems:'center',alignContent:'center'}}>
                                    <Input    
                                        containerStyle={{}}
                                        inputContainerStyle={{}}
                                        inputStyle={{}}
                                        value={challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index].question}
                                        onChange={
                                            (event) => {
                                                setChallengeDetailsObjectSharedValue({...challengeDetailsObjectSharedValue, challengeHintsQuestionAndAnswers:{...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers,[index]: {...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index],'question': event.nativeEvent.text}}})
                                            }
                                        }
                                        placeholder={`Enter the hint question for character #${index+1}`}
                                        renderErrorMessage={false}
                                    />
                                    <Input
                                        containerStyle={{}}
                                        inputContainerStyle={{}}
                                        inputStyle={{}}
                                        value={challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index].answer}
                                        onChange={
                                            (event) => {
                                                setChallengeDetailsObjectSharedValue({...challengeDetailsObjectSharedValue, challengeHintsQuestionAndAnswers:{...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers,[index]: {...challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index],'answer': event.nativeEvent.text}}})
                                            }
                                        }
                                        placeholder={`Enter the hint answer for character #${index+1}`}
                                        renderErrorMessage={false}
                                    />
                                </View>
                            )
                        })
                    }
                    </ScrollView>
                </View>
                <View id='row-3' style={{display:'flex', flexDirection:'row', justifyContent:'flex-end',marginTop:'3%',alignSelf:'flex-end'}}>
                    <Button onPress={scrollToNextPage} color={'success'} buttonStyle={{}} containerStyle={{flex:0.5, borderRadius:20,}}>Continue</Button>
                </View>
            </View>
        )
    }
    function FourthPage(props){
        // Retrieve use sharedValue from context        
        const { sharedValue: wordLengthSharedValue, setSharedValue: setWordLengthSharedValue } =useWordLengthSharedValue()
        const { sharedValue: challengeDetailsObjectSharedValue, setSharedValue: setChallengeDetailsObjectSharedValue } = useChallengeDetailsObjectSharedValue()
        const { sharedValue: userMetadataSharedValue } =useUserMetadataSharedValue()        
        // rename variable for clarity
        let statefulArrayOfCharacters = wordLengthSharedValue

        return(
            <View id="container" style={[flatListChildStyle,{display:'flex',paddingHorizontal:'5%',paddingTop:'2%',backgroundColor:theme.colors.background, height:'100%', minHeight:'100%', alignItems:'flex-start', justifyContent:'flex-start'}]}>
                <Text h3>Review your SKChallenge</Text>                
                <View style={{marginTop:'5%',width:'100%'}}>
                    <Input
                        placeholder="Word to discover is empty"
                        value={challengeDetailsObjectSharedValue.wordToDiscover===''?null:'Word: '+challengeDetailsObjectSharedValue.wordToDiscover}
                        disabled={true}
                        containerStyle={{}}
                        inputContainerStyle={{}}
                        inputStyle={{}}
                        renderErrorMessage={false}
                    />
                    <Input
                        placeholder="Word definition is empty"
                        value={challengeDetailsObjectSharedValue.wordDefinition!=''?'Definition: '+challengeDetailsObjectSharedValue.wordDefinition:null}
                        disabled={true}
                        containerStyle={{}}
                        inputContainerStyle={{}}
                        inputStyle={{}}
                        renderErrorMessage={false}
                    />
                    <Input
                        placeholder="Title is empty"
                        value={challengeDetailsObjectSharedValue.challengeTitle!=''?'Title: '+challengeDetailsObjectSharedValue.challengeTitle:null}
                        disabled={true}
                        containerStyle={{}}
                        inputContainerStyle={{}}
                        inputStyle={{}}
                        renderErrorMessage={false}
                    />
                    <Input
                        placeholder="Description is empty"
                        value={challengeDetailsObjectSharedValue.challengeDescription!=''?'Description: '+challengeDetailsObjectSharedValue.challengeDescription:null}                      
                        disabled={true}
                        containerStyle={{}}
                        inputContainerStyle={{}}
                        inputStyle={{}}
                        renderErrorMessage={false}
                    />
                    <Input
                        placeholder="Category is empty"
                        value={challengeDetailsObjectSharedValue.challengeCategoryLabel!=''?'Category: '+challengeDetailsObjectSharedValue.challengeCategoryLabel:null}                        
                        disabled={true}
                        containerStyle={{}}
                        inputContainerStyle={{}}
                        inputStyle={{textTransform:'capitalize'}}
                        renderErrorMessage={false}
                    />
                    <View style={{paddingHorizontal:11,display:'flex', flexDirection:'row', justifyContent:'space-between',marginTop:'3%', alignItems:'center', alignContent:'center'}}>
                        <Text style={{fontSize:18,color:colorMode==='dark'?theme.colors.grey3:'rgba(36, 36, 36,0.55)',}}>Difficulty selected</Text>
                        <AirbnbRating  isDisabled={true} showRating={false} count={6} defaultRating={challengeDetailsObjectSharedValue.challengeDifficulty} size={20}/>
                    </View>
                </View>
                <Text style={{marginHorizontal:11,marginTop:'6%', fontSize:18, fontWeight:'bold'}}>Hints Q&A</Text>
                <View style={{width:'95%',minHeight:'23%',height:'23%',maxHeight:'23%',marginTop:'3%',borderRadius:8, borderWidth:1, borderColor:theme.colors.divider, marginLeft:11, marginRight:11,overflow:'hidden'}}>
                    <ScrollView 
                        persistentScrollbar={true}
                        // required for Android https://stackoverflow.com/questions/51098599/flatlist-inside-scrollview-doesnt-scroll
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        //showsHorizontalScrollIndicator={true}
                        //contentContainerStyle={{flexGrow:1, display:'flex', justifyContent:'flex-start',gap:20, paddingBottom:5, minHeight:'100%',maxHeight:'100%',overflow:'hidden'}}
                        contentContainerStyle={{flexGrow:1, display:'flex', justifyContent:'flex-start',gap:20, paddingBottom:5}}
                    >
                        {/* {Object.keys(sharedValue.challengeHintsQuestionAndAnswers).map(function(key, index){ */}
                        {statefulArrayOfCharacters.map(function(characterData, index){
                            /* console.log("\n==================")
                            console.log("\n==================")
                            console.log("4th screen key",characterData)
                            console.log("4th screen index",index)
                            console.log("sharedValue.challengeHintsQuestionAndAnswers",challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers) */
                            return(
                                <View key={`${index}`} style={{display:'flex',justifyContent:'flex-start', alignItems:'center',alignContent:'center'}}>
                                    <Input    
                                        containerStyle={{}}
                                        inputContainerStyle={{}}
                                        inputStyle={{}}
                                        disabled={true}
                                        value={challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index].question}
                                        placeholder={`No question for hint #${index+1}`}
                                        renderErrorMessage={false}
                                    />
                                    <Input
                                        containerStyle={{}}
                                        inputContainerStyle={{}}
                                        inputStyle={{}}
                                        disabled={true}
                                        value={challengeDetailsObjectSharedValue.challengeHintsQuestionAndAnswers[index].answer}
                                        placeholder={`No answer for hint #${index+1}`}
                                        renderErrorMessage={false}
                                    />
                                </View>
                            )
                        })}
                    </ScrollView>
                </View>
                <View id='row-3' style={{display:'flex', flexDirection:'row', justifyContent:'flex-end',marginTop:'5%',alignSelf:'flex-end'}}>
                    <Button loading={submitChallengeLoading} 
                        onPress={/* async */ ()=>{
                            setSubmitChallengeLoading(true)
                            handleSubmitChallenge(challengeDetailsObjectSharedValue,userMetadataSharedValue.uid).then((submitChallengeResult)=>{
                                //console.log("submitChallengeResult",submitChallengeResult)
                                if(submitChallengeResult){                                    
                                    // show the user the skpoints earned
                                    setStatefulPointsAwarded(GAME_CONSTANTS.SKPOINTS_AWARD_CHALLENGE_CREATION)                    
                                    setShowPointsAwardedDialog(true)
                                    // clear all stateful data
                                    setWordLengthSharedValue([''])
                                    setChallengeDetailsObjectSharedValue({wordToDiscover:'',wordDefinition:'', challengeTitle:'', challengeDescription:'', challengeCategoryLabel:'', challengeDifficulty:3,challengeHintsQuestionAndAnswers:{0:{question:'',answer:''}}})
                                    //when the user pressed OK on the dialog currently shown, the function scrollToFirstPage will be executed
                                }
                                setSubmitChallengeLoading(false)
                            }).catch((error)=>{
                                //console.log("handleSubmitChallenge catched error",error)
                                setSubmitChallengeLoading(false)
                            })
                        }} 
                    color={'success'} buttonStyle={{}} containerStyle={{flex:0.5, borderRadius:20,}}>Submit</Button>
                </View>
                {showPointsAwardedDialog?<SkPointsEarnedComponent callbackScrollToFirstPage={scrollToFirstPage} setShowPointsAwardedDialog={setShowPointsAwardedDialog} skPoints={statefulPointsAwarded}></SkPointsEarnedComponent>:null}
            </View>            
        )
    }
    const screensFlatListData = [
        { id: '1', screen: <FirstPage/> },
        { id: '2', screen: <SecondPage/>},
        { id: '3', screen: <ThirdPage/>},    
        { id: '4', screen: <FourthPage/> },
    ]
    
    return(
        <View style={{flex:1, minHeight:height}}>
            <ChallengeDetailsObjectSharedValueProvider initialStateValue={{wordToDiscover:'',wordDefinition:'', challengeTitle:'', challengeDescription:'', challengeCategoryLabel:'', challengeDifficulty:3,challengeHintsQuestionAndAnswers:{0:{question:'',answer:''}}}}>
            <WordLengthSharedValueProvider initialStateValue={['']}>
                <FlatList
                    // required for Android https://stackoverflow.com/questions/51098599/flatlist-inside-scrollview-doesnt-scroll
                    nestedScrollEnabled={true}
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    data={screensFlatListData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (item.screen)}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                />
            </WordLengthSharedValueProvider>
            </ChallengeDetailsObjectSharedValueProvider>
        </View>
        
        
    )    
}