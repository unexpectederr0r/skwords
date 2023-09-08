import { useEffect,useState,useMemo, SyntheticEvent, useRef, forwardRef}  from 'react';
import React from 'react'
import {
  SafeAreaView,
  View,    
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,  
  Image,
  Platform,
} from 'react-native';

import LoginSVGLightTheme from '../assets/images/misc/logo_light_theme.svg';
import LoginSVGDarkTheme from '../assets/images/misc/logo_dark_theme.svg'

import { Input, Text, Button, useTheme } from '@rneui/themed';

import BackgroundImages from '../assets/images/animated_images_background/BackgroundImages';
import BackgroundVideos from '../assets/videos/background_videos/BackgroundVideos';

import { Video,ResizeMode } from 'expo-av'
import { BlurView } from 'expo-blur';

import DateTimePicker from '@react-native-community/datetimepicker';

import {firebase} from '../../firebaseConfig'

import checkIfDocumentIdExistsInCollection from '../components/utils/firebaseUtils/checkIfDocumentIdExistsInCollection';

let colorMode;
//==========================================
  let generatedArrayOfBackgroundImages = [];
  let generatedArrayOfBackgroundVideos = [];
  Object.keys(BackgroundImages).map((key)=>{
    generatedArrayOfBackgroundImages.push(BackgroundImages[key])
  })
  Object.keys(BackgroundVideos).map((key)=>{
    generatedArrayOfBackgroundVideos.push(BackgroundVideos[key])
  })
  const arrayOfBackgroundImages = generatedArrayOfBackgroundImages;
  console.log("arrayOfBackgroundImages",arrayOfBackgroundImages)
  const arrayOfBackgroundVideos = generatedArrayOfBackgroundVideos;  

  
