import { Alert, Pressable,StyleSheet,View } from "react-native"
import { Icon,Text,useTheme } from "@rneui/themed"
import { useEffect } from "react"
import { updateLikeCountBy } from "./utils/firebaseUtils/updateLikeCountBy"
import { isChallengeLikedOrDislikedByUser } from "./utils/firebaseUtils/isChallengeLikedOrDislikedByUser"
import { useUserMetadataSharedValue } from "../context/UserMetadataProvider"
import { useState } from "react"
export default function LikeDislikeComponent(props){
  const { sharedValue: userMetadataSharedValue } =useUserMetadataSharedValue()    

  const [statefulLikeCount,setStatefulLikeCount] = useState(props.challengeIndexData.likeCount)
  const [statefulIsLikedByUser,setStatefulIsLikedByUser] = useState(undefined)
  const styles = StyleSheet.create({
      flexChild:{
          alignSelf:'center',justifyContent:'center',alignContent:'center',alignItems:'center',height:'100%'
      },
      circle:{
          borderRadius:50
      }
  })
  //console.log(props.fontSize)


  let handleWasLikedOrDislikedIsRunning = false
  async function handleWasLikedOrDisliked(isLiked){
    if(!handleWasLikedOrDislikedIsRunning){
      // set flag on so function can not be called simultanenously
      handleWasLikedOrDislikedIsRunning = true
      updateLikeCountBy(userMetadataSharedValue.uid,props.challengeIndexUid,isLiked).then((currentLikeCount)=>{          
          handleWasLikedOrDislikedIsRunning = false
          setStatefulLikeCount(currentLikeCount)
        }
      ).catch(()=>{
        Alert.alert('Error', 'An error has ocurred while updating your action in the backend. Try it later or contact support if the issue persists', [          
          {
            text: 'OK', style: 'default'
          }
        ])
        handleWasLikedOrDislikedIsRunning = false
      })
    }
  }

  useEffect(()=>{
    isChallengeLikedOrDislikedByUser(userMetadataSharedValue.uid,props.challengeIndexUid).then((challengeIsLikedByUser)=>{      
      if(challengeIsLikedByUser){
        setStatefulIsLikedByUser(true)
      }else if(challengeIsLikedByUser === false){
        setStatefulIsLikedByUser(false)
      }else{
        setStatefulIsLikedByUser(undefined)
      }
    })
  },[statefulLikeCount])

  // Color references from: https://johndecember.com/html/spec/colorshades.html
  return(
    <View style={[props.style,{margin:0,padding:0,display:'flex',flexDirection:'row',alignItems:'center',alignContent:'center',justifyContent:'center',height:'100%',borderColor:'gray',borderWidth:1,borderRadius:5}]}>
      <Pressable style={[{flex:1,borderRadius:1},styles.flexChild]} 
        onPress={ ()=>handleWasLikedOrDisliked(false)}>
        <Icon name={statefulIsLikedByUser===false?'minus-circle':'minus-circle-outline'} type= 'material-community' size={props.fontSize+4} color={statefulIsLikedByUser===false?'lightblue':'rgba(215, 236, 243, 0.5)'}/>
      </Pressable>
      <View style={[{flex:2},styles.flexChild]}>
        <Text style={{fontSize:props.fontSize,fontWeight:'bold',paddingHorizontal:'1%'}}>{statefulLikeCount}</Text>
      </View>
      <Pressable style={[{flex:1,borderRadius:1,borderColor:'white'},styles.flexChild]} 
        onPress={()=>handleWasLikedOrDisliked(true)}
      >            
        <Icon name={statefulIsLikedByUser===true?'plus-circle':'plus-circle-outline'} type= 'material-community' size={props.fontSize+4} color={statefulIsLikedByUser===true?'red':'maroon'}/>
      </Pressable>
    </View>
  )
}