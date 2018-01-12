import React from 'react';
import { StyleSheet, Text, View, Image, Slider, TouchableWithoutFeedback } from 'react-native';
import { Duration } from 'luxon';

import Constants from '../constants';

function timeStr(sec) {
  return Duration.fromMillis(sec * 1000).toFormat("m:ss");
}

export default class TimerScreen extends React.Component {
  _onChange = (t) => {
    this.props.onDurationChanged(t);
  }

  render() {
    const {phaseOneTime, phaseTwoTime, elapsed} = this.props;

    let timeRemaining = Math.floor(phaseOneTime - elapsed);

    let phaseName = 'Research Phase';
    let phaseDesc = 'Reporters CAN draw cards.';
    let nextPhase = `+ ${timeStr(phaseTwoTime)} for Story Building Phase`;

    if (timeRemaining <= 0) {
      timeRemaining = Math.floor(phaseOneTime + phaseTwoTime - elapsed);
      phaseName = 'Story Building Phase';
      phaseDesc = 'Reporters CAN NOT draw cards.';
      nextPhase = 'When time is up, you\'re On the Air';
    }

    return (
      <View style={styles.container}>
        <Text style={styles.textPhaseName} > {phaseName} </Text>
        <View>
          <Text style={styles.text} > {timeStr(timeRemaining)} </Text>
          <Text style={styles.textSmall} > {nextPhase} </Text>
        </View>
        <Text style={styles.textSmall} > {phaseDesc} </Text>
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1b1431'
  },
  textPhaseName: {
    textAlign: 'center',
    fontFamily: 'montserrat',
    color: 'white',
    fontSize: 40
  },
  text: {
    textAlign: 'center',
    fontFamily: 'montserrat-bold',
    color: 'white',
    fontSize: 150
  },
  textSmall: {
    textAlign: 'center',
    fontFamily: 'montserrat-light',
    color: 'white',
    fontSize: 20
  }
});
