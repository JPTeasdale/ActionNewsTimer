import React from 'react';
import { StyleSheet, Image, View, TouchableWithoutFeedback } from 'react-native';

import Constants from '../constants';


export default class TimerScreen extends React.Component {
  render() {
    const {onPress} = this.props;

    return (
      <TouchableWithoutFeedback onPress={onPress} >
        <View style={styles.container} >
          <Image
            source={Constants.Images.StartupSplash}
            style={styles.backgroundImage} />
        </View>
      </TouchableWithoutFeedback>
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
  backgroundImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    resizeMode: 'cover'
  }
});
