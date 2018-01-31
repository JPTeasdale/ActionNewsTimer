import React from 'react';
import { StyleSheet, View, Image, PanResponder } from 'react-native';

const TrackHeight = 105;
const ThumbWidth = 117;
const ThumbAspect = ThumbWidth / TrackHeight;

export default class Slider extends React.Component {
  state = {
    trackWidth: 0
  }
  
  componentWillMount() {
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this._onStart()
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!

        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {     
        this._onChange(gestureState)
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  _onChange = (move) => {
    const {onValueChange} = this.props;
    const {startWidth} = this.state;
    const newValue = this._widthToValue(startWidth + move.dx);

    onValueChange(newValue);
  }
  
  _onStart = () => {
    const {value} = this.props;
    const startWidth = this._valueToWidth(value);
    this.setState({startWidth})
  }

  _capValue = (v) => {
    const {minimumValue, maximumValue} = this.props;
    if (v > maximumValue) {
      return maximumValue;
    } else if (v < minimumValue) {
      return minimumValue;
    }
    return v;
  }

  _valueToWidth = (v) => {
    const {trackWidth} = this.state;
    return trackWidth * this._computePercent(v);
  }

  _widthToValue = (w) => {
    const {minimumValue, maximumValue} = this.props;
    const {trackWidth} = this.state;

    const percent = w/trackWidth;
    const value = minimumValue + percent * (maximumValue - minimumValue);
    return this._capValue(value);
  }
  
  _computePercent = (value) => {
    const {minimumValue, maximumValue} = this.props;

    const range = maximumValue - minimumValue;
    const cappedValue = this._capValue(value);
    const percent = (cappedValue - minimumValue) / range;

    return percent;
  }

  _onLayout = (evt) => {
    var {height, width} = evt.nativeEvent.layout;
    this.setState({
      trackWidth: width - ThumbWidth,
    });
    this.forceUpdate();
  }

  render() {
    const {thumbImage, minimumTrackImage, value} = this.props;
    const trackWidth = this._valueToWidth(value);

    return (
      <View style={styles.container} onLayout={this._onLayout}>
        <Image source={minimumTrackImage} style={{
          resizeMode: 'stretch',
          height: '100%',
          width: trackWidth
        }} />
        <View {...this._panResponder.panHandlers} style={{height: '100%', flex: 1}} >
          <Image source={thumbImage} style={styles.thumb} />
        </View>
        <View style={{flex: 3, zIndex: -1}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    maxHeight: TrackHeight,
    width: '100%',
    display: 'flex',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  thumb: {
    resizeMode: 'contain',
    height: '100%',
    aspectRatio: ThumbAspect,
    marginLeft: -1
  }
});
