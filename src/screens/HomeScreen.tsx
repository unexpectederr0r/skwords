import { useTheme } from '@rneui/themed'
import { useEffect, useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import 'react-native-gesture-handler'
import FilterCategoryComponent from '../components/FilterCategoryComponent'
import { GameCard } from '../components/index'
import FIREBASE_COLLECTIONS from '../components/utils/firebaseUtils/constants/firebaseCollections'
import { fetchDocumentsFromCollection } from '../components/utils/firebaseUtils/fetchDocumentsFromCollection'
import { FetchDocumentsFromCollectionOptionsInterface } from '../components/utils/firebaseUtils/types/fetchDocumentsFromCollectionOptionsInterface'
import { useHomescreenFilterCategorySharedValue } from '../context/HomescreenFilterCategorySharedValueProvider'

export default function Homescreen(props){    
    
    const [arrayOfChallengesIndexObject, setArrayOfChallengesIndexObject] = useState([])
    
    const { theme, updateTheme } = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const { sharedValue: homescreenFilterCategorySharedValue, setSharedValue: setHomescreenFilterCategorySharedValue} = useHomescreenFilterCategorySharedValue()

    const fetchChallenges = async (options?:FetchDocumentsFromCollectionOptionsInterface) => {
        setRefreshing(true)
        fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION, options).then((querySnapshot)=>{
            const auxArrayOfChallengesIndexObject = querySnapshot.docs.map(document => ({...document.data(),challengeIndexUid:document.id}))            
            setArrayOfChallengesIndexObject(auxArrayOfChallengesIndexObject)
            setRefreshing(false)
        }).catch((error)=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
            console.error('Error fetching data:', error)
        })
    }

    useEffect(() => {
        fetchChallenges({orderBy:'likeCount',limit:10,descending:true}).catch(()=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
        })
    },[])

    useEffect(() => {        
        // this useEffect will fire on the first render and then on each change of the category, since 
        // ...on the first render the category (the state that contains it) is undefined, do not call the query
        if ('challengeCategoryLabel' in homescreenFilterCategorySharedValue){
            fetchChallenges({where:{key:'category',comparisonSymbol:'==',comparisonValue:homescreenFilterCategorySharedValue.challengeCategoryLabel},orderBy:'category'}).catch(()=>{
                Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
            })
        }        
    },[homescreenFilterCategorySharedValue])

    async function onRefresh(){
        setHomescreenFilterCategorySharedValue({})
        fetchChallenges({orderBy:'creationDate',limit:10,descending:true}).catch(()=>{
            Alert.alert('Error','An error occurred while fetching the challenges from the database',[{text:'OK',style:'default'}])
        })
    }

    const styles = StyleSheet.create({
        containerView:{
            margin:0, 
            backgroundColor:theme.colors.background, 
            flex:1, 
            minHeight:'100%'
        },
        bodyScrollView:{
            display:'flex',
            paddingTop:'2%', 
            paddingHorizontal:'5%',
            paddingBottom:'1%',
            minHeight:'100%',
            gap:15
        },
        categoryFilterContainer:{
            marginTop:'2%',
            width:'50%', 
            minWidth:'50%',
            maxWidth:'50%',
            marginHorizontal:'5%',
            alignSelf:'flex-start',
            //backgroundColor:'red'
        }
    })
    
    function hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
      
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
        }
      
        return hash;
      }
    return(
       
            <View style={styles.containerView}>
                    <View style={styles.categoryFilterContainer}>
                        <FilterCategoryComponent></FilterCategoryComponent>
                    </View>
                    <ScrollView contentContainerStyle={styles.bodyScrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}>
                        {   
                            arrayOfChallengesIndexObject.map((data,index)=>(
                                <GameCard key={hashCode(data.challengeIndexUid)} challengeIndexData={data} navigation={props.navigation} route={props.route}/>
                            ))
                        }
                    </ScrollView>
            </View>
        
    )
}