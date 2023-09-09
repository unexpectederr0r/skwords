import { Icon, Text } from "@rneui/themed"
import { Pressable, StyleSheet, View } from "react-native"
import { ChallengeIndexDocumentInterface } from "./utils/firebaseUtils/types/firebaseDocumentInterfaces"
interface PlayButtonComponentProps {
  challengeIndexUid: string
  challengeIndexData: ChallengeIndexDocumentInterface,
  props:any
}
export default function PlayButtonComponent({challengeIndexData,...props}:PlayButtonComponentProps){ 
    const styles = StyleSheet.create({
      buttonContainer: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '2%',
        borderRadius: 5,
        elevation: 1,
        backgroundColor: 'rgba(199, 43, 98, 1)',          
      },
      text: {          
        marginHorizontal:'5%',
        fontSize: props.fontSize?(props.fontSize+1):16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
      },
    })
    return(      
      <View style={props.style}>
        <Pressable style={styles.buttonContainer} onPress={()=>{props.navigation.push('PlayScreen',{challengeIndexUid: props.challengeIndexUid,challengeUid: challengeIndexData.challengeUid, challengeIndexData: challengeIndexData})}}>
          <Icon name= 'play' type= 'font-awesome' size= {props.fontSize?props.fontSize:15} color= 'white'/>
          <Text style={styles.text}>Play</Text>
        </Pressable>
      </View>
    )
  }