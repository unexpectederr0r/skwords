import { Header as RNEHeader, Icon } from '@rneui/themed'
import { DrawerActions,} from '@react-navigation/native'
import {StyleSheet, View} from 'react-native'
import LoginSVGLightTheme from '../assets/images/misc/logo_light_theme.svg'
import LoginSVGDarkTheme from '../assets/images/misc/logo_dark_theme.svg'
import { useColorScheme } from 'react-native'
export default function Header(props){
    const colorMode = useColorScheme()
    const styles = StyleSheet.create({
        logoSVG: {            
            left:-10,
            alignSelf:'center',
            height:25,
            width:25,
        }
    })
    return(
        <View>            
            <RNEHeader
                statusBarProps='true'
                hidden={'true'}
                placement='left'
                elevated={false}
                style={{padding:'0%',margin:'0%'}}
                leftComponent={
                    <Icon color='white' name='menu' onPress={()=>props.navigation.dispatch(DrawerActions.openDrawer())}/>  
                }            
                centerComponent={
                    colorMode==='dark'?<LoginSVGDarkTheme style={styles.logoSVG}/>:<LoginSVGLightTheme style={styles.logoSVG}/>
                }
            ></RNEHeader>
        </View>
    )
}