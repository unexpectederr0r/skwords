import { View,useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function StatsLineChartComponent({data,...props}){
    /*
    ================================
    ATTENTION: All code in this React Component is based on the template from the documentation of the react native library "react-native-gifted-charts" and can be found in the following website: https://gifted-charts.web.app
    ================================
    */
    const {height, width} = useWindowDimensions()    
    return(
        <View style={props.style}>
            <LineChart
                areaChart
                hideDataPoints
                isAnimated
                animationDuration={1200}
                startFillColor="#0BA5A4"
                startOpacity={1}
                endOpacity={0.3}
                initialSpacing={0}
                data={data}
                spacing={Math.floor(Math.floor(width*0.9)/data.length)}
                thickness={5}
                hideRules
                yAxisColor="#0BA5A4"
                showVerticalLines
                verticalLinesColor="rgba(14,164,164,0.5)"
                xAxisColor="#0BA5A4"
                color="#0BA5A4"
            />
        </View>
    )
}