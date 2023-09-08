import { useColorScheme, View} from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { useEffect } from 'react'
const ColorScheme = (props) => {        
    props.colorMode = useColorScheme();
    const { theme } = useTheme()    
    const { setMode } = useThemeMode()
    useEffect(() => {
      if(props.colorMode==='dark'){
        console.log('detected dark')
      }
      setMode(props.colorMode)
    }, [props.colorMode])
    
    return (
      <View style={{ backgroundColor: theme.colors.background }}>{props.children}</View>
    )
}
export default ColorScheme