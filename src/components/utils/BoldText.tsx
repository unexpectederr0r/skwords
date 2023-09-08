import { Text } from "@rneui/themed"
export default function BoldText (props){
    return(
        <Text style={{fontWeight: 'bold',...props.style}}>{props.children}</Text>
    )
}
