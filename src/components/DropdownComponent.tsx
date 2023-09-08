/*
*****************************************
*****************************************
ATTENTION: This file code is based on a template taken from the following URL: https://github.com/hoaphantn7604/react-native-element-dropdown

Changes had been made to match the UI style of the app and sync the category state across the screens
*****************************************
*****************************************
*/
import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, /* Text,*/ View, useColorScheme } from 'react-native'
import { Text, useTheme } from "@rneui/themed"
import { Dropdown } from 'react-native-element-dropdown'
import { firebase } from '../../firebaseConfig'
import { useChallengeDetailsObjectSharedValue } from '../context/ChallengeDetailsObjectProvider'

/* const data = [
  { label: 'Item 1', value: '1' },
  { label: 'Item 2', value: '2' },
  { label: 'Item 3', value: '3' },
  { label: 'Item 4', value: '4' },
  { label: 'Item 5', value: '5' },
  { label: 'Item 6', value: '6' },
  { label: 'Item 7', value: '7' },
  { label: 'Item 8', value: '8' },
] */

export default function DropdownComponent(props){

  const [categoryData,setCategoryData] = useState([])

  const { sharedValue, setSharedValue } = useChallengeDetailsObjectSharedValue()

  const categoryInputRef = useRef(null)

  function successFetching(QuerySnapshot){
    let arrayOfCategories = []
    QuerySnapshot.forEach((doc)=>{
        //console.log("doc category",doc)
        //console.log("category",doc.data().categoryName)
        let sanitizedUid = null;
        try {
          sanitizedUid = doc.data().uid.trim()
        } catch (error) {
          
        }
        arrayOfCategories.push({label:doc.data().categoryName, value:sanitizedUid})
    })
    setCategoryData(arrayOfCategories)
  }
  function errorFetching(){

  }

  const colorMode = useColorScheme()
  const { theme, updateTheme } = useTheme()

  const styles = StyleSheet.create({
      container: {
          //backgroundColor: theme.colors.background,
          //backgroundColor: 'red',
          marginHorizontal:10
          //padding: 16,
      },
      dropdown: {
          backgroundColor: theme.colors.background,
          //backgroundColor: 'red',
          height: props.height?props.height:null,
          //borderColor: 'gray',
          borderBottomColor: theme.colors.grey3,            
          borderBottomWidth: 1,
          //borderRadius: 8,
          paddingHorizontal: 2,
          textTransform: "capitalize"
      },
      placeholderStyle: {
          fontSize: 18,
          color:colorMode==='dark'?theme.colors.grey3:'rgba(36, 36, 36,0.55)',
          textTransform: "capitalize"
      },
      selectedTextStyle: {
          fontSize: 16,
          color:colorMode==='dark'?'white':'black',
          paddingLeft: 10,
          textTransform: "capitalize"
      },
      inputSearchStyle: {
          height: 40,
          fontSize: 16,
          textTransform: "capitalize",
          //color:colorMode==='dark'?theme.colors.grey3:'black',
      },
      categoriesItemTextStyle: {        
        textTransform: "capitalize",        
      },
      
  })
  const [isFocus, setIsFocus] = useState(false)

  useEffect(()=>{
    firebase.firestore().collection('callengesCategories').onSnapshot(successFetching, errorFetching)
  },[])

  const renderLabel = () => {
    //console.log('render label sharedValue.challengeCategory',sharedValue.challengeCategory)
    if (sharedValue.challengeCategorySpecialDropdownItem || isFocus) {
      return (
        <Text style={isFocus && { color: theme.colors.primary }}>
          Category
        </Text>
      );
    }
    return null;
  }  

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        mode='default'
        style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.categoriesItemTextStyle}
        /* iconStyle={styles.iconStyle} */
        data={categoryData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Category' : '...'}
        searchPlaceholder="Search..."
        value={sharedValue.challengeCategorySpecialDropdownItem}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {          
          //console.log("change in dropdown, item",item)
          categoryInputRef.current=item.label          
          setSharedValue({...sharedValue,challengeCategoryLabel:item.label,challengeCategoryUid:item.value,challengeCategorySpecialDropdownItem:item.value})
          setIsFocus(false)
        }}
      />
    </View>
  )
}
