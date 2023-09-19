import { Icon, Skeleton, Text, useTheme } from '@rneui/themed'
import { Pressable, StyleSheet, View } from 'react-native'
import DifficultyLevelStars from './DifficultyLevelStars'
import LikeDislikeComponent from './LikeDislikeButtonComponent'
//import PlayButtonComponent from './PlayButton'
import BoldText from './utils/BoldText'

import { useEffect, useState } from 'react'
import { ChallengeIndexDocumentInterface } from './utils/firebaseUtils/types/firebaseDocumentInterfaces'

interface GameCardProps {
  isDisabled?:boolean,
  isLoading?:boolean,
  isFeatured?:boolean,
  //challengeIndexUid: string,
  challengeIndexData: ChallengeIndexDocumentInterface,
  props: any
}

export default function GameCard({isDisabled, isLoading,isFeatured,challengeIndexData,...props}:GameCardProps){  
  const [statefulChallengeIndexData,setStatefulChallengeIndexData] = useState({...challengeIndexData})
  
  const { theme, updateTheme } = useTheme()
  const styles = StyleSheet.create({
    catergoryText:{
      textTransform:'capitalize'
    },
    titleText:{
      fontWeight:'bold',
      fontSize:18,
      textTransform:'capitalize',
      color:theme.colors.primary
    },
    buttonContainer: {
      flexDirection:'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: '2%',
      borderRadius: 5,
      elevation: 1,
      backgroundColor: 'rgba(199, 43, 98, 1)',          
    },
    buttonContainerDisabled: {
      flexDirection:'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: '2%',
      borderRadius: 5,
      elevation: 1,
      backgroundColor: theme.colors.disabled,          
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
      <View id={'game-card-container'} style={[props.style,{backgroundColor: theme.colors.cardBackground, borderRadius:5, padding:'2%', elevation:5}]}>
        <View id={'row-1'} style={{flex:1, display:'flex', flexDirection:'row',alignItems:'flex-start',alignContent:'flex-start'}}>
          {!isLoading?
            <>
              <DifficultyLevelStars style={{flex:6}} difficulty={challengeIndexData.difficulty}></DifficultyLevelStars>  
              <LikeDislikeComponent style={{flex:3}} fontSize={15} challengeIndexData={statefulChallengeIndexData}></LikeDislikeComponent>
            </>
            :
            <View style={{flex:1, display:'flex', flexDirection:'row',alignItems:'stretch',alignContent:'stretch',justifyContent:'space-between',gap:90}}>
              <Skeleton style={{flex:1}} height={15}></Skeleton>
              <Skeleton style={{flex:1}} height={15}></Skeleton>
            </View>
          }
        </View>
        <View id={'row-2'} style={{flex:1, paddingVertical:'2%',alignItems:'flex-start',alignContent:'flex-start'}}>
          {!isLoading?
            challengeIndexData.title?<Text style={styles.titleText}>{challengeIndexData.title}</Text>:<Skeleton skeletonStyle={{}} animation='pulse' width={210} height={15} />
            :
            <Skeleton skeletonStyle={{}} animation='pulse' width={210} height={15}/>
          }
        </View>
        <View id={'row-3'} style={{flex:1,alignItems:'flex-start',alignContent:'flex-start'}}>
          {!isLoading?
            challengeIndexData.description?<Text style={{fontSize:14,color:theme.colors.grey1}}>{challengeIndexData.description}</Text>:(<View style={{display:'flex',gap:2}}><Skeleton animation='pulse' width={180} height={15} /><Skeleton animation='pulse' width={180} height={15} /></View>)
            :
            <Skeleton skeletonStyle={{}} animation='pulse' width={210} height={15} />
          }
        </View>
        <View id={'row-4'} style={{flex:1, display:'flex',flexDirection:'row', paddingTop:'2%',alignItems:'flex-end',alignContent:'flex-end'}}>
          {!isLoading?
            <>
              <Text style={{flex:6}}>By <BoldText>{challengeIndexData.userDisplayName}</BoldText> in <BoldText style={styles.catergoryText}>{challengeIndexData.category}</BoldText></Text>
              <View style={{flex:3}}>
                {!isDisabled?
                  <Pressable style={styles.buttonContainer} onPress={()=>{props.navigation.push('PlayScreen',{challengeIndexData:statefulChallengeIndexData,isFeatured:isFeatured===true?true:false})}}>
                    <Icon name= 'play' type= 'font-awesome' size= {13} color= 'white'/>
                    <Text style={styles.text}>Play</Text>
                  </Pressable>
                  :
                  <Pressable style={styles.buttonContainerDisabled} onPress={()=>{}}>
                    <Icon name= 'play' type= 'font-awesome' size= {13} color= 'white'/>
                    <Text style={styles.text}>Played</Text>
                  </Pressable>
                }
              </View>
            </>
          :
            <View style={{flex:1, display:'flex', flexDirection:'row',alignItems:'stretch',alignContent:'stretch',justifyContent:'space-between',gap:90}}>
              <Skeleton style={{flex:1}} height={15}></Skeleton>
              <Skeleton style={{flex:1}} height={15}></Skeleton>
            </View>
          }
        </View>
      </View>        
    )
}
