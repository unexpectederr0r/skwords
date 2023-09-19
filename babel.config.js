// Reference: https://www.npmjs.com/package/react-native-dotenv
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    //plugins: ['react-native-reanimated/plugin',["module:react-native-dotenv"]],
    plugins: ['react-native-reanimated/plugin'],
  }
}
