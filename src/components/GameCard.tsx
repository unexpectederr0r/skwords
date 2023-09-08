
import {View} from 'react-native'
import { Text, Skeleton, useTheme} from '@rneui/themed'
import LikeDislikeComponent from './LikeDislikeButtonComponent'
import DifficultyLevelStars from './DifficultyLevelStars'
import BoldText from './utils/BoldText'
import PlayButtonComponent from './PlayButton'

import { ChallengeIndexDocumentInterface } from './utils/firebaseUtils/types/firebaseDocumentInterfaces'

interface GameCardProps {
  challengeIndexUid: string,
  challengeIndexData: ChallengeIndexDocumentInterface,
  props: any
}

export default function GameCard({challengeIndexUid,challengeIndexData,...props}:GameCardProps){            
  //console.log("gamecard challengeIndexUid",challengeIndexUid)
  const { theme, updateTheme } = useTheme()
  return(
      <View id={'game-card-container'} style={[props.style,{backgroundColor: theme.colors.cardBackground, borderRadius:5, padding:'2%', elevation:5}]}>
        <View id={'row-1'} style={{flex:1, display:'flex', flexDirection:'row',alignItems:'flex-start',alignContent:'flex-start'}}>
          <DifficultyLevelStars style={{flex:6}} difficulty={challengeIndexData.difficulty}></DifficultyLevelStars>  
          <LikeDislikeComponent style={{flex:3}} fontSize={15} challengeIndexUid={challengeIndexUid} challengeIndexData={challengeIndexData}></LikeDislikeComponent>
        </View>
        <View id={'row-2'} style={{flex:1, paddingVertical:'2%',alignItems:'flex-start',alignContent:'flex-start'}}>
          {challengeIndexData.title?<Text style={{fontWeight:'bold',fontSize:18,textTransform:'capitalize',color:theme.colors.primary}}>{challengeIndexData.title}</Text>:<Skeleton skeletonStyle={{}} animation='pulse' width={210} height={15} />}
        </View>
        <View id={'row-3'} style={{flex:1,alignItems:'flex-start',alignContent:'flex-start'}}>
          {challengeIndexData.description?<Text style={{fontSize:14,color:theme.colors.grey1}}>{challengeIndexData.description}</Text>:(<View style={{display:'flex',gap:2}}><Skeleton animation='pulse' width={180} height={15} /><Skeleton animation='pulse' width={180} height={15} /></View>)}          
        </View>
        <View id={'row-4'} style={{flex:1, display:'flex',flexDirection:'row', paddingTop:'2%',alignItems:'flex-end',alignContent:'flex-end'}}>
          <Text style={{flex:6}}>By <BoldText>{challengeIndexData.userDisplayName}</BoldText> in <BoldText>{challengeIndexData.category}</BoldText></Text>          
          <PlayButtonComponent style={{flex:3}} navigation={props.navigation} challengeIndexUid={challengeIndexUid} challengeIndexData={challengeIndexData} fontSize={13}></PlayButtonComponent>
        </View>
      </View>        
    )
}