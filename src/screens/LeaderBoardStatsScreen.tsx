import { Image, Tab, TabView, Text, useTheme } from '@rneui/themed'
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, StyleSheet, View, useColorScheme } from "react-native"
import { ScrollView } from 'react-native-gesture-handler'
import Images from '../assets/images/exports'
import LeaderboardHeader from "../components/LeaderboardHeader"
import LeaderboardRow from "../components/LeaderboardRow"
import StatsLineChartComponent from '../components/StatsLineChartComponent'
import BoldText from '../components/utils/BoldText'
import { StatsPieChartComponent } from '../components/utils/StatsPieChartComponent'
import { fetchObjectOfUnorderedPlayedCategoriesFrequencies } from '../components/utils/firebaseUtils/fetchObjectOfUnorderedPlayedCategoriesFrequencies'
import { fetchSkPointsHistory } from '../components/utils/firebaseUtils/fetchSkPointsHistory'
import { fetchSkPointsLeaderBoard } from "../components/utils/firebaseUtils/fetchSkPointsLeaderBoard"
import { fetchUserStatistics } from '../components/utils/firebaseUtils/fetchUserStatistics'
import { useUserMetadataSharedValue } from '../context/UserMetadataProvider'
import {useWindowDimensions} from 'react-native';
// Line taken from: https://stackoverflow.com/questions/29290460/use-image-with-a-local-file
const DEFAULT_IMAGE = Image.resolveAssetSource(Images.threeCups).uri

