import React from 'react';
import { StyleSheet, Text, View, Image, Slider, TouchableWithoutFeedback } from 'react-native';
import { Duration } from 'luxon';

import Constants from '../constants';

function format(seconds) {
  var hours   = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var seconds = seconds - (hours * 3600) - (minutes * 60);
  return `${minutes}:${seconds}`
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
      elasped = (new Date().getTime() - startTime);
      const percentComplete = (elasped / fadeTimeMS);
      const value = percentComplete * startValue;

      this.props.onDurationChanged(value);
      this.slider.setNativeProps({value});

      await sleep(5);
    }
    this.slider.setNativeProps({value: startValue});
    this.setState({ready: true});
  }

  _onChange = (t) => {
    this.slider.setNativeProps({value: t});
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
    const {phaseOneTime, phaseTwoTime, percent} = this.props;

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
          <View style={styles.textGroup} >
            <Text style={styles.smallText} > {`Choose Game Duration`} </Text>
            <Text style={styles.text} > {time} </Text>
            <Text style={styles.smallText} >
              {`Research Phase: ${pOne}     Story Building Phase: ${pTwo}`}
            </Text>
            <Text style={styles.smallText} > {diffifulty} </Text>
          </View>
        </TouchableWithoutFeedback>

        <Slider
          ref={s => this.slider = s}
          style={styles.range}
          trackImage={require('../assets/range-track.png')}
          thumbImage={require('../assets/range-thumb.png')}
          minimumValue={0}
          maximumValue={1}
          value={percent}
          onValueChange={this._onChange} />

        <TouchableWithoutFeedback onPress={this._onStart} >
          <Image 
            style={styles.image}
            source={require('../assets/button-start.png')} />
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1b1431'
  },
  smallText: {
    textAlign: 'center',
    fontFamily: 'montserrat-light',
    color: 'white',
    margin: 10,
  },
  text: {
    textAlign: 'center',
    fontFamily: 'montserrat-bold',
    fontSize: 60,
    margin: 10,
    color: 'white'
  },
  range: {
    width: '100%',
  },
  image: {
    maxWidth: '90%',
    resizeMode: 'contain'
  }
});
