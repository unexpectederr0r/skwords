/*
*****************************************
*****************************************
ATTENTION: This file code is based on a template taken from the following URL: https://github.com/hoaphantn7604/react-native-element-dropdown

Changes had been made to match the UI style of the app and sync the category state across the screens
*****************************************
*****************************************
*/
import { Icon, Text, useTheme } from "@rneui/themed"
import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, View, useColorScheme } from 'react-native'
import { Dropdown, MultiSelect } from 'react-native-element-dropdown'
import { firebase } from '../../firebaseConfig'

import { useHomescreenFilterDifficultySharedValue } from "../context/HomescreenFilterDifficultySharedValueProvider"

export default function FilterDifficultyComponent(props){

  const [difficultyData,setDifficultyData] = useState([])  
  const [currrentSelectionString,setCurrrentSelectionString] = useState(null)
  const colorMode = useColorScheme()
  const [selected, setSelected] = useState([])
  const { theme, updateTheme } = useTheme()
  const { sharedValue: filterDifficultySharedValue, setSharedValue: setFilterDifficultySharedValue } = useHomescreenFilterDifficultySharedValue()
  


  let auxArrayOfDifficulties = []
  for (let index = 1; index <= 6; index++) {
    auxArrayOfDifficulties.push({label:`${'★'.repeat(index)}`, value:`${index}`})
  }
  const arrayOfDifficultiesRef = useRef(auxArrayOfDifficulties)

  useEffect(()=>{
    setDifficultyData(arrayOfDifficultiesRef.current)
  },[])

  useEffect(()=>{
    // The following if will be true on the first render and when the user 'pulls to refresh' the screen, here the difficulty will be resetted
    if(filterDifficultySharedValue===null){
      setSelected([])
    }
  },[filterDifficultySharedValue])

  
  /* useEffect(()=>{
    let auxArray = []
    selected.forEach(
      element => {
        auxArray.push('★'.repeat(parseInt(element)))
      }
    )
    setCurrrentSelectionString(auxArray.sort().toString())
  },[selected]) */

  const styles = StyleSheet.create({
      container: {
          //backgroundColor: theme.colors.background,
          //backgroundColor: 'red',
          //marginHorizontal:10
          //padding: 16,
      },
      dropdown: {
        
          backgroundColor: theme.colors.background,
          //backgroundColor: 'red',
          height: props.height?props.height:null,
          //borderColor: 'gray',
          //borderBottomColor: theme.colors.grey3,
          //borderBottomWidth: 1,
          borderColor: colorMode==='dark'?'white':theme.colors.grey0,
          borderWidth: 1,
          borderRadius: 40,
          paddingHorizontal: 10,
          textTransform: "capitalize"
      },
      placeholderStyle: {
          marginLeft:5,
          fontSize: 16,
          color:colorMode==='dark'?'white':'rgba(36, 36, 36,0.55)',
          textTransform: "capitalize"
      },
      selectedTextStyle: {
          fontSize: 16,
          color:colorMode==='dark'?theme.colors.secondary:theme.colors.secondary,
          paddingLeft: 10,
          textTransform: "capitalize"
      },
      categoriesItemTextStyle: {        
        textTransform: "capitalize",
        color:colorMode==='dark'?theme.colors.secondary:theme.colors.secondary,
      },
      iconStyle:{
        width: 20,
        height: 20,
      }
      
  })
  const [isFocus, setIsFocus] = useState(false)
  return (
    <View style={styles.container}>
      <Dropdown
        mode='default'
        style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.categoriesItemTextStyle}
        iconStyle={styles.iconStyle}
        data={difficultyData}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={selected}
        //placeholder={!isFocus ? (selected.length>=1? currrentSelectionString: 'Difficulty') : '...'}
        placeholder={!isFocus? 'Difficulty' : '...'}
        //alwaysRenderSelectedItem={true}
        //visibleSelectedItem={false}
        /* renderLeftIcon={
          ()=>(
            <Icon name='star' type='font-awesome5' color={colorMode==='dark'?'white':theme.colors.grey0}
            />
          )
        } */
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          // Extract the string label from the item object  
          //categoryInputRef.current=item.label          
          console.log("onchange item", item)
          setSelected(item)
          setFilterDifficultySharedValue(parseInt(item.value))
          setIsFocus(false)
        }}
      />
    </View>
  )
}
