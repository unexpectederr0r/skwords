import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Icon, useTheme } from "@rneui/themed"
import { useColorScheme } from 'react-native'
import CreateSKChallengeScreen from '../screens/CreateSKChallengeScreen'
import Homescreen from '../screens/HomeScreen'

import LeaderBoardStatsScreen from '../screens/LeaderBoardStatsScreen'
import PlayScreen from '../screens/Playscreen'
import UserProfileScreen from '../screens/UserProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const HomescreenNavigator = ()=>{
  return(
    <Stack.Navigator screenOptions={{headerShown: false,gestureEnabled: false}}>
      <Stack.Screen name="Homescreen" component={Homescreen} /* initialParams={{ theme:theme}} *//>
      <Stack.Screen name="PlayScreen" component={PlayScreen}/>
    </Stack.Navigator>
  )
}

export default function MainNavigator() {
    let colorMode = useColorScheme();
    const { theme, updateTheme } = useTheme()
    //Custom matching color https://mycolor.space/?hex=%235CE1E6&sub=1
    return ( 
      <Tab.Navigator initialRouteName='Leaderboards' tabBarPosition={'bottom'} screenOptions={{ tabBarHideOnKeyboard: true, unmountOnBlur: true, headerShown: false, tabBarShowLabel:false, tabBarActiveBackgroundColor:colorMode==='light'?theme.colors.secondary:'#f9f871', tabBarInactiveBackgroundColor:theme.colors.background, tabBarStyle: { /* backgroundColor: theme.colors.background, */ borderTopWidth:1, borderColor:colorMode==='dark'?'white':'black'}}}>
        <Tab.Screen name="HomescreenNavigator" component={HomescreenNavigator} options={{ tabBarIcon: ({ color, focused }) => (<Icon name= 'home' type= 'material' size={25} color= {theme.colors.primary} />)}}/>        
        <Tab.Screen name="Create" component={CreateSKChallengeScreen} options={{ tabBarIcon: ({ color, focused }) => (<Icon name= 'edit' type= 'font-awesome' size={25} color= {theme.colors.primary} />)}}/>
        <Tab.Screen name="Leaderboards" component={LeaderBoardStatsScreen} options={{ tabBarIcon: ({ color, focused }) => (<Icon name= 'emoji-events' type= 'material' size={25} color= {theme.colors.primary} />)}}/>
        <Tab.Screen name="MyAccount" component={UserProfileScreen} options={{ tabBarIcon: ({ color, focused }) => (<Icon name= 'account-circle' type= 'material' size={25} color= {theme.colors.primary} />)}}/>
      </Tab.Navigator>
    );
  }