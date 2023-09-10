import { useColorScheme, View, Text, StyleSheet} from 'react-native'
import { DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer'
import { Button, Divider} from '@rneui/themed'
import { useEffect, useState } from 'react'
import { Image } from '@rneui/base'
import {firebase} from '../../firebaseConfig'
import { useUserMetadataSharedValue } from '../context/UserMetadataProvider'
import { UserDocumentInterface } from './utils/firebaseUtils/types/firebaseDocumentInterfaces'
import BoldText from './utils/BoldText'
import Images from '../../src/assets/images/exports'
import FIREBASE_COLLECTIONS from './utils/firebaseUtils/constants/firebaseCollections'
// Line taken from: https://stackoverflow.com/questions/29290460/use-image-with-a-local-file
const DEFAULT_IMAGE = Image.resolveAssetSource(Images.defaultProfileAvatar).uri

export default function CustomDrawerContent(props){

    const { sharedValue: userMetadataSharedValue } = useUserMetadataSharedValue()
    let colorMode = useColorScheme();

    const [statefulDocumentData, setStatefulDocumentData] = useState<UserDocumentInterface>(userMetadataSharedValue.userDataDocument)

    function successfulUserDocumentSnapshot(userDocumentSnapshot){
        if(userDocumentSnapshot.exists){
            console.log("userDocumentSnapshot.exists",userDocumentSnapshot.exists)
            setStatefulDocumentData(userDocumentSnapshot.data())
        }
    }

    // This useEffect will trigger on the first time and register a firebase onSnapshot event listener that will execute "successfulUserDocumentSnapshot" whenever there's a change to the document. This is necessary to keep the number of the skPoints shown in the sidebar or drawer updated at all times
    useEffect(()=>{
        const user = firebase.auth().currentUser
        // sanity check that the user is logged in
        if (user !== null) {
            // register the event listener to keep the skPoints shown updated 
            firebase.firestore().collection(FIREBASE_COLLECTIONS.USERS_COLLECTION).doc(user.uid).onSnapshot(successfulUserDocumentSnapshot)
        }
    },[])

    const styles = StyleSheet.create({
        drawerContainerView: {
            margin:0,
            paddingTop:0,
            flex: 1,             
            backgroundColor: colorMode==='dark'?'black':'white',            
            display:'flex'
        },
        userDataContainer:{
            backgroundColor:'white',
            padding: 20,
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            alignContent:'center',
            justifyContent:'center',
        },
        userImage:{
            flex:1,
            height: 80, 
            width: 80, 
            borderRadius: 40,             
            
        },
        userTextContainerView:{
            flex:2,
            //backgroundColor:'yellow',
            display:'flex',
            flexDirection:'column',                    

            //horizontal center
            alignItems:'center',
            //alignContent:'center',

            //vertical center
            justifyContent:'space-between'
        },
        nickNameAndPointsContainer:{
            flex:1,
            display:'flex'
        },
        userNameText:{
            //backgroundColor:'red',
            flex:1,
            color: '#fff',
            fontSize: 18,
            fontFamily: 'Roboto-Medium',
            // horizontal
            //alignSelf:'flex-end',
            // vertical
            //justifySelf:'flex-end'
            //marginBottom: 5,
        },        
        userNicknameContainer:{
            flex:1,
        },
        userSubtitleBodyContainer:{
            //backgroundColor:'lime',
            flex:1,
            //color: '#fff',
            display:'flex',
            flexDirection:'row',
            /* fontFamily: 'Roboto-Regular', */
            //marginRight: 5
        }
    });
    
        
    function handleSignOut () {
        //setLoadingStatus(true)
        firebase.auth()
            .signOut()
            .then(() => {
            //setLoadingStatus(false)
            })
            .catch(error => {/* setLoadingStatus(false); */alert(error.message)})
    }        
        
    return(
        <View style={styles.drawerContainerView}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0}}>                    
                <View style={styles.userDataContainer}>                        
                    <Image source={{uri:DEFAULT_IMAGE}} style={styles.userImage}/>                            
                    <View style={styles.userTextContainerView}>
                        <View style={styles.userNameText}>
                            <Text>
                                Greetings {statefulDocumentData.name}!
                            </Text>
                        </View>
                        <View style={styles.nickNameAndPointsContainer}>
                            <View style={styles.userNicknameContainer}>
                                <BoldText style={{color:'black'}}>{statefulDocumentData.nickname}</BoldText>
                            </View>
                            <View style={styles.userSubtitleBodyContainer}>                                
                                <BoldText style={{color:'black'}}>{statefulDocumentData.skPoints} SkPoints</BoldText>                                
                            </View>
                        </View>
                    </View>
                </View>
                <Divider/>
                <DrawerItemList {...props} />
                <Button containerStyle={{marginTop:20, marginHorizontal:5}} onPress={handleSignOut}>Log out</Button>                
            </DrawerContentScrollView>
            
        </View>
    )
}