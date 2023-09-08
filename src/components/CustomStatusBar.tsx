import { StatusBar } from 'expo-status-bar'

export default function CustomStatusBar(props){
    return(
        <StatusBar
              animated={true}
              backgroundColor="#61dafb"
              barStyle={'dark-content'}
              showHideTransition={'fade'}
              hidden={true}
        ></StatusBar>
    )
}
