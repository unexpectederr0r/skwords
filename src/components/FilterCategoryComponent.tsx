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
import { Dropdown } from 'react-native-element-dropdown'
import { firebase } from '../../firebaseConfig'
import { useHomescreenFilterCategorySharedValue } from "../context/HomescreenFilterCategorySharedValueProvider"

export default function FilterCategoryComponent(props){

  const [categoryData,setCategoryData] = useState([])  
  const colorMode = useColorScheme()
  const { theme, updateTheme } = useTheme()
  const { sharedValue: filterCategorySharedValue, setSharedValue: setFilterCategorySharedValue } = useHomescreenFilterCategorySharedValue()

  const arrayOfCategoriesRef = useRef([])

  function successFetching(QuerySnapshot){
    QuerySnapshot.forEach((doc)=>{
        //console.log("doc category",doc)
        //console.log("category",doc.data().categoryName)
        let sanitizedUid = null;
        try {
          sanitizedUid = doc.data().uid.trim()
          arrayOfCategoriesRef.current.push({label:doc.data().categoryName, value:sanitizedUid})
        } catch (error) {
          Alert.alert('Warning','An error has occurred while fetching the available categories, the category filter may not work.',[{text:'OK',style:'default'}])
        }
    })
    setCategoryData([...arrayOfCategoriesRef.current])
  }
  function errorFetching(){

  }

  useEffect(()=>{
    // The following if will be true on the first render and when the user 'pulls to refresh' the screen, here the category will be resetted
    if(('challengeCategoryLabel' in filterCategorySharedValue)==false){
      setCategoryData([...arrayOfCategoriesRef.current])
    }
  },[filterCategorySharedValue])

  

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
      inputSearchStyle: {
          //height: 40,
          fontSize: 16,
          textTransform: "capitalize",
          color:colorMode==='dark'?theme.colors.grey3:theme.colors.grey0,
      },
      categoriesItemTextStyle: {        
        textTransform: "capitalize",        
      },
      iconStyle:{
        width: 20,
        height: 20,
      }
      
  })
  const [isFocus, setIsFocus] = useState(false)

  useEffect(()=>{
    firebase.firestore().collection('callengesCategories').onSnapshot(successFetching, errorFetching)
  },[])

  return (
    <View style={styles.container}>
      <Dropdown
        mode='default'
        style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.categoriesItemTextStyle}
        iconStyle={styles.iconStyle}
        data={categoryData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={'hey'}
        placeholder={!isFocus ? 'Category' : '...'}
        searchPlaceholder="Search..."
        renderLeftIcon={
          ()=>(
            <Icon name='filter' type='ionicon' color={colorMode==='dark'?'white':theme.colors.grey0}
            />
          )
        }
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          // Extract the string label from the item object 
          //categoryInputRef.current=item.label          
          console.log("onchange item", item)
          setFilterCategorySharedValue({challengeCategoryLabel:item.label,challengeCategoryUid:item.value})
          //setSharedValue({...sharedValue,challengeCategoryLabel:item.label,challengeCategoryUid:item.value,challengeCategorySpecialDropdownItem:item.value})
          setIsFocus(false)
        }}
      />
    </View>
  )
}
