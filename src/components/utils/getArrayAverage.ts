
// This function was COPIED FROM https://stackoverflow.com/questions/29544371/finding-the-average-of-an-array-using-js
export default function getArrayAverage(array){
    // sum the values of the array, then divide the result by the array's length
    return array.reduce((a, b) => a + b) / array.length
}