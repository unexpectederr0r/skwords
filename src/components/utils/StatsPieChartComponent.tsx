import { PieChart } from "react-native-gifted-charts"
import { View } from "react-native"
import { Text } from "@rneui/themed"
/*
    ================================
    ATTENTION: All code in this React Component is based on the template from the documentation of the react native library "react-native-gifted-charts" and can be found in the following website: https://gifted-charts.web.app
    ================================
*/
export default function StatsPieChartComponent({orderedArrayOfMostPlayedCategories,...props}){
    /// Keep in mind, the array contains the names of the most played categories ordered in descending order 
    let pieData = []
    let totalSkChallengesPlayed = 0
    for (let index = 0; index < orderedArrayOfMostPlayedCategories.length; index++) {
        switch (index) {
            case 0:
                // this is the skchallenge category most used by the player
                // Keep in mind it can be the most used and the single one since the player is not required to play an X amount of categories
                pieData.push({value: orderedArrayOfMostPlayedCategories[index][1], color: '#009FFF', gradientCenterColor: '#006DFF', focused: true, })
                totalSkChallengesPlayed += orderedArrayOfMostPlayedCategories[index][1]
                break;
            case 1:
                // (if it exist) this is the second most used skchallenge category
                pieData.push({value: orderedArrayOfMostPlayedCategories[index][1], color: '#93FCF8', gradientCenterColor: '#3BE9DE'})
                totalSkChallengesPlayed += orderedArrayOfMostPlayedCategories[index][1]
                break;
            case 2:
                // (if it exist) this is the third most used skchallenge category 
                pieData.push({value: orderedArrayOfMostPlayedCategories[index][1], color: '#BDB2FA', gradientCenterColor: '#8F80F3'})
                totalSkChallengesPlayed += orderedArrayOfMostPlayedCategories[index][1]
                break;
            default:
                // All the other categories (if they exist) that are not in the top 3 most used are display as 'other'
                if(pieData[3]==null){
                    pieData[3] = {value: orderedArrayOfMostPlayedCategories[index][1]}
                    totalSkChallengesPlayed += orderedArrayOfMostPlayedCategories[index][1]
                }else{
                    pieData[3] = {value: pieData[3].value+orderedArrayOfMostPlayedCategories[index][1]}
                    totalSkChallengesPlayed += orderedArrayOfMostPlayedCategories[index][1]
                }
                break;
        }
    }
    // Add the color to the 'other categories' slice of the pie chart if it is defined
    if(pieData[3]!=null){
        pieData[3].color = '#FFA5BA'
        pieData[3].gradientCenterColor = '#FF7F97'
    }

    const renderDot = color => {
        return (
            <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color, marginRight: 10, }} />
        )
    }
    const renderLegendComponent = () => {
        return (
        <>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap:5,}}>
                {pieData[0]?
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20, }}>
                    {renderDot('#006DFF')}
                    <Text>{orderedArrayOfMostPlayedCategories[0][0]}: {Math.floor((pieData[0].value/totalSkChallengesPlayed)*100)}%</Text>
                </View>
                :
                null
                }
                {pieData[1]?
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {renderDot('#3BE9DE')}
                    <Text>{orderedArrayOfMostPlayedCategories[1][0]}: {Math.floor((pieData[1].value/totalSkChallengesPlayed)*100)}%</Text>
                </View>
                :
                null
                }
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center',gap:5}}>
                {pieData[2]?
                <View style={{ flexDirection: 'row', alignItems: 'center',marginRight: 20, }}>
                    {renderDot('#8F80F3')}
                    <Text>{orderedArrayOfMostPlayedCategories[2][0]}: {Math.floor((pieData[2].value/totalSkChallengesPlayed)*100)}%</Text>
                </View>
                :
                null
                }
                {pieData[3]?
                <View style={{flexDirection: 'row', alignItems: 'center', }}>
                    {renderDot('#FFA5BA')}
                    <Text>Others: {Math.floor((pieData[3].value/totalSkChallengesPlayed)*100)}%</Text>
                </View>
                :
                null
                }
            </View>
        </>
        )
    }

    function CenterLabelComponent (){
        return (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                {pieData[0]?
                    <>
                    <Text
                    style={{fontSize: 22, color: 'white', fontWeight: 'bold'}}>
                        {Math.floor((pieData[0].value/totalSkChallengesPlayed)*100)}%
                    </Text>
                    <Text style={{fontSize: 14, color: 'white'}}>{orderedArrayOfMostPlayedCategories[0][0]}</Text>
                    </>
                :
                null
            }
            </View>
            
        )
    }
    return (
            
            <>
                <View style={[{alignItems: 'center'},props.style]}>
                    <PieChart
                        data={pieData}
                        donut
                        showGradient
                        sectionAutoFocus
                        radius={90}
                        innerRadius={60}
                        innerCircleColor={'#232B5D'}
                        centerLabelComponent={CenterLabelComponent}
                />
                </View>
                {renderLegendComponent()}
            </>
    )

}
export {StatsPieChartComponent}