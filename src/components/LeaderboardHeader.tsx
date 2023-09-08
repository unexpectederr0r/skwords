import { View, StyleSheet, useColorScheme, ActivityIndicator } from "react-native"
import { Tab, TabView, Text, useTheme,Icon, Divider, Image } from '@rneui/themed'
import { fetchSkPointsLeaderBoard } from "../components/utils/firebaseUtils/fetchSkPointsLeaderBoard"
export default function LeaderboardHeader (props){
    const { theme, updateTheme } = useTheme()    
    const styles = StyleSheet.create({
        leftCellsCommonStyles:{
            borderRightWidth:1, 
            borderRightColor:theme.colors.divider,
            alignItems:'center'
        },
        allCellsCommonStyles:{
            alignItems:'center',
            paddingVertical:'2%',
        },
        allTextsCommonStyles:{
            fontWeight:'bold'
        },

    })
    return(
        <View style={StyleSheet.flatten([{...props.style},{display:'flex', flexDirection:'row'}])}>
            <View id='textContainer' style={{flex:1, display:'flex', flexDirection:'row', borderBottomWidth:1, borderColor:theme.colors.divider}}>
                <View style={StyleSheet.flatten([{flex:3},styles.leftCellsCommonStyles,styles.allCellsCommonStyles])}>
                    <Text style={styles.allTextsCommonStyles}>Ranking</Text>    
                </View>
                <View style={StyleSheet.flatten([{flex:3},styles.leftCellsCommonStyles,styles.allCellsCommonStyles])}>
                    <Text style={styles.allTextsCommonStyles}>Sk Points</Text>    
                </View>
                <View style={StyleSheet.flatten([{flex:4, alignItems:'center'},styles.allCellsCommonStyles])}>
                    <Text style={styles.allTextsCommonStyles}>User</Text>    
                </View>
            </View>
        </View>
    )
}