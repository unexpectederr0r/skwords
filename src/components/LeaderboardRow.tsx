import { Icon, Text, useTheme } from '@rneui/themed'
import { StyleSheet, View } from "react-native"
export default function LeaderboardRow (props){
    const { theme, updateTheme } = useTheme()
    const styles = StyleSheet.create({
        leftCellsCommonStyles:{
            borderRightWidth:1, 
            borderRightColor:theme.colors.divider,
            alignItems:'center'
        },
        allCellsCommonStyles:{
            alignItems:'center',
            paddingVertical:5,
        },
    })
    return(
        <View style={StyleSheet.flatten([{...props.style},{display:'flex', flexDirection:'row'}])}>
            <View id='textContainer' style={{flex:1, display:'flex', flexDirection:'row', borderBottomWidth:1, borderColor:theme.colors.divider}}>
                <View style={StyleSheet.flatten([{flex:3},styles.leftCellsCommonStyles,,styles.allCellsCommonStyles,props.ranking<=3?{display:'flex', flexDirection:'row', justifyContent:'center', gap:5}:null])}>
                    {props.ranking<=3?<Icon name='medal' type="font-awesome-5" color={props.ranking==1?'#E1C054':(props.ranking==2?'#B3B3B3':'#C47E43')} size={18}></Icon>:null}                        
                    <Text>{props.ranking}</Text>
                </View>
                <View style={StyleSheet.flatten([{flex:3},styles.leftCellsCommonStyles,styles.allCellsCommonStyles])}>
                    <Text>{props.skPoints}</Text>    
                </View>
                <View style={StyleSheet.flatten([{flex:4, alignItems:'center'},styles.allCellsCommonStyles])}>
                    <Text>{props.nickname}</Text>    
                </View>
            </View>
        </View>
    )
}