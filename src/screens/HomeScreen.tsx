import { Divider, Text, useTheme } from '@rneui/themed'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import 'react-native-gesture-handler'
import FilterCategoryComponent from '../components/FilterCategoryComponent'
import { GameCard } from '../components/index'
import FIREBASE_COLLECTIONS from '../components/utils/firebaseUtils/constants/firebaseCollections'
import { fetchDocumentsFromCollection } from '../components/utils/firebaseUtils/fetchDocumentsFromCollection'
import { FetchDocumentsFromCollectionOptionsInterface } from '../components/utils/firebaseUtils/types/fetchDocumentsFromCollectionOptionsInterface'
import { useHomescreenFilterCategorySharedValue } from '../context/HomescreenFilterCategorySharedValueProvider'
import FilterDifficultyComponent from '../components/FilterDifficultyComponent'
import { fetchOrCreateChallengeOfTheDay } from '../components/utils/firebaseUtils/fetchOrCreateChallengeOfTheDay'
import { challengesIndexObjectInterface } from '../components/utils/firebaseUtils/types/firebaseDocumentInterfaces'
import { challengeOfTheDayInterface } from '../components/utils/firebaseUtils/types/firebaseDocumentInterfaces'
import wasChallengeOfTheDayAlreadyPlayed from '../components/utils/firebaseUtils/wasChallengeOfTheDayAlreadyPlayed'
import { useHomescreenFilterDifficultySharedValue } from '../context/HomescreenFilterDifficultySharedValueProvider'

