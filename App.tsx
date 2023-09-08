import 'react-native-gesture-handler';
// https://docs.expo.dev/versions/latest/sdk/safe-area-context/
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert} from 'react-native';

/*

import { Button, Text, Header, Icon, Card} from '@rneui/themed';*/

// The warning shown by react-navigation does not affect this App since it does not use deep linking, it is safe to ignore it
// https://reactnavigation.org/docs/troubleshooting/
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

import { useState,useEffect,useCallback, useRef } from 'react'; 
import { createTheme,useTheme,useThemeMode,ThemeProvider,Text } from '@rneui/themed'

import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'

//import * as ScreenOrientation from 'expo-screen-orientation'
//ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_DOWN)

//import Homescreen from './src/screens/Homescreen';
import MainNavigator from './src/navigation/MainNavigator';
import PlayScreen from './src/screens/Playscreen';

import { StyleSheet,useColorScheme, Platform, View, Appearance} from 'react-native'
import { Header as MyCustomHeader, CustomStatusBar,CustomDrawerContent } from './src/components/index'

import AuthStack from './src/navigation/AuthStack';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

import {firebase} from './firebaseConfig'

//import {format as prettyFormat} from 'pretty-format';

//global, is inherited by all children
let colorMode = null

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
//import MainNavigator from './src/navigation/NavigationContainer';

import { UserMetadataProvider } from './src/context/UserMetadataProvider';

import { fetchUserDataDocument } from './src/components/utils/firebaseUtils/fetchUserDataDocument';

//import { Animated } from "react-native";

export default function App() {  
  
  const theme= createTheme()

  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('./src/assets/fonts/Inter-Bold.ttf'),
    'Roboto-Bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
    'Roboto-BoldItalic': require('./src/assets/fonts/Roboto-BoldItalic.ttf'),
    'Roboto-Medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
    'Roboto-MediumItalic': require('./src/assets/fonts/Roboto-MediumItalic.ttf'),
    'Roboto-Regular': require('./src/assets/fonts/Roboto-Regular.ttf'),    
    'Mokoto': require('./src/assets/fonts/Mokoto.ttf'),    
  });

  const [userIsLoggedIn, setUserIsLoggedIn] = useState(undefined)
  const [userIndexDocument, setUserIndexDocument] = useState(null)
  //const [userDataDocument, setUserDataDocument] = useState(null)
  let userDataDocumentRef = useRef(null)
  const [disableHeaderNavigation, setDisableHeaderNavigation] = useState(false)

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async userIndexDocument => {
        if (userIndexDocument) {                                                                          
          await fetchUserDataDocument(userIndexDocument.uid).then((userDataDocument)=>{
              //console.log('userIndexDocument', userIndexDocument)              
              userDataDocumentRef.current = userDataDocument.data()
              //console.log('userDataDocument', userDataDocumentRef.current)
              setUserIndexDocument(userIndexDocument)
              setUserIsLoggedIn(true)
            }).catch(()=>{
              Alert.alert('Error', 'An error has ocurred retrieving your login data. If this issue persists, contact support', [          
                {
                  text: 'OK', style: 'default'
                }])
            })          
        }else{          
          //setUserIndexDocument(userIndexDocument)
          setUserIsLoggedIn(false)
        }
    })
  }, [])

  // Needed to be able to wrap and use the useThemeMode and useColorScheme hooks. (Only can be called in a functional component)  
  const SystemThemeColorDetector = (props)=>{
    colorMode = useColorScheme()
    const { theme, updateTheme } = useTheme()
    const { setMode } = useThemeMode()
      
    useEffect(() => {
      updateTheme({                
        darkColors: {
          background: '#000000',
          logoSubtitle: '#5ce1e6',          
          logoSubtitleShadow:'rgba(92, 225, 230, 1)',                    
          primary:'rgb(92, 225, 230)',
          secondary:'rgba(251, 198, 70, 1)',
          cardBackground:'#1C1C1E'

        },
        lightColors: {
          background: '#f5f5f5',
          logoSubtitle: '#5e17eb',
          logoSubtitleShadow:'rgba(94, 23, 235, 0.75)',          
          primary:'rgb(94, 23, 235)',
          secondary:'rgba(255, 71, 249, 1)',
          cardBackground:'white'
        }
      });
      //console.log('app.tsx useeffect theme', prettyFormat(theme))
      if(colorMode==='dark'){
        console.log('app.tsx detected dark')
      }else{
        console.log('app.tsx detected light')
      }
      // thesis: this is the magic line
      setMode(colorMode);
    }, [colorMode]);

    //if minHeight is not set it doesnt show up
    return(
      <View style={{margin:0, backgroundColor:theme.colors.background, minHeight:'100%'}}>
          {props.children}
      </View>
    )
  }

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  

  return (
    <SafeAreaProvider>
      <SafeAreaView onLayout={onLayoutRootView}>      
        <ThemeProvider theme={theme}>
          <NavigationContainer >
            <CustomStatusBar/>
            <SystemThemeColorDetector>
              {userIsLoggedIn===undefined?
                (
                <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
                  <ActivityIndicator size="large" />
                </View>
                ):
                userIsLoggedIn===false?
                (                
                  
                  <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Login" component={LoginScreen} initialParams={{ setUserIsLoggedIn: setUserIsLoggedIn }}/>
                    <Stack.Screen name="Register" component={RegisterScreen} initialParams={{ setUserIsLoggedIn: setUserIsLoggedIn }}/>
                  </Stack.Navigator>
                )
                :
                ( 
                <UserMetadataProvider initialStateValue={{ uid: userIndexDocument.uid, userDataDocument: userDataDocumentRef.current, userIndexDocument:userIndexDocument }}>
                  
                  <Drawer.Navigator
                    id='mainDrawer'
                    //initialRouteName='Homescreen'
                    drawerContent={(props) => <CustomDrawerContent {...props} userIndexDocument={userIndexDocument} navigation={props.navigation} initialParams={{ setUserIsLoggedIn: setUserIsLoggedIn }}/>}  
                    screenOptions={{
                      //headerShown: disableHeaderNavigation===false?true:false,
                      headerShown: true,
                      headerTransparent:false,              
                      header: ({ navigation }) => <MyCustomHeader navigation={navigation} />,
                      drawerStyle: {
                        //backgroundColor: colorMode==='dark
                        //width: 240,
                      },              
                    }}            
                    backBehavior='firstRoute'
                    useLegacyImplementation={false}
                  >
                    <Drawer.Screen
                      name="Home"
                      component={MainNavigator}
                      initialParams={{ theme:theme, mai_key_one: 'arre lok' }}
                      //options={{ drawerLabel: 'Home',title: 'testing the title key' }}                  
                    />                
                  </Drawer.Navigator>
                </UserMetadataProvider>
                )
              }
            </SystemThemeColorDetector>
          </NavigationContainer>
        </ThemeProvider>                         
      </SafeAreaView>
    </SafeAreaProvider>
  )
}