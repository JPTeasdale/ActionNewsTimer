import React from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback } from 'react-native';


export default class TimerScreen extends React.Component {
  render() {
    const {onRestart} = this.props;

    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.text} > {'on the air'} </Text>
        </View>
        <TouchableWithoutFeedback onPress={onRestart} >
          <Image 
            style={styles.image}
            source={require('../assets/button-restart.png')} />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1431'
  },
  text: {
    fontFamily: 'montserrat-light',
    fontSize: 90,
    flex: 0,
    color: 'white'
  },
  image: {
    maxWidth: '90%',
    resizeMode: 'contain'
  }
});
