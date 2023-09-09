import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import { NavigationContainer } from '@react-navigation/native'

const AuthStack = (props) => {  
  const Stack = createNativeStackNavigator()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} /* initialParams={{ }} *//>
        <Stack.Screen name="Register" component={RegisterScreen} /* initialParams={{ }} *//>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStack;
