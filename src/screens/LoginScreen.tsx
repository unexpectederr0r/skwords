import { useRef,useState}  from 'react'
import React from 'react'
import {
  SafeAreaView,
  View,  
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  Image,
  Platform
} from 'react-native'

import LoginSVGLightTheme from '../assets/images/misc/logo_light_theme.svg'
import LoginSVGDarkTheme from '../assets/images/misc/logo_dark_theme.svg'

import BackgroundImages from '../assets/images/animated_images_background/BackgroundImages'
import BackgroundVideos from '../assets/videos/background_videos/BackgroundVideos'

import { Input, Text, Button, Icon, useTheme,createTheme,useThemeMode } from '@rneui/themed'

import { Video,ResizeMode } from 'expo-av'
import { BlurView } from 'expo-blur'

import {firebase} from '../../firebaseConfig'
import { getAuth } from "firebase/auth"

let colorMode
export default function LoginScreen ({navigation, route}) {  

  const [loadingStatus, setLoadingStatus] = useState(false)      
  //const [email, setEmail] = useState('')
  const [emailSyntaxIsValid, setEmailSyntaxIsValid] = useState(undefined)
  //const [password, setPassword] = useState('')
  const email = useRef('')
  const password = useRef('')
  const video = React.useRef(null);


  let generatedArrayOfBackgroundImages = []
  let generatedArrayOfBackgroundVideos = []

  Object.keys(BackgroundImages).map((key)=>{
    generatedArrayOfBackgroundImages.push(BackgroundImages[key])
  })
  Object.keys(BackgroundVideos).map((key)=>{
    generatedArrayOfBackgroundVideos.push(BackgroundVideos[key])
  })
  const arrayOfBackgroundImages = generatedArrayOfBackgroundImages
  const arrayOfBackgroundVideos = generatedArrayOfBackgroundVideos  

  const handleLogin = (loginMethod,email: string, password: string) => {    
    //console.log('handleLogin')
    const auth = getAuth()
    switch (loginMethod) {
      case "email":
        if(validateEmail(email)){
          setEmailSyntaxIsValid(true)
          setLoadingStatus(true)
          //console.log("email, password",email, password)
          firebase.auth()
              .signInWithEmailAndPassword(email, password)
              .then(userCredentials => {
                  setLoadingStatus(false)
                  try {route.params.setUserIsLoggedIn(true)} catch (error) {}                
              })
              .catch(
                error => {
                  // https://firebase.google.com/docs/auth/admin/errors
                  if(error.code==="auth/user-not-found"){
                    setLoadingStatus(false)
                    navigation.push('Register',{email: email, password: password})
                  }
                  else if(error.code==="auth/invalid-email"){
                    setLoadingStatus(false)
                    alert(error.code)
                  }                        
                  else{
                    setLoadingStatus(false)
                    alert(error.code)
                  }
                }
                  
                  
              )
        }else{
          setEmailSyntaxIsValid(false)
        }
        break
      default:
        break
    }    
  }
  const handleRegisterWithEmail = (email:string, password:string) => {                
    if(email.trim()==''){
      navigation.push('Register',{email: email, password: password})
    }else{
      if(validateEmail(email)){
        setEmailSyntaxIsValid(true)
        navigation.push('Register',{email: email, password: password})        
      }else{
        setEmailSyntaxIsValid(false)
      }
    }   
  }    

  const { theme, updateTheme } = useTheme()
  colorMode = useColorScheme()
  const videoSource = useRef(arrayOfBackgroundVideos[Math.floor(Math.random() * arrayOfBackgroundVideos.length)])  
  const imageSource = useRef(arrayOfBackgroundImages[Math.floor(Math.random() * arrayOfBackgroundImages.length)])

  const validateEmail = (text) => {
    //console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/
    if (reg.test(text) === false) {
      //console.log("Email is Not Correct")
      //setEmail(text)
      return false;
    }
    return true
  }
  
  //console.log("theme.colors.background",theme.colors.background+'50')
  const styles = /* StyleSheet.create( */{    
    backgroundVideoContainer:{
      view:{
        justifyContent:'center',
        minHeight:'100%',
        maxHeight:'100%',
      },
      video:{
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
      }
    },
    logoSectionContainer:{
      view:{
        flex:1,        
        alignItems: 'center', 
        marginVertical:'9%',         
        //backgroundColor:'green'
        overflow:'visible',
      },
      logoSVG:{
        height:150,
        width:150,
      },
      logoSubtitleView:{        
        display:'flex',
        alignItems: 'center',
        overflow:'visible',
        //height:'100%',
        width:'100%',
        //minWidth:'1500',
        //backgroundColor:'green',
      },
      logoSubtitleText:{
        overflow:'visible',
        //backgroundColor:'green',
        marginTop:0,
        paddingVertical:5,
        //paddingHorizontal:20,
        //marginHorizontal:20,        
        fontFamily: 'Mokoto',
        fontSize: 36,
        //fontWeight: '500',
        color: theme.colors.logoSubtitle,
        //marginBottom: 30,
        //text-shadow: h-shadow v-shadow blur-radius color|none|initial|inherit;
        //textShadow: `1 1 3 ${theme.colors.logoSubtitleShadow}`,
        textShadowColor: theme.colors.logoSubtitleShadow,
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 15
      }
    },
    nonLogoSection:{
      containerView:{
        flex:2,
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
        },
        titleText:{
          fontFamily: 'Roboto-Medium',
          fontSize: 26,
          fontWeight: '500',
          marginBottom: 10,
        },
        input:{
          fontSize:16,
          marginLeft:'2%',          
        },
        inputInnerIcon:{
          size:16,
          type: 'material-icons',           
          color: theme.colors.secondary,
        },
        loginButton:{
          marginTop:'5%',
          paddingHorizontal: '3%',
        },
        registerTouchableOpacity:{
          marginTop:'5%',
          display:'flex',
          //alignContent:'center',
          alignItems:'center',
          //backgroundColor:'red'
        },
        registerText:{          
          color: theme.colors.primary,
          fontWeight:'bold',
          fontSize: 15,
          /* textShadowColor: theme.colors.secondary,
          textShadowOffset: {width: -1, height: 1},
          textShadowRadius: 20 */
        }
      },
      socialMediaSection:{
        containerView:{
          //flex:1,
          //alignSelf:'flex-start',
          flexDirection: 'row',          
          justifyContent: 'space-between',
          //marginBottom: 30,
          //backgroundColor:'blue',
          marginTop:'15%'
        },
        buttonTouchableOpacity:{
          //alignSelf: 'flex-start',
          borderColor: theme.colors.greyOutline,
          borderWidth: 2,
          borderRadius: 10,
          paddingHorizontal: 30,
          paddingVertical: 10,
        },
        buttonSVG:{
          height:24,
          width:24,
        }
      }
    },
  }
  return (
    <SafeAreaView style={{minHeight:'100%'}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>        
        <View id='background-gif-container' style={styles.backgroundVideoContainer.view}>
          {colorMode==='dark'?
            <Video ref={video} rate={1} style={styles.backgroundVideoContainer.video} source={videoSource.current} shouldPlay={true} resizeMode={ResizeMode.COVER} isLooping/>
            :            
            <Image style={{width: "100%", height: "100%", position:'absolute',objectFit:'cover',transform: [{ scaleY: 1 }]}} source={imageSource.current} />
          }
          
          <BlurView intensity={colorMode==='dark'?20:(Platform.OS==='ios'?80:2)}>
            <View id='main-screen-container' style={[styles.mainScreenContainer.view, colorMode==='dark'?{backgroundColor:theme.colors.background+'70'}:{backgroundColor:theme.colors.background+'99'}]}>
              <View id='logo-section-container' style={styles.logoSectionContainer.view}>            
                {
                  /* Even though the SVG color can be modified with the stylesheet, the library that provides support for this SVG loading in react native by default darkens (a little) the color provided via the stylesheet so two different SVG files are used that contain the correct coloring*/
                  colorMode==='dark'?<LoginSVGDarkTheme style={styles.logoSectionContainer.logoSVG}/>:<LoginSVGLightTheme style={styles.logoSectionContainer.logoSVG}/>
                }           
                <View id='logo-section-subtitle-container' style={styles.logoSectionContainer.logoSubtitleView}>
                  <Text style={styles.logoSectionContainer.logoSubtitleText}>
                    Words
                  </Text>
                </View>
              </View>
              
              
              <View id='non-logo-section-container' style={styles.nonLogoSection.containerView}>
                <View id='non-logo-section-input-section' style={styles.nonLogoSection.inputSection.containerView}>
                  <Input
                    placeholder="Email"
                    placeholderTextColor={colorMode==='dark'?'white':'black'}
                    leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'alternate-email'}}
                    style={styles.nonLogoSection.inputSection.input}
                    //color="#666"
                    inputMode='email'
                    autoComplete='email'
                    allowFontScaling
                    containerStyle={{}}
                    //value={email}
                    onChangeText={value => (email.current=value)}                
                    errorMessage={emailSyntaxIsValid===false?'Enter a valid email address':''}
                  />
                  <Input
                    placeholder="Password"
                    placeholderTextColor={colorMode==='dark'?'white':'black'}
                    leftIcon={{...styles.nonLogoSection.inputSection.inputInnerIcon,name: 'lock'}}
                    autoComplete='current-password'
                    style={styles.nonLogoSection.inputSection.input}
                    secureTextEntry={true}
                    onChangeText={value =>(password.current=value)}
                  />
                  <Button titleStyle={{color:'black'}} color={'secondary'} style={styles.nonLogoSection.inputSection.loginButton} loading={loadingStatus} onPress={()=>handleLogin("email",email.current,password.current)}>Login</Button>         

                  <TouchableOpacity style={styles.nonLogoSection.inputSection.registerTouchableOpacity} onPress={()=>handleRegisterWithEmail(email.current,password.current)}>                    
                      <Text style={styles.nonLogoSection.inputSection.registerText}>Register with your email</Text>
                    
                  </TouchableOpacity>                  

                </View>
              </View>
            </View>
          </BlurView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};