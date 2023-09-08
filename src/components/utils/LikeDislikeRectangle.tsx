import {View} from 'react-native';
export default function LikeDislikeRectangle(props){    
    return(        
        <View style={props.style}>
            {props.children}
        </View>
    )
}