export default function Homescreen(props){    
    
    const [arrayOfChallengesIndexObject, setArrayOfChallengesIndexObject] = useState<Array<challengesIndexObjectInterface>>([])
    const [featuredChallengeData, setFeaturedChallengeData] = useState<challengeOfTheDayInterface>(null)
    const { theme, updateTheme } = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const [infiniteScrollingIsFetchingNewData, setInfiniteScrollingIsFetchingNewData] = useState(false)
    const [enablePlayingChallengeOfTheDay, setEnablePlayingChallengeOfTheDay] = useState(false)

    const { sharedValue: homescreenFilterCategorySharedValue, setSharedValue: setHomescreenFilterCategorySharedValue} = useHomescreenFilterCategorySharedValue()
    const { sharedValue: homescreenFilterDifficultySharedValue, setSharedValue: setHomescreenFilterDifficultySharedValue} = useHomescreenFilterDifficultySharedValue()

    const lastVisibleFirestoreDocumentSnapshotRef = useRef(null)
    const lastUsedFetchChallengesArgumentsRef = useRef(null)
    const fetchChallenges = async (options?:FetchDocumentsFromCollectionOptionsInterface) => {
        setRefreshing(true)
        fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION, options).then((querySnapshot)=>{
            const auxArrayOfChallengesIndexObject = querySnapshot.docs.map(document => ({...document.data(),challengeIndexUid:document.id}))            
            // Save the last document retrieved so Firebase can use it as a pagination delimiter for infinite scrolling. Reference: https://firebase.google.com/docs/firestore/query-data/query-cursors
            lastVisibleFirestoreDocumentSnapshotRef.current = querySnapshot.docs[querySnapshot.docs.length-1]
            
            // Set stateful array of challenges
            setArrayOfChallengesIndexObject(auxArrayOfChallengesIndexObject)

            setRefreshing(false)
        }).catch((error)=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
            console.error('Error fetching data:', error)
        })
    }

    async function initialiseChallengeData(){
        // Save last used arguments to be able to reuse them for infinite scrolling
        lastUsedFetchChallengesArgumentsRef.current = {...{orderBy:'likeCount',limit:10,descending:true}}
        await fetchChallenges({orderBy:'likeCount',limit:10,descending:true}).catch(()=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
        })

        // Select randomly a challenge to feature it
        const randomArrayIndex = Math.floor(Math.random()*arrayOfChallengesIndexObject.length)
        const randomChallengeIndexObject: challengeOfTheDayInterface = arrayOfChallengesIndexObject[randomArrayIndex]
        // If a daily featured challenge already exists in the database, fetch and use that one, if it doesn't exist, use the one chosen randomly and upload it to the database
        fetchOrCreateChallengeOfTheDay(randomChallengeIndexObject).then(async (challengeIndexObject:challengeOfTheDayInterface)=>{
            let result = await wasChallengeOfTheDayAlreadyPlayed(challengeIndexObject.challengeIndexUid)
            // if the featured challenge (that rewards x2 the amount of skpoints for the day) was already played, disable it
            if(result!=true){
                setEnablePlayingChallengeOfTheDay(true)
            }
            setFeaturedChallengeData(challengeIndexObject)
        }).catch(()=>{
            Alert.alert('Error','An error occurred while fetching the featured challenge of the day',[{text:'OK',style:'default'}])
        })
    }

    useEffect(() => {
        initialiseChallengeData()
    },[])

    useEffect(() => {        
        // this useEffect will fire on the first render and then on each change of the category, since 
        // ...on the first render the category (the state that contains it) is undefined, do not call the query
        if ('challengeCategoryLabel' in homescreenFilterCategorySharedValue ){
            if(homescreenFilterDifficultySharedValue){
                // Both the category and difficulty filters are enabled
                // Save last used arguments to be able to reuse them for infinite scrolling
                lastUsedFetchChallengesArgumentsRef.current = {...{where:{key:'category',comparisonSymbol:'==',comparisonValue:homescreenFilterCategorySharedValue.challengeCategoryLabel},orderBy:'difficulty',whereTwo:{key:'difficulty',comparisonSymbol:'==',comparisonValue:homescreenFilterDifficultySharedValue}}}
                fetchChallenges({where:{key:'category',comparisonSymbol:'==',comparisonValue:homescreenFilterCategorySharedValue.challengeCategoryLabel},orderBy:'difficulty',whereTwo:{key:'difficulty',comparisonSymbol:'==',comparisonValue:homescreenFilterDifficultySharedValue}}).catch(()=>{
                    Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
                })
            }else{
                // Only the category filter is enabled
                // Save last used arguments to be able to reuse them for infinite scrolling
                lastUsedFetchChallengesArgumentsRef.current = {...{where:{key:'category',comparisonSymbol:'==',comparisonValue:homescreenFilterCategorySharedValue.challengeCategoryLabel},orderBy:'category'}}
                fetchChallenges({where:{key:'category',comparisonSymbol:'==',comparisonValue:homescreenFilterCategorySharedValue.challengeCategoryLabel},orderBy:'category'}).catch(()=>{
                    Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
                })
            }
        }else if (homescreenFilterDifficultySharedValue){
            // Only the difficulty filter is enabled
            // Save last used arguments to be able to reuse them for infinite scrolling
            lastUsedFetchChallengesArgumentsRef.current = {...{where:{key:'difficulty',comparisonSymbol:'==',comparisonValue:homescreenFilterDifficultySharedValue},orderBy:'difficulty'}}
            fetchChallenges({where:{key:'difficulty',comparisonSymbol:'==',comparisonValue:homescreenFilterDifficultySharedValue},orderBy:'difficulty'}).catch(()=>{
                Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
            })
        }
    },[homescreenFilterCategorySharedValue,homescreenFilterDifficultySharedValue])

    async function onRefresh(){
        // Reset stateful category filter & difficulty filter
        setHomescreenFilterCategorySharedValue({})
        setHomescreenFilterDifficultySharedValue(null)
        // Save last used arguments to be able to reuse them for infinite scrolling
        lastUsedFetchChallengesArgumentsRef.current = {...{orderBy:'creationDate',limit:10,descending:true}}
        fetchChallenges({orderBy:'creationDate',limit:10,descending:true}).catch(()=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
        })
    }

    async function handleEndOfScreenReached(){
        setInfiniteScrollingIsFetchingNewData(true)
        if(lastUsedFetchChallengesArgumentsRef.current && lastVisibleFirestoreDocumentSnapshotRef.current){
            await fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION, {...lastUsedFetchChallengesArgumentsRef.current,startAfter:lastVisibleFirestoreDocumentSnapshotRef.current}).then((querySnapshot)=>{
                // Check if there are more challenges to load
                if(querySnapshot.docs.length>=1){
                    const fetchedArrayOfChallengesIndexObject = querySnapshot.docs.map(document => ({...document.data(),challengeIndexUid:document.id}))            
                    // Save the last document retrieved so Firebase can use it as a pagination delimiter for infinite scrolling. Reference: https://firebase.google.com/docs/firestore/query-data/query-cursors
                    lastVisibleFirestoreDocumentSnapshotRef.current = querySnapshot.docs[querySnapshot.docs.length-1]           
                    // Set stateful array of challenges
                    setArrayOfChallengesIndexObject((oldData) => [...oldData, ...fetchedArrayOfChallengesIndexObject])
                    setInfiniteScrollingIsFetchingNewData(false)
                }else{
                    // If there are no more new documents left, add a 2.5 second delay to finish the loading animation to give proper visual feedback to the user
                    setTimeout(()=>{
                        setInfiniteScrollingIsFetchingNewData(false)
                    },2000)
                }
            }).catch((error)=>{
                Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
                console.error('Error fetching data:', error)
            })
            
        }else{
            Alert.alert('Error','An error occurred while loading more challenges',[{text:'OK',style:'default'}])
        }
    }

    let colorMode = useColorScheme()

    const styles = StyleSheet.create({
        containerView:{
            margin:0, 
            backgroundColor:theme.colors.background, 
            flex:1, 
            minHeight:'100%',
            display:'flex'
        },
        featuredChallengeSectionContainer:{
            flex:1,
            display:'flex',
            paddingHorizontal:'5%',
            paddingVertical:'2%',
            justifyContent:'center',
            minHeight:110,
            backgroundColor:theme.colors.secondary
        },
        featuredChallengeCommonTextStyle:{
            color:colorMode==='dark'?'black':'white',
        },
        featuredChallengeContainer:{
            marginTop:10,
            flex:1,
        },
        mainBodyContainer:{
            flex:4,
        },
        bodyScrollView:{
            display:'flex',
            paddingTop:'2%', 
            paddingHorizontal:'5%',
            paddingBottom:'2%',
            minHeight:'100%',
            gap:15
        },
        filtersContainer:{
            display:'flex',
            flexDirection:'row',
            marginTop:7,
            marginBottom:5,
            alignItems:'stretch',
            alignContent:'stretch',
            justifyContent:'space-around',
            paddingHorizontal:'2%',
            gap:10
        },
        categoryFilterContainer:{
            flex:1,
        },
        difficultyFilterContainer:{
            flex:1,
        }
    })
    
    // This function is necessary to prevent React from caching the skChallenge data reflected in the GameCard component
    function hashCode(str) {
        let hash = 0;
        if (str.length === 0){ return hash}
      
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = (hash << 5) - hash + char
        }
      
        return hash
    }
    
    return(
       
            <View style={styles.containerView}>
                    <View style={styles.featuredChallengeSectionContainer}>
                        <Text style={styles.featuredChallengeCommonTextStyle} h4>Featured challenge ⭐</Text>
                        <Text style={styles.featuredChallengeCommonTextStyle}>Play it now and get rewarded double SKPoints 🥇</Text>
                        <View style={styles.featuredChallengeContainer}>
                        {featuredChallengeData===null?
                            <GameCard key={1} isDisabled={enablePlayingChallengeOfTheDay===true?false:true} isLoading={true} isFeatured={true} style={{flex:1}} challengeIndexData={null} navigation={props.navigation} route={props.route}/>
                            :
                            <GameCard key={2} isDisabled={enablePlayingChallengeOfTheDay===true?false:true} isLoading={false} isFeatured={true} style={{flex:1}} challengeIndexData={featuredChallengeData} navigation={props.navigation} route={props.route}/>
                        }
                        </View>
                    </View>
                    <Divider/>
                    <View style={styles.mainBodyContainer}>
                        <View style={styles.filtersContainer}>
                            <View style={styles.categoryFilterContainer}>
                                <FilterCategoryComponent></FilterCategoryComponent>
                            </View>
                            <View style={styles.difficultyFilterContainer}>
                                <FilterDifficultyComponent></FilterDifficultyComponent>
                            </View>
                        </View>
                        <ScrollView persistentScrollbar={true} showsVerticalScrollIndicator={true} contentContainerStyle={styles.bodyScrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}
                            // end of screen detection taken and adapted from https://stackoverflow.com/questions/41056761/detect-scrollview-has-reached-the-end
                            onScroll={(event) => {
                                const offsetVertical = event.nativeEvent.contentOffset.y
                                const contentHeight = event.nativeEvent.contentSize.height
                                const scrollViewHeight = event.nativeEvent.layoutMeasurement.height
                                const reachedEnd = offsetVertical + scrollViewHeight >= contentHeight - 100
                                if (reachedEnd && !infiniteScrollingIsFetchingNewData) {handleEndOfScreenReached()}
                            }}
                        >
                            {   
                                arrayOfChallengesIndexObject.map((data,index)=>(
                                    // avoid showing the featured challenge of the day in the scrollview
                                    (featuredChallengeData!=null && featuredChallengeData.hasOwnProperty('challengeIndexUid') && data.challengeIndexUid!=featuredChallengeData.challengeIndexUid)?<GameCard key={hashCode(data.challengeIndexUid)} challengeIndexData={data} navigation={props.navigation} route={props.route}/>:null
                                ))
                            }
                            {arrayOfChallengesIndexObject.length==0?
                            <View>
                                <Text style={{alignSelf:'center',color:theme.colors.grey0}}>No SK Challenges found with the current filters</Text>
                                <Text style={{alignSelf:'center',color:theme.colors.grey0}}>Pull to reset them</Text>
                            </View>:null}
                            {infiniteScrollingIsFetchingNewData && <ActivityIndicator style={{ marginVertical: 20 }} />}
                        </ScrollView>
                    </View>
            </View>
        
    )
}