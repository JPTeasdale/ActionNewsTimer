import React from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback } from 'react-native';
import { Duration } from 'luxon';

import Slider from '../components/Slider';
import Constants from '../constants';
import { ScreenStyles } from './ScreenStyles';

function format(seconds) {
  var hours   = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var seconds = seconds - (hours * 3600) - (minutes * 60);
  return `${minutes}:${seconds}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class TimerScreen extends React.Component {
  state = {
    ready: false
  }

  componentDidMount() {
    this.animateSliderIntoPosition();
  }

  async animateSliderIntoPosition () {
    const fadeTimeMS = 1000;
    const startValue = 0.5;

    let elasped = 0;
    const startTime = new Date().getTime();
    while (elasped < fadeTimeMS) {
      const now = new Date().getTime();
      elasped = ( now - startTime);
      const percentComplete = (elasped / fadeTimeMS);
      const value = percentComplete * startValue;

      this.props.onDurationChanged(value);
      await sleep(5);
    }

    this.setState({
      ready: true
    });
  }

  _onChange = (t) => {
    this.props.onDurationChanged(t);
  }

  _onStart = (t) => {
    const {ready} = this.state;
    if (ready) {
      this.props.onStart();
    }
  }

  _onIncrement = () => {
    const {percent} = this.props;
    if (percent > 0.80) {
      this._onChange(0);
    } else if (percent > 0.55) {
      this._onChange(1);
    } else if (percent > 0.45) {
      this._onChange(0.8);
    } else if (percent > 0.2) {
      this._onChange(0.5);
    } else {
      this._onChange(0.25);
    }
  }

  render() {
    const {phaseOneTime, phaseTwoTime, percent, videoHeight, videoWidth} = this.props;
    const totalTime = phaseOneTime + phaseTwoTime;

    let diffifulty = 'Crazy Hard';
    if (totalTime > Constants.BeginnerThreshold) {
      diffifulty = 'Beginner';
    } else if (totalTime > Constants.EasyThreshold) {
      diffifulty = 'Easier';
    } else if (totalTime > Constants.MediumThreshold) {
      diffifulty = 'Normal';
    } else if (totalTime > Constants.HardThreshold) {
      diffifulty = 'Hard';
    }

    const time = Duration.fromMillis(totalTime * 1000).toFormat("m 'min' ss 'sec'");
    const pOne = Duration.fromMillis(phaseOneTime * 1000).toFormat("m:ss");
    const pTwo = Duration.fromMillis(phaseTwoTime * 1000).toFormat("m:ss");
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this._onIncrement} >
          <View style={styles.centeredRow} >
            <Text style={styles.smallText} > {`Choose Game Duration`}  </Text>
            <Text style={styles.text} >
                {time}
            </Text>
            <Text style={styles.smallText} >
              {`Research Phase: ${pOne}     Story Building Phase: ${pTwo}`}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.sliderRow}>
          <Slider
            thumbImage={Constants.Images.RangeThumb}
            minimumTrackImage={Constants.Images.RangeMinSlider}
            minimumValue={0}
            maximumValue={1}
            value={percent}
            onValueChange={this._onChange} />
        </View>
        <TouchableWithoutFeedback onPress={this._onStart}  >
          <View style={styles.buttonView}>
            <Image style={styles.buttonImage} source={Constants.Images.ButtonStart} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...ScreenStyles.container,
    paddingTop: 20,
    width: '100%',
    justifyContent: 'space-around'
  },
  centeredRow: {
    ...ScreenStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%'
  },
  sliderRow: {
    ...ScreenStyles.row,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10
  },
  smallText: {
    textAlign: 'center',
    fontFamily: 'montserrat-light',
    color: 'white',
    textShadowColor: '#fff45f',
    textShadowOffset: {width: -0.5,height: 0.5},
  },
  text: {
    textAlign: 'center',
    fontFamily: 'montserrat-bold',
    fontSize: 60,
    color: '#fff45f',
    textShadowColor: 'white',
    textShadowOffset: {width: -1,height: 1}
  },
  buttonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonImage: {
    resizeMode: 'contain',
    width: '90%'
  }
});
