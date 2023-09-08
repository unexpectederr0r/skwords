import { Dialog, Image, Text, Button } from '@rneui/themed'
import { useState } from 'react'
import { View } from 'react-native'

import Images from '../../src/assets/images/exports'

// Line taken from: https://stackoverflow.com/questions/29290460/use-image-with-a-local-file
const DEFAULT_IMAGE = Image.resolveAssetSource(Images.coinBackground).uri

interface componentProps{
    setShowPointsAwardedDialog: Function,
    callbackScrollToFirstPage: Function,
    skPoints: number
}

export default function SkPointsEarnedComponent({setShowPointsAwardedDialog,callbackScrollToFirstPage, skPoints}:componentProps){
    const [dialogIsVisible, setDialogIsVisible] = useState(true)
    return(
        <Dialog isVisible={dialogIsVisible}>
            <View style={{display:'flex', alignItems:'center'}}>
                <Text h3 style={{}}>
                    Congratulations!
                </Text>
                <Text style={{marginTop:'3%'}}>
                    You had earned {skPoints} skPoints
                </Text>
                <Button onPress={()=>{setShowPointsAwardedDialog(false);callbackScrollToFirstPage()}} color={'success'} buttonStyle={{borderRadius:20,paddingHorizontal:'10%'}} containerStyle={{alignSelf:'flex-end', marginTop:'15%',borderRadius:20}}>Finish</Button>
            </View>
        </Dialog>
    )

}