import { View, StyleSheet, useColorScheme, ActivityIndicator } from "react-native"
import { Tab, TabView, Text, useTheme,Icon, Divider, Image } from '@rneui/themed'
import { useState, useEffect } from "react"
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import Images from '../assets/images/exports'
import { fetchSkPointsLeaderBoard } from "../components/utils/firebaseUtils/fetchSkPointsLeaderBoard"
import LeaderboardRow from "../components/LeaderboardRow"
import LeaderboardHeader from "../components/LeaderboardHeader"
// Line taken from: https://stackoverflow.com/questions/29290460/use-image-with-a-local-file
const DEFAULT_IMAGE = Image.resolveAssetSource(Images.threeCups).uri

export default function LeaderBoardStatsScreen(props){
    const [isLoading, setIsLoading] = useState(true)
    const [imageIsLoading, setImageIsLoading] = useState(true)
    const [arrayOfLeaderboardMembers, setArrayOfLeaderboardMembers] = useState([])
    const [index, setIndex] = useState(0)
    const { theme, updateTheme } = useTheme()
    const colorMode = useColorScheme()    

    useEffect(()=>{
        fetchSkPointsLeaderBoard().then((querySnapshot)=>{
            const auxArrayOfLeaderboardMembers = querySnapshot.docs.map(document => document.data())
            console.log("auxArrayOfLeaderboardMembers",auxArrayOfLeaderboardMembers)
            setArrayOfLeaderboardMembers(auxArrayOfLeaderboardMembers)
            setIsLoading(false)
        }).catch((error)=>{
            console.log("error",error)
        })
    },[])        

    function LeaderBoardComponent (props){
        const styles = StyleSheet.create({
            mainContainerView:{
                width:'100%',
                height:'100%',
                display:'flex',
                backgroundColor:colorMode==='dark'?'black':'white',
            },
            imageContainerView:{
                marginTop:'4%',
                alignSelf:'center',
                alignItems:'center',
                //flex:3,
                display:'flex',
                justifyContent:'space-around',
                //backgroundColor:'lime'
            },
            imageInnerContainer:{
                //flex:3,
                display:'flex',
                //backgroundColor:'orange'
            },
            image:{
                //marginTop:'2%',
                height: 100, 
                width: 200, 
                //backgroundColor:'blue'
                //borderRadius: 40,               
            },
            leaderboardContainerView:{
                borderWidth:1,
                marginHorizontal:'3%',
                marginTop:'3%',
                marginBottom:'2%',
                padding:'3%',
                /* borderTopLeftRadius:10,
                borderTopRightRadius:10, */
                borderRadius:10,
                borderColor:theme.colors.divider,
                //overflow:'hidden',
                flex:1,
                display:'flex',
                
                //marginHorizontal:'2%',                
            },

        })
        
        return(
            <View style={styles.mainContainerView}>
                <View style={styles.imageContainerView}>
                    <Image onLoad={()=>{setImageIsLoading(false)}} source={{uri:DEFAULT_IMAGE}} style={styles.image} containerStyle={styles.imageInnerContainer}/>
                    <View>
                        <Text  h3 style={{color:colorMode==='dark'?'white':'black'}}>Hall of Fame</Text>
                    </View>
                </View>
                <View style={styles.leaderboardContainerView}>
                    <View style={{marginTop:'2%'}}>
                        <LeaderboardHeader></LeaderboardHeader>
                    </View>
                    
                    <ScrollView 
                        persistentScrollbar={true}
                        // required for Android https://stackoverflow.com/questions/51098599/flatlist-inside-scrollview-doesnt-scroll
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{flexGrow:1, display:'flex', justifyContent:'flex-start',paddingBottom:5}}
                    >
                        {
                            arrayOfLeaderboardMembers.map((value,index)=>{
                                return <LeaderboardRow key={index} ranking={index+1} skPoints={value.skPoints} nickname={value.nickname}></LeaderboardRow>
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
    function UserStatsComponent(props){
        return(
            <View></View>
        )
    }
    return (
        isLoading && imageIsLoading?
        <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
        :
        <>
            <Tab value={index} onChange={(e) => setIndex(e)} indicatorStyle={{ backgroundColor: theme.colors.secondary,height: 3,}} variant="primary" >
                <Tab.Item
                    title="Leaderboard"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'leaderboard', type: 'material', color: 'white' }}
                />
                <Tab.Item
                    title="My stats"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'user-astronaut', type: 'font-awesome-5', color: 'white' }}
                />
            </Tab>
            <TabView value={index} onChange={setIndex} animationType="spring">
                <TabView.Item style={{ width: '100%', height:'100%' }}>
                    <LeaderBoardComponent/>
                </TabView.Item>
                <TabView.Item style={{ width: '100%', height:'100%' }}>
                    <UserStatsComponent/>
                </TabView.Item>
            </TabView>
        </>
    )
}