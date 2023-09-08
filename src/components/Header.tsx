import { Header as RNEHeader, Icon } from '@rneui/themed';
import { DrawerActions,} from '@react-navigation/native';
import {View} from 'react-native'
export default function Header(props){
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
            ></RNEHeader>
        </View>
    )
}