// uses global state? what if it updates
// update global state?
import { Alert, View, useColorScheme, StyleSheet, ActivityIndicator } from "react-native"
import { Text, useTheme, Button, Input, AirbnbRating, Icon } from "@rneui/themed"
import { firebase } from '../../firebaseConfig'
import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { Dimensions } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { fetchUserDataDocument } from "../components/utils/firebaseUtils/fetchUserDataDocument"
import { UserDocumentInterface } from "../components/utils/firebaseUtils/types/firebaseDocumentInterfaces"
import { Image } from '@rneui/base'
import Images from '../assets/images/exports'
// Line taken from: https://stackoverflow.com/questions/29290460/use-image-with-a-local-file
const DEFAULT_IMAGE = Image.resolveAssetSource(Images.defaultProfileAvatar).uri

export default function UserProfileScreen(props){
    const retrievedUserDataRef = useRef<UserDocumentInterface | null>(null)
    const retrievedUserDataArray = useRef<Array<Object>>([])
    const [isLoading, setIsLoading] =useState<boolean>(true)
    const [statefulUserName, setStatefulUserName] =useState<string>("")
    const [statefulUserNickname, setStatefulUserNickname] =useState<string>("")    
    const { theme, updateTheme } = useTheme()
    const colorMode = useColorScheme()
    const styles = StyleSheet.create({
        mainContainerView:{
            width:'100%',
            height:'100%',
            display:'flex',
            backgroundColor:'white',
            //alignItems:'center',
            //alignContent:'center',
            //justifyContent:'space-between'
        },
        profileAvatarContainerView:{
            alignSelf:'center',
            flex:1,
            display:'flex'
        },
        userDataTextBorderView:{
            flex:4,
            display:'flex',
            backgroundColor: theme.colors.primary,
            //marginHorizontal:'2%',
            borderTopLeftRadius:40,
            borderTopRightRadius:40,
        },
        userDataTextContainerView:{
            flex:1,
            //minWidth:'100%',
            display:'flex',
            backgroundColor: colorMode==='dark'?'black':'white',
            marginTop:'5%',
            marginBottom:'5%',
            marginHorizontal:'5%',
            /* borderTopLeftRadius:40,
            borderTopRightRadius:40, */
            borderRadius:40,
            paddingHorizontal:'2%',
            overflow:'hidden'
        },
        userImageContainer:{
            marginVertical:'3%',
            height: 100, 
            width: 100, 
            borderRadius: 40,               
        },
        userImage:{        
            flex:1,
            borderRadius: 40,
        },
    })
    useEffect(()=>{
        const currentUser = firebase.auth().currentUser
        if (currentUser) {
            fetchUserDataDocument(currentUser.uid).then((userDataDocument)=>{
                    retrievedUserDataRef.current = userDataDocument.data()
                    // Ignore the user data that is not displayed and give an UI order to the user data
                    retrievedUserDataArray.current[0] = {name:retrievedUserDataRef.current['name']}
                    retrievedUserDataArray.current[1] = {nickname:retrievedUserDataRef.current['nickname']}
                    retrievedUserDataArray.current[2] = {skPoints:retrievedUserDataRef.current['skPoints']}
                    retrievedUserDataArray.current[3] = {email:retrievedUserDataRef.current['email']}
                    retrievedUserDataArray.current[4] = {birthday:retrievedUserDataRef.current['birthday']}
                    retrievedUserDataArray.current[5] = {accCreationDate:retrievedUserDataRef.current['accCreationDate']}
                    setIsLoading(false)
                }
            ).catch(()=>{Alert.alert('Error', 'There was an error retrieving your user data', [{text: 'OK', style: 'default'}])})
        } else {
            Alert.alert('Error', 'There was an error while reading your login token', [{text: 'OK', style: 'default'}])
        }
    },[statefulUserName,statefulUserNickname])
    
    return (
        isLoading?
        <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
        :    
        <View style={styles.mainContainerView}>
            <View style={styles.profileAvatarContainerView}>
                <Image source={{uri:DEFAULT_IMAGE}} style={styles.userImage} containerStyle={styles.userImageContainer}/>
            </View>
            <View style={styles.userDataTextBorderView}>
                <View style={styles.userDataTextContainerView}>
                    {retrievedUserDataArray.current.map((object, index) => {
                            // The input component expects a string as a value to render, some of the values like the account creation date and the user birthday are in Date type formats so they need to be parsed first
                            let parsedInputValue = null
                            // The object keys string values styles are not meant to be shown to the user so here are transformed
                            let title = null
                            // Depending on each value, a different icon will be shown
                            let iconName = null 
                            let iconType = null
                            let iconColor = theme.colors.secondary
                            switch (Object.keys(object)[0]) {
                                case "accCreationDate":
                                    title = "Account creation date"                                        
                                    iconName="creation"
                                    iconType="material-community"
                                    try {
                                        parsedInputValue = object['accCreationDate'].toDate().toDateString()    
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                case "birthday":
                                    title = "Birthday"
                                    iconName = 'birthday-cake'
                                    iconType = 'font-awesome-5'                                        
                                    try {
                                        parsedInputValue = object['birthday'].toDate().toDateString()    
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                case "email":
                                    title = "Email"
                                    iconName = 'email'
                                    iconType = 'material'
                                    try {
                                        parsedInputValue = object['email']
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                case "name":
                                    title = "Name"
                                    iconName = 'drive-file-rename-outline'
                                    iconType = 'material'
                                    try {
                                        parsedInputValue = object['name']
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                case "nickname":
                                    title = "Nickname"
                                    iconName = 'user-ninja'
                                    iconType = 'font-awesome-5'
                                    try {
                                        parsedInputValue = object['nickname']
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                case "skPoints":
                                    title = "SK Points"
                                    iconName = 'coins'
                                    iconType = 'font-awesome-5'
                                    try {
                                        parsedInputValue = object['skPoints'].toString()
                                    } catch (error) {
                                        parsedInputValue = null
                                    }
                                    break
                                default:
                                    break
                            }
                            if(title!=null){
                                // Define common props for both the disabled input component and the enabled input component
                                const commonInputProps = {
                                    renderErrorMessage:false,
                                    containerStyle:{flex:6},
                                    inputStyle:{fontSize:16, color:colorMode==='dark'?'white':'black',},
                                    label:false,
                                    value: parsedInputValue
                                    
                                }
                                return(
                                    <View key={index} style={{flex:1, display:'flex', flexDirection:'row', alignItems:'center'}}>                                            
                                        <Icon name={iconName} type={iconType} color={iconColor} containerStyle={{flex:1, alignSelf:'center'}}/>
                                        <Input {...commonInputProps} disabled={true} />                                            
                                    </View>
                                )
                            }
                        })}
                </View>
            </View>
        </View>
    )
}