export default function LeaderBoardStatsScreen(props){
    const { sharedValue: userMetadataSharedValue } =useUserMetadataSharedValue()
    const USER_UID = userMetadataSharedValue.uid
    
    const [index, setIndex] = useState(0)
    const { theme, updateTheme } = useTheme()
    const colorMode = useColorScheme()    
    
    //There is an open known bug for the RNE component "Tab" that at times may crash the app, the following code is a work-around to fix it and was taken from the following Github comment: https://github.com/react-native-elements/react-native-elements/issues/3784#issuecomment-1685282505
    const [indicatorX, setIndicatorX] = useState(0)
    const {height, width: windowWidth} = useWindowDimensions()
    const tabWidth = windowWidth / 2

    function LeaderBoardComponent (props){
        const [isLoading, setIsLoading] = useState(true)
        const [imageIsLoading, setImageIsLoading] = useState(true)
        const [arrayOfLeaderboardMembers, setArrayOfLeaderboardMembers] = useState([])
        useEffect(()=>{
            fetchSkPointsLeaderBoard().then((querySnapshot)=>{
                const auxArrayOfLeaderboardMembers = querySnapshot.docs.map(document => document.data())
                //console.log("auxArrayOfLeaderboardMembers",auxArrayOfLeaderboardMembers)
                setArrayOfLeaderboardMembers(auxArrayOfLeaderboardMembers)
                setIsLoading(false)
            }).catch((error)=>{
                console.log("error",error)
            })
        },[])
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
            isLoading && imageIsLoading?
            <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
                <ActivityIndicator size="large" />
            </View>
            :
            <>
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
            </>
        )
    }
    function UserStatsComponent(props){
        const [isLoadingScreen, setIsLoadingScreen] = useState(true)
        const [statefulSkPointGraphData, setStatefulSkPointGraphData] = useState([])
        const [statefulArrayOfMostPlayedCategories, setStatefulArrayOfMostPlayedCategories] = useState([])
        const [statefulObjectOfUserRecords, setStatefulObjectOfUserRecords] = useState({})
        const [statefulAverageScorePerChallenge, setStatefulAverageScorePerChallenge] = useState(null)
        const [statefulAverageSkPointsEarnedPerChallenge, setStatefulAverageSkPointsEarnedPerChallenge] = useState(null)
        
        //const lineData = [{value: 0},{value: 20},{value: 18},{value: 40},{value: 36},{value: 60},{value: 54},{value: 85}]
        useEffect(()=>{
            fetchAllDataRequired()
        },[])

        async function fetchAllDataRequired(){
            let skPointGraphData = []
            let errorFlag = null
            await fetchSkPointsHistory(USER_UID).then((arrayOfSkPointsHistory:Array<number>)=>{
                if(Array.isArray(arrayOfSkPointsHistory)){
                    if(arrayOfSkPointsHistory.length>=1){
                        arrayOfSkPointsHistory.forEach((skPoints,index)=>{
                            skPointGraphData.push({value:skPoints})
                        })
                    }
                }
                
                /* lineData.forEach((element,index)=>{
                    skPointGraphData.push({value:element.value})
                }) */
                setStatefulSkPointGraphData(skPointGraphData)
            }).catch((error)=>{
                errorFlag = true
                console.log("error fetchSkPointsHistory", error)
                Alert.alert('Error','There was an error while fetching your stats',[{text:'OK',style:'default'}])
            })
            await fetchObjectOfUnorderedPlayedCategoriesFrequencies(USER_UID).then((objectOfMostPlayedCategories:Object)=>{
                // cast the object into an array so the array method "sort" can later be used
                const arrayOfMostPlayedCategories = Object.entries(objectOfMostPlayedCategories)
                // Sort using sorting function in Descending order, reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
                // If the "next" category (categoriesObjectB) is of greater size, it will appear first (descending order sort)
                arrayOfMostPlayedCategories.sort((categoriesObjectA, categoriesObjectB) => categoriesObjectB[1] - categoriesObjectA[1])
                setStatefulArrayOfMostPlayedCategories(arrayOfMostPlayedCategories)
            }).catch((error)=>{
                errorFlag = true
                console.log("error fetchObjectOfUnorderedPlayedCategoriesFrequencies", error)
                Alert.alert('Error','There was an error while fetching your stats',[{text:'OK',style:'default'}])
            })
            await fetchUserStatistics(USER_UID).then((userStatistics)=>{
                if(userStatistics){
                    setStatefulObjectOfUserRecords(userStatistics.userRecords)
                    setStatefulAverageScorePerChallenge(userStatistics.averageScorePerChallenge)
                    setStatefulAverageSkPointsEarnedPerChallenge(userStatistics.averageSkPointsEarnedPerChallenge)
                }                
            }).catch((error)=>{
                errorFlag = true     
                console.log("error fetchUserStatistics", error)
                Alert.alert('Error','There was an error while fetching your stats',[{text:'OK',style:'default'}])
            })
            if(errorFlag!=true){
                setIsLoadingScreen(false)
            }
            
        }

        
        const styles = StyleSheet.create({
            allChartsCommonStyles:{
                flex:1,
                width:'100%',
                maxWidth:'100%',
                alignSelf:'center'
            },
            subsectionContainer:{
                flex:1,
                display:'flex'
            },
            StatsLineChartStyle:{
                marginTop:10,
                marginBottom:-20,
            },
            pieChartStyle:{
                marginTop:20
            },
        })


        return (
            isLoadingScreen?
                <View style={{flex:1,position: "absolute",width:"100%",height:"100%",backgroundColor:'rgba(255, 255, 255, 0.5)',alignItems: 'center',justifyContent: 'center'}}>
                    <ActivityIndicator size="large" />
                </View>
            :
            <>
                <ScrollView 
                    persistentScrollbar={true}
                    // required for Android https://stackoverflow.com/questions/51098599/flatlist-inside-scrollview-doesnt-scroll
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{flexGrow:1, display:'flex', justifyContent:'flex-start'/* , alignItems:'center', alignContent:'center' */,paddingBottom:50,paddingTop:10, paddingHorizontal:10, backgroundColor:colorMode==='dark'?'black':'white',}}
                >
                    <View id="chartsFlexContainer" style={{flex:1, display:'flex', gap:20}}>
                        <View id="subsectionContainer" style={styles.subsectionContainer}>
                            <Text h3>Your SkPoints over time</Text>
                            {statefulSkPointGraphData.length>=2?
                                <StatsLineChartComponent style={[styles.allChartsCommonStyles,styles.StatsLineChartStyle]} data={statefulSkPointGraphData}></StatsLineChartComponent>
                                :
                                <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>
                            }
                        </View>
                        <View id="subsectionContainer" style={styles.subsectionContainer}>
                            <Text h3>Per SKChallenge Stats</Text>
                                {
                                    statefulAverageScorePerChallenge!=null?
                                    statefulAverageSkPointsEarnedPerChallenge!=null?
                                    <View style={{paddingLeft:10,paddingTop:5}}>
                                    <Text h4 h4Style={{fontWeight:'600', fontSize:16}}><BoldText>Average Score:</BoldText> {statefulAverageScorePerChallenge.toFixed(1)}%</Text>
                                    <Text h4 h4Style={{fontWeight:'600', fontSize:16}}><BoldText>Average SKPoints received:</BoldText> {statefulAverageSkPointsEarnedPerChallenge.toFixed(0)}</Text>
                                    </View>
                                    :
                                    <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>    
                                    :
                                    <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>
                                }
                        </View>
                        <View id="subsectionContainer" style={styles.subsectionContainer}>
                            <Text h3>Your Personal Records</Text>
                            {statefulObjectOfUserRecords!=null?
                                statefulObjectOfUserRecords.score!=null?
                                    <View style={{paddingLeft:10,paddingTop:5}}>
                                        <Text h4 h4Style={{fontWeight:'600', fontSize:16}}><BoldText>All Time Best Score:</BoldText> {statefulObjectOfUserRecords.score}% 😎</Text>
                                        <Text h4 h4Style={{fontWeight:'600', fontSize:16}}><BoldText>Lowest Time Mark:</BoldText> {statefulObjectOfUserRecords.time} {statefulObjectOfUserRecords.time==1?"second":"seconds"}⏳</Text>
                                        <Text h4 h4Style={{fontWeight:'600', fontSize:16}}><BoldText>Most SKPoints Earned in one SKChallenge:</BoldText> {statefulObjectOfUserRecords.skPoints} 🪙</Text>
                                    </View>
                                :
                                <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>    
                                :
                                <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>
                            }
                        </View>
                        <View id="subsectionContainer" style={styles.subsectionContainer}>
                            <Text h3>Most Played Categories</Text>
                            {
                                statefulArrayOfMostPlayedCategories.length>=1?
                                    <StatsPieChartComponent orderedArrayOfMostPlayedCategories={statefulArrayOfMostPlayedCategories} style={[styles.allChartsCommonStyles,styles.pieChartStyle]}></StatsPieChartComponent>
                                :
                                    <Text>Nothing to show yet. Play some SKChallenges to see your statistics.</Text>
                            }                            
                        </View>
                    </View>
                </ScrollView>
            </>
        )
    }

    return (        
        <>
            
            <Tab //There is an open known bug for this component (Tab) that at times may crash the app, the following code in indicatorStyle is a work-around to fix it and was taken from the following Github comment: https://github.com/react-native-elements/react-native-elements/issues/3784#issuecomment-1685282505
                value={index} onChange={(e) => {
                    setIndex(e);
                    setIndicatorX(e * tabWidth) // Setting the right translateX value, (current work-around for bug https://github.com/react-native-elements/react-native-elements/issues/3784)
                }} 
                indicatorStyle={{ backgroundColor: theme.colors.secondary,height: 3, transform: [{ translateX: indicatorX }]}}
                variant="primary" >
                
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