//=========================================  
export default function RegisterScreen ({navigation, route}) {

  /* console.log("RegisterScreen navigation", navigation)
  console.log("RegisterScreen route", route) */

  useEffect(()=>{
    if(Platform.OS==='android'){
      nameInputRef.current.focus()
    }
  },[])

  const [loadingStatus, setLoadingStatus] = React.useState(false)      
  
  let currentUTCDate = new Date(new Date().toUTCString())
  let eighteenYearsAgoDate = currentUTCDate
  eighteenYearsAgoDate.setFullYear(eighteenYearsAgoDate.getFullYear()-18)
  
  let name = useRef('')
  let nickname = useRef('')
  let birthday = useRef(eighteenYearsAgoDate)

  let email=useRef(route.params.email!=''?route.params.email:'')
  let password=useRef(route.params.password!=''?route.params.password:'')
  let repeatedPassword = useRef('')

  const [nameSyntaxIsValid, setNameSyntaxIsValid] = useState(true)
  const [nicknameSyntaxIsValid, setNicknameSyntaxIsValid] = useState(true)
  const [nicknameSyntaxErrorMessage, setNicknameSyntaxErrorMessage] = useState("")
  const [emailSyntaxIsValid, setEmailSyntaxIsValid] = useState(true)
  const [birthdayIsValid, setbirthdayIsValid] = useState(true)
  const [passwordSyntaxIsValid, setPasswordSyntaxIsValid] = useState(true)
  const [passwordSyntaxErrorMessage, setPasswordSyntaxErrorMessage] = useState("")
  const [passwordsNotMatching, setPasswordNotMatching] = useState(false)
  const [androidShowBirthDatePicker, setAndroidShowBirthDatePicker] = useState(false)

  const { theme, updateTheme } = useTheme()
  colorMode = useColorScheme();

  const video = React.useRef(null);
  const nameInputRef = React.useRef(null);
  const nicknameInputRef = React.useRef(null);
  const countryInputRef = React.useRef(null);

  // The RNE UI library automatically forwards React Refs its Input child components. See https://github.com/react-native-datetimepicker/datetimepicker/issues/372
  const iosInputBirthDatePicker = forwardRef(function iosInputBirthDatePicker(props,iosBirthdayInputRef){
    return(
      <DateTimePicker 
      style={{left:-16, fontSize:16}} 
      maximumDate={eighteenYearsAgoDate} 
      value={birthday.current} 
      onChange={iosHandleBirthdayInputChange}        
      ></DateTimePicker>
    )    
  })

  function AndroidInputBirthDatePicker (props){    
   return(    
        androidShowBirthDatePicker?
          <DateTimePicker 
          style={{left:-16, fontSize:16}} 
          maximumDate={eighteenYearsAgoDate} 
          value={birthday.current}
          onChange={androidHandleBirthdayInputChange}
          ></DateTimePicker>
      :null
    )
  }
  function handleSetName(e){
    name.current = e.nativeEvent.text
  }
  function handleSetNickname(e){
    nickname.current = e.nativeEvent.text
  }
  function handleSetEmail(e){
    email.current = e.nativeEvent.text
  }
  function handleSetRepeatedPassword(e){
    repeatedPassword.current = e.nativeEvent.text
  }
  function handleSetPassword(e){
    password.current = e.nativeEvent.text
  }
    
  const androidHandleBirthdayInputChange = (event: DateTimePickerEvent, date: Date) => {      
    if (event.type === 'dismissed') {       
      setAndroidShowBirthDatePicker(false)
      Keyboard.dismiss()
    }
    else if (event.type === 'set') {
      //console.log("android date selected", date)
      birthday.current = date
      setAndroidShowBirthDatePicker(false)
      Keyboard.dismiss()
    }
  }

  const iosHandleBirthdayInputChange = (event: DateTimePickerEvent, date: Date)=>{
    /* console.log("ios date change triggered event type",event.type)
    console.log("ios date selected",date)
    console.log("ios date selected",event.nativeEvent) */
    if (event.type === 'set') {
      birthday.current = date
    }
    
  }
  
  const handleRegister = (name:string,nickname:string,birthday:Date,email:string,password:string,repeatedPassword:string) => {    

    //force nickname to be in lowercase to avoid impersonation
    nickname = nickname.toLowerCase()

    let allValuesAreValid = validateEmail(email) && validateName(name) && validateNickname(nickname) && validateOlderThan18(birthday) && validatePasswords(password,repeatedPassword)
    if(allValuesAreValid){
      setLoadingStatus(true)
      checkIfDocumentIdExistsInCollection('unique_nicknames_in_use',nickname).then(nicknameIsInUse => {
        // check if the nickname is in use by another user        
        if(nicknameIsInUse==false){
          firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(userCredentials => {                              
                firebase.firestore().collection('users').doc(String(userCredentials.user.uid)).set({                    
                    uid:userCredentials.user.uid,
                    skPoints:0,
                    postsIndexCollectionUids:[],
                    likedChallengesIndexUids:[],
                    dislikedChallengesIndexUids:[],
                    name: name,
                    nickname: nickname,
                    birthday: birthday,
                    email:email,
                    accCreationDate:new Date(new Date().toUTCString())
                }).then((any)=>{
                  //route.params.setUserIsLoggedIn(true)                  
                  firebase.firestore().collection('unique_nicknames_in_use').doc(String(nickname)).set({userUid:userCredentials.user.uid,}).then((any)=>{})                  
                }).catch((error)=>{                    
                    if(error.code==="auth/email-already-in-use"){
                      alert("The email is already registered in the system")
                    }else{
                      alert(error)
                    }
                }).finally(()=>{
                    setLoadingStatus(false)
                })          
            })
            .catch(error => {
                setLoadingStatus(false);
                if(error.code==='auth/weak-password'){
                    console.log('weak pass detected')
                    alert(error.message)
                }else{
                  alert(error.message)
                }
                alert(error.message)
            })
        }else{
          setLoadingStatus(false)
          setNicknameSyntaxIsValid(false)
          setNicknameSyntaxErrorMessage("Nickname already in use, choose another one")
          return
        }
      }).catch(error => {
        
      })    
    }
  }
  const validateOlderThan18 = (birthday: Date)=>{
    console.log("validating older 18 date", birthday)
    try {
      if(!isNaN(birthday.getTime())){
        if(birthday<=eighteenYearsAgoDate){
          !birthdayIsValid?setbirthdayIsValid(true):null
          return true
        }else{
          setbirthdayIsValid(false)
          false          
        }        
      }else{
        setbirthdayIsValid(false)
        return false
      }
    } catch (error) {
      setbirthdayIsValid(false)
      return false
    }
  }
  const validateEmail = (text) => {    
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      setEmailSyntaxIsValid(false)
      return false;
    }
    !emailSyntaxIsValid?setEmailSyntaxIsValid(true):null
    return true
  }
  const validateName = (text) => {    
    let reg = /^[a-zA-Z'\- ]{1,50}$/
    if (reg.test(text) === false) {
      setNameSyntaxIsValid(false)
      return false;
    }
    !nameSyntaxIsValid?setNameSyntaxIsValid(true):null
    return true
  }

  const validateNickname = (text) => {    
    // For nicknames only allow characters, numbers, dashes and underscores
    let reg = /^[A-Za-z0-9\-\_]+$/    
    if(text.length<6){
      setNicknameSyntaxIsValid(false)
      setNicknameSyntaxErrorMessage("Nickname must be at least 6 characters long")
      return false
    }
    if (reg.test(text) === false) {
      setNicknameSyntaxIsValid(false)
      setNicknameSyntaxErrorMessage("Nickname invalid. Use only letters, numbers, dashes and underscores")        
      return false
    }    
    !nicknameSyntaxIsValid?setNicknameSyntaxIsValid(true):null
    return true
  }

  
  const validatePasswords = (password,repeatedPassword) => {        
    if(password.length<6){
      setPasswordSyntaxIsValid(false)
      setPasswordSyntaxErrorMessage("Password length must be at least 6 characters long")
      return false
    }else{
      !passwordSyntaxIsValid?setPasswordSyntaxIsValid(true):null      
    }
    if(password!=repeatedPassword){
      setPasswordNotMatching(true)
      return false
    }
    !passwordSyntaxIsValid?setPasswordSyntaxIsValid(true):null
    !passwordsNotMatching?setPasswordNotMatching(false):null
    return true
  }
  const styles = /* StyleSheet.create( */{    
    backgroundVideoContainer:{
      view:{
        backgroundColor:theme.colors.background,
        justifyContent:'center',
        minHeight:'100%',
        maxHeight:'100%',
      },
      video:{
        backgroundColor:theme.colors.background,
        position:'absolute',
        alignSelf: 'center',
        width: '100%',
        height: '100%',        
      }
    },
    mainScreenContainer:{
      view:{        
        paddingHorizontal: 25, 
        display:'flex',
        // horizontal
        //alignItems:'center',
        // horizontal alignment
        justifyContent:'center',
        minHeight:'100%',
        maxHeight:'100%',
        backgroundColor:theme.colors.background
      }
    },
    logoSectionContainer:{
      view:{
        flex:1,        
        alignItems: 'center', 
        marginVertical:'9%', 
        //backgroundColor:'green'
      },
      logoSVG:{
        height:150,
        width:150,
      },
      logoSubtitleText:{
        //backgroundColor:'green',
        marginTop:0,
        paddingVertical:5,
        //paddingHorizontal:20,
        fontFamily: 'Mokoto',
        fontSize: 36,
        //fontWeight: '500',
        color: theme.colors.logoSubtitle,
        //marginBottom: 30,
        textShadowColor: theme.colors.logoSubtitleShadow,
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 15
      }
    },
    nonLogoSection:{
      containerView:{
        flex:3.5,
        //display:'flex', 
        //justifySelf: 'flex-start',
        //alignContent:'space-between',
        //backgroundColor:'red'
      },
      inputSection:{
        containerView:{
          //flex:2,
          //display:'flex', 
          //alignContent:'space-between'
          marginTop:'5%'
        },
        inputSetWrapperView:{
            //display:'flex',
            marginTop:'3%'
        },
        titleText:{
          fontFamily: 'Roboto-Medium',
          fontSize: 22,
          fontWeight: '500',
          marginTop:'5%'
          //marginBottom: 30,
        },
        input:{
          fontSize:16,          
          marginLeft:'2%',
          //color: theme.colors.secondary,
        },
        inputBirthDate:{
          fontSize:16,                  
          marginHorizontal:0,
          marginLeft:'2%',
          //color: theme.colors.secondary,
        },
        inputIcon:{
          size:16,
          type: 'material-icons',
          //color: theme.colors.secondary,
        },
        containerStyleInput:{
            //margin:0,
            //padding:0,
            paddingVertical:0,
            marginVertical:0,
            //backgroundColor:'red',
            //flex:1,
        },
        containerStyleCountryInput:{
          //margin:0,
          //padding:0,
          paddingVertical:0,
          marginVertical:0,
          width:'100%',
          height:'100%'
          //backgroundColor:'red',
          //flex:1,
        },
        inputInnerIcon:{
          size:16,
          type: 'material-icons',           
          //color:colorMode==='dark'?'white':theme.colors.grey1,
          color: theme.colors.secondary,
        },
        button:{
          marginTop:'8%',
          paddingHorizontal: '3%',      
        },
      },      
    },
  }/* ) */;

  const videoSource = useRef(arrayOfBackgroundVideos[Math.floor(Math.random() * arrayOfBackgroundVideos.length)])
  const imageSource = useRef(arrayOfBackgroundImages[Math.floor(Math.random() * arrayOfBackgroundImages.length)])

  const iosBirthdayInputRef = useRef(null)

  return (
    <SafeAreaView style={{minHeight:'100%'}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> 
          <View id='background-gif-container' style={styles.backgroundVideoContainer.view}>          
          {colorMode==='dark'&&Platform.OS==='ios'?
            <Video ref={video} rate={1} style={styles.backgroundVideoContainer.video} source={videoSource.current} shouldPlay={true} resizeMode={ResizeMode.COVER} isLooping/>
            :
            <Image style={{width: "100%", height: "100%", position:'absolute',objectFit:'cover',transform: [{ scaleY: 1 }]}} source={imageSource.current} />
          }
            <BlurView intensity={colorMode==='dark'?20:(Platform.OS==='ios'?80:2)}>       
              <View id='main-screen-container' style={[styles.mainScreenContainer.view, colorMode==='dark'?{backgroundColor:theme.colors.background+'70'}:{backgroundColor:theme.colors.background+'99'}]}>
                <View id='logo-section-container' style={styles.logoSectionContainer.view}>            
                  {/* Even though the SVG color can be modified with the stylesheet, the library that provides support for this SVG loading in react native by default darkens (a little) the color provided via the stylesheet so two different SVG files are used that contain the correct coloring*/
                  colorMode==='dark'?<LoginSVGDarkTheme style={styles.logoSectionContainer.logoSVG}/>:<LoginSVGLightTheme style={styles.logoSectionContainer.logoSVG}/>}            
                  <Text style={styles.logoSectionContainer.logoSubtitleText}>
                    Words
                  </Text>
                </View>
                <View id='non-logo-section-container' style={styles.nonLogoSection.containerView}>            
                  <View id='non-logo-section-input-section' style={styles.nonLogoSection.inputSection.containerView}>
                    <Text
                      style={styles.nonLogoSection.inputSection.titleText}>
                      Register
                    </Text>            
                    <View id='non-logo-section-input-section-input-ser-wrapper' style={styles.nonLogoSection.inputSection.inputSetWrapperView}>
                      <Input
                          ref={nameInputRef}
                          /* key={nameInputRef}
                          id={nameInputRef} */
                          placeholder="Name"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'person'}}
                          style={styles.nonLogoSection.inputSection.input}
                          //color="#666"
                          inputMode='text'
                          autoComplete='name'
                          allowFontScaling                
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          //value={name}                    
                          //onChangeText={value => setName(value)}                          
                          onChange={(e) => handleSetName(e)}
                          errorMessage={nameSyntaxIsValid?null:'Enter a valid name'}
                          renderErrorMessage={false}
                      />
                      <Input
                          ref={nicknameInputRef}
                          //key={nameInputRef}
                          //id={nameInputRef}
                          placeholder="Enter a nickname"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'badge'}}
                          style={styles.nonLogoSection.inputSection.input}
                          //color="#666"
                          inputMode='text'
                          autoComplete='given-name'
                          allowFontScaling        
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          //value={name}                    
                          //onChangeText={value => setName(value)}
                          onChange={(e) => handleSetNickname(e)}
                          errorMessage={nicknameSyntaxIsValid?null:nicknameSyntaxErrorMessage}
                          renderErrorMessage={false}
                      />
                      {
                        // The following if statement is required due to a limitation in the datetimepicker library.
                        // By default, Android will show the date picker modal, see https://github.com/react-native-datetimepicker/datetimepicker/issues/600
                      }
                      {Platform.OS==='ios'?
                        <Input
                          ref={iosBirthdayInputRef}
                          placeholder="Birthday"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'cake'}}
                          style={styles.nonLogoSection.inputSection.inputBirthDate}
                          //color="#666"
                          inputMode='text'
                          InputComponent={iosInputBirthDatePicker}
                          onBlur={()=>iosBirthdayInputRef.current.blur()}
                          autoComplete='birthdate-full'
                          allowFontScaling                
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          //Value prop is omitted since it is already rendered by iosInputBirthDatePicker component
                          errorMessage={birthdayIsValid?null:'You must be at least 18 years old'}
                          renderErrorMessage={false}
                        />:
                        <Input
                          placeholder="Birthday"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'cake'}}
                          style={styles.nonLogoSection.inputSection.inputBirthDate}                          
                          inputMode='text'
                          onPressIn={()=>{setAndroidShowBirthDatePicker(true)}}
                          autoComplete='birthdate-full'
                          allowFontScaling                
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}                          
                          value={birthday.current.toLocaleDateString()}
                          errorMessage={birthdayIsValid?null:'You must be at least 18 years old'}
                          renderErrorMessage={false}
                        />
                      }                     
                      <Input
                          /* ref={emailInputRef} */
                          placeholder="Email"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'alternate-email'}}
                          style={styles.nonLogoSection.inputSection.input}
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          //color="#666"
                          inputMode='email'
                          autoComplete='email'
                          allowFontScaling
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          //value={email.current}
                          //onChangeText={value => setEmail(value)}              
                          onChange={(e) => handleSetEmail(e)}
                          errorMessage={emailSyntaxIsValid?null:'Enter a valid email address'}
                          renderErrorMessage={false}
                      />
                      <Input
                          /* ref={passwordInputRef} */
                          placeholder="Password"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'lock'}}
                          autoComplete='current-password'
                          style={styles.nonLogoSection.inputSection.input}
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          secureTextEntry={true}
                          //value={password.current}
                          //onChangeText={value => setPassword(value)}
                          onChange={(e) => handleSetPassword(e)}
                          errorMessage={passwordSyntaxIsValid?null:passwordSyntaxErrorMessage}
                          renderErrorMessage={false}
                                      //color="#666"
                          /* onChangeText={value => this.setState({ comment: value })} */
                      />
                      <Input
                          /* ref={repeatedPasswordInputRef} */
                          placeholder="Confirm your password"
                          placeholderTextColor={colorMode==='dark'?'white':'black'}
                          leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'lock'}}
                          autoComplete='current-password'
                          style={styles.nonLogoSection.inputSection.input}
                          containerStyle={styles.nonLogoSection.inputSection.containerStyleInput}
                          secureTextEntry={true}
                          //value={repeatedPassword}
                          onChange={(e) => handleSetRepeatedPassword(e)}
                          //onChangeText={(text) => handleSetRepeatedPassword(text)}
                          errorMessage={passwordsNotMatching?"Passwords don't match":null}
                          renderErrorMessage={false}
                      />                
                    </View>
                    {Platform.OS==='android'?
                      <AndroidInputBirthDatePicker/>:null
                    }
                    <Button titleStyle={{color:'black'}} color={'secondary'} buttonStyle={styles.nonLogoSection.inputSection.button} loading={loadingStatus} onPress={()=>handleRegister(name.current,nickname.current,birthday.current,email.current,password.current,repeatedPassword.current)}>Register</Button>
                  </View>
                </View>
              </View>
            </BlurView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};