import { Alert, View, useColorScheme } from "react-native"
import { StyleProp,ViewStyle } from "react-native"
import { Icon } from "@rneui/themed"
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet,TextInput } from 'react-native'

type FontWeight = 'normal' | 'bold' | number
interface GuessRowProps {
    fontSize: number
    fontWeight: FontWeight
    style?: StyleProp<ViewStyle>
}

import { useWordLengthSharedValue } from "../context/WordLengthSharedValueProvider"
import { useChallengeDetailsObjectSharedValue } from "../context/ChallengeDetailsObjectProvider";

const GuessRow = ({/* inputText, */style,fontSize,fontWeight, ...props}: GuessRowProps) => {
    //const { sharedValue, setSharedValue } = useChallengeDetailsObjectSharedValue()

    const { sharedValue: wordLengthSharedValue, setSharedValue: setWordLengthSharedValue } =useWordLengthSharedValue()
    const { sharedValue: challengeDetailsObjectSharedValue, setSharedValue: setChallengeDetailsObjectSharedValue } = useChallengeDetailsObjectSharedValue()


    let reactRefsObject = useRef({})    
    
    //console.log("=================================")
    //console.log("reactRefsObject",reactRefsObject)

    // Create the first blank character so the UI is not empty and the user can start typing
    //reactRefsObject.current[0] = useRef(null)
    if(0 in reactRefsObject.current == false){
        console.log("'0' in reactRefsObject",0 in reactRefsObject)
        console.log("was not initialized")
        reactRefsObject.current['0'] = ''
    }else{
        console.log("already initialized")
    }
       
    //console.log("rerender! reactRefsObject",reactRefsObject)

    // recreate stateful array on each rerender reading from useRef object
    let recreatedArrayOfCharacters = []
    Object.keys(reactRefsObject.current).forEach((index)=>{
        //recreatedArrayOfCharacters[index] = reactRefsObject.current[index].current
        recreatedArrayOfCharacters[index] = reactRefsObject.current[index]
    })    
    console.log("recreatedArrayOfCharacters",recreatedArrayOfCharacters)
    //const charactersTextInputRef = Array(recreatedArrayOfCharacters.length).fill(useRef(null))
    const [statefulArrayOfCharacters, setStatefulArrayOfCharacters] = useState(recreatedArrayOfCharacters)
    const charactersTextInputRef = Array(statefulArrayOfCharacters.length).fill(useRef(null))


    const [focusIndex,setFocusIndex] = useState(null)

    useEffect(()=>{
        if(focusIndex!=null){
            //console.log('useEffect statefulArrayOfCharacters',statefulArrayOfCharacters)
            //console.log('useEffect charactersTextInputRef',charactersTextInputRef)
            charactersTextInputRef[focusIndex].current.focus()
        }
    },[focusIndex])

    

    function handleCharacterChangeAndStoreAndFocusNext(event,index:number){

        function handleCharacterUiBoxDelete(boxIndex: number){
            // determine if the box to be deleted is the last one, the first one or if it's in the middle
            let arrayOfIndeces = Object.keys(reactRefsObject.current)
            // make the array content type numeric
            let castedArrayOfIndeces = arrayOfIndeces.map(index => Number(index));
            const maxValue = Math.max(...castedArrayOfIndeces)
            const minValue = 0
    
            if(boxIndex==maxValue){                
                delete reactRefsObject.current[boxIndex]
            }else{
                //Starting from the selected character, change all character indices to one less, then remove the last one
                let newReactRefsObject = {...reactRefsObject.current}
                for (let index = boxIndex+1; index <= maxValue; index++) {                                 
                    newReactRefsObject[index-1] = reactRefsObject.current[index]
                }
                delete newReactRefsObject[maxValue]
                reactRefsObject.current = {...newReactRefsObject}
            }
        }
        
        if(event.nativeEvent.text.length==1){
            reactRefsObject.current[index] = event.nativeEvent.text
        }else if(event.nativeEvent.text.length==2){
            //check if the character length limit (11) has been reached
            if(index==10){
                Alert.alert('You have reached the maximum of 11 characters', '', [          
                    {text: 'OK'},
                ])
            }else{
                reactRefsObject.current[index+1] = event.nativeEvent.text[1]
                // the next character UI box does not yet exist, asychronously set which box should be focused
                setFocusIndex(index+1)
            }
        }else if(event.nativeEvent.text.length==0){
            // sanity check, there is one character in the box
            if(reactRefsObject.current[index].length==1){
                // replace the character with nothing
                reactRefsObject.current[index] = ''
                //console.log('=== 1 charactersTextInputRef',charactersTextInputRef)
                // If the character UI box is not the last one (there's more than one), remove it                
                if(Object.keys(reactRefsObject.current).length>1){                    
                    handleCharacterUiBoxDelete(index)                    
                    //console.log('=== 2 charactersTextInputRef',charactersTextInputRef)
                    //charactersTextInputRef[index-1].current.focus()
                }
            }            
        }

        //after making changes in the object, translate its contents to an array and set the stateful array and trigger a rerender
        let recreatedArrayOfCharacters = []
        Object.keys(reactRefsObject.current).forEach((index)=>{
            recreatedArrayOfCharacters[index] = reactRefsObject.current[index]
        })
        console.log("3 recreatedArrayOfCharacters",recreatedArrayOfCharacters)        
        setStatefulArrayOfCharacters(recreatedArrayOfCharacters)
        
        //Sync react context parent container                

        let updatedChallengeHintsQuestionAndAnswers = {}
        for (let index = 0; index < recreatedArrayOfCharacters.length; index++) {
            updatedChallengeHintsQuestionAndAnswers[index]={'question': '','answer': ''}            
        }

        let updatedData = {...challengeDetailsObjectSharedValue,wordToDiscover:(recreatedArrayOfCharacters.join('')), challengeHintsQuestionAndAnswers:{...updatedChallengeHintsQuestionAndAnswers}}
        //console.log("Im going to set the fol object",updatedData)
        setChallengeDetailsObjectSharedValue(updatedData)
        setWordLengthSharedValue(recreatedArrayOfCharacters)
    }
    

    let styles = StyleSheet.create({
        containerView: {
            display:'flex',
            flexDirection:'row', 
            // Horizontal Axis
            justifyContent:'center',
            // Vertical Axis
            /* alignItems:'center',
            alignContent:'center',
            alignSelf:'center', */
            //flexWrap:'wrap',
            gap:10,
        },
        textInput: {
            flex:1,
            minWidth:'5%',
            maxWidth:'10%',
            backgroundColor:'#6aaa64', 
            borderColor:'white',
            borderWidth:1,
            display:'flex', 
            textAlign:'center',
            fontSize:fontSize,
            fontWeight:fontWeight,
        },
        currenFocusTextInput: {
            flex:1,
            backgroundColor:'#a464aa', 
            borderColor:'white',
            borderWidth:1,
            display:'flex', 
            textAlign:'center',
            fontSize:fontSize,
            fontWeight:fontWeight,
        }
    })    

    return(
        <View style={[style,styles.containerView]}>
            <Icon name='arrow-right' type='font-awesome' color='#f50' containerStyle={{alignSelf:'center'}}/>
            {statefulArrayOfCharacters.map((statefulChar, index) => (
                <TextInput 
                    ref={charactersTextInputRef[index]}
                    key={index}
                    style={StyleSheet.flatten([styles.textInput,focusIndex==index?styles.currenFocusTextInput:{}])}
                    maxLength={2}
                    onChange={(event) => handleCharacterChangeAndStoreAndFocusNext(event, index)}
                    value={statefulChar}                    
                >
                </TextInput>
            ))}
            <Icon name='pencil' type='font-awesome' color='#f50' containerStyle={{alignSelf:'center'}}/>
        </View>
    )
}

export default GuessRow;