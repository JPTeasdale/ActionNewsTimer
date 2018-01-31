import React from 'react';
import { StyleSheet, View, Image, TouchableWithoutFeedback } from 'react-native';
import { ScreenStyles } from './ScreenStyles';

import Constants from '../constants';

export default class TimerScreen extends React.Component {
  render() {
    const {onRestart} = this.props;

    return (
      <TouchableWithoutFeedback onPress={onRestart} >
        <View style={styles.container} >
          <Image source={Constants.Images.OnTheAirSplash} style={styles.backgroundImage}/>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...ScreenStyles.container,
    backgroundColor: '#1b1431'
  },
  backgroundImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    resizeMode: 'cover'
  }
});
