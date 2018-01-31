import React from 'react';
import { StyleSheet, Text, View, Image, Slider, TouchableWithoutFeedback } from 'react-native';
import { ScreenStyles } from './ScreenStyles';
import TimerText from '../components/TimerText';

import Constants from '../constants';



export default class TimerScreen extends React.Component {
  state = {
    tapped: 0,
    tapTime: 0
  }

  _onChange = (t) => {
    this.props.onDurationChanged(t);
  }

  _onTapped = () => {
    const {onCancel} = this.props;
    const {tapTime, tapped} = this.state;
    
    if (tapped > 2) {
      return onCancel();
    }

    const now = new Date().getTime();
    const elapsed = now - tapTime;
    if ( elapsed < 3000 ) {
      this.setState({
        tapped: (tapped + 1)
      });
    } else {
      this.setState({
        tapped: 0,
        tapTime: now
      });
    }
  }

  render() {
    const {phaseOneTime, phaseTwoTime, elapsed} = this.props;

    let timeRemaining = Math.floor(phaseOneTime - elapsed);

    let backgroundColor = '#fff45f';
    let phaseName = 'Research Phase';
    let phaseDesc = 'Reporters CAN draw cards.';

    if (timeRemaining <= 0) {
      timeRemaining = Math.floor(phaseOneTime + phaseTwoTime - elapsed);
      phaseName = 'Story Building Phase';
      phaseDesc = 'Reporters CAN NOT draw cards.';
      backgroundColor = '#f15b40';
    }

    return (
      <TouchableWithoutFeedback onPress={this._onTapped}>
        <View style={[styles.container, {backgroundColor}]} >
          <View style={styles.header} >
            <Text style={styles.textSmall} > {phaseName} </Text>
          </View>
          <View style={styles.textPhaseName} >
            <TimerText time={timeRemaining} />
          </View>
          <View style={styles.footer} >
            <Text style={styles.textSmall} > {phaseDesc} </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...ScreenStyles.container,
    paddingTop: 20,
    paddingBottom: 20
  },
  textPhaseName: {
    ...ScreenStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'montserrat',
    color: '#1a1331',
    textShadowOffset: {width: -2,height: 2},
    textShadowColor: 'white',
    fontSize: 40,
    flex: 3
  },
  textSmall: {
    textAlign: 'center',
    fontFamily: 'montserrat-light',
    color: '#1a1331',
    textShadowOffset: {width: -1,height: 1},
    textShadowColor: 'white',
    fontSize: 30
  },
  header: {
    ...ScreenStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  footer: {
    ...ScreenStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }
});
