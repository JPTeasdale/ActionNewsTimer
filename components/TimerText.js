import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Duration } from 'luxon';

function timeStr(sec) {
  return Duration.fromMillis(sec * 1000).toFormat("m:ss");
}

export default class TimerText extends React.Component {
  render() {
    const {time, color, fontSize} = this.props;

    let s = {
      fontSize,
      color,
      textShadowOffset: {
        width: -fontSize/30,
        height: fontSize/30
      }
    }

    if (!time) {
      return null;
    }

    return (
      <Text style={[styles.text, s]} >{timeStr(time)}</Text>
    );
  }
}

TimerText.defaultProps = {
  time: 0,
  color: '#1a1331',
  fontSize: 150
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontFamily: 'montserrat-bold',
    textShadowColor: 'white'
  },
});
