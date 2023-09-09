import 'react-native-gesture-handler'
import { View,ScrollView, RefreshControl} from 'react-native'
import { useTheme} from '@rneui/themed'
import {useState, useEffect, useCallback, useRef} from 'react'
import {GameCard} from '../components/index'
import { fetchDocumentsFromCollection } from '../components/utils/firebaseUtils/fetchDocumentsFromCollection'
import { FetchDocumentsFromCollectionOptionsInterface } from '../components/utils/firebaseUtils/types/fetchDocumentsFromCollectionOptionsInterface'
import FIREBASE_COLLECTIONS from '../components/utils/firebaseUtils/constants/firebaseCollections'

export default function Homescreen(props){    
    
    const [arrayOfChallengesIndexObject, setArrayOfChallengesIndexObject] = useState([])
    const arrayOfChallengesIndexUids = useRef(null)

    const fetchChallenges = async (options?:FetchDocumentsFromCollectionOptionsInterface) => {
        fetchDocumentsFromCollection(FIREBASE_COLLECTIONS.CHALLENGES_INDEX_COLLECTION, options).then((querySnapshot)=>{
            const auxArrayOfChallengesIndexObject = querySnapshot.docs.map(document => document.data())
            arrayOfChallengesIndexUids.current = querySnapshot.docs.map(document => document.id)
            setArrayOfChallengesIndexObject(auxArrayOfChallengesIndexObject)
        }).catch((error)=>{
            console.error('Error fetching data:', error)
        })
    }

    useEffect(() => {        
        fetchChallenges({orderBy:'likeCount',limit:3,descending:true})
    },[])

    const { theme, updateTheme } = useTheme()
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchChallenges({orderBy:'creationDate',limit:3,descending:true})
        setRefreshing(false)
    }, [])

    return(        
        <View style={{margin:0, backgroundColor:theme.colors.background, flex:1, minHeight:'100%'}}>
            <ScrollView contentContainerStyle={{display:'flex',paddingTop:'2%', paddingHorizontal:'5%',paddingBottom:'1%',minHeight:'100%'}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}>
                {                    
                    arrayOfChallengesIndexObject.map((data,index)=>( 
                        <GameCard style={{marginTop:'3%'}} key={index} challengeIndexUid={arrayOfChallengesIndexUids.current[index]} challengeIndexData={data} navigation={props.navigation} route={props.route}/>
                    ))
                }
            </ScrollView>
        </View>
    )
}