import {View} from 'react-native'
export default function CardContainer(props){    
    return(        
        <View style={props.style}>
            {props.children}
        </View>
    )
}