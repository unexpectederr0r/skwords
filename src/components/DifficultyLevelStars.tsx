import { View } from "react-native"
import { Text,Icon,useTheme } from "@rneui/themed"
export default function DifficultyLevelStars(props){
    const { theme} = useTheme()
    return(
      <View style={[props.style,{display:'flex', flexDirection:'row',alignItems:'center',alignContent:'center'}]}>          
        <Text style={{fontSize:13}}>Difficulty: </Text>
        {Array.from(Array(props.difficulty).keys()).map((item,index)=>( 
          <Icon key={index} name='star' type='material-icons' size={15} color= {theme.colors.secondary}/>
          ))
        }
        {Array.from(Array(6-Number(props.difficulty)).keys()).map((item,index)=>( 
          <Icon key={index} name='star-border' type='material-icons' size= {15} color= {theme.colors.secondary}/>
          ))
        }
      </View>            
    )
  }