import React from 'react';
import { StyleSheet, View, Dimensions, StatusBar} from 'react-native';
import { AppLoading, Asset, Font, Video} from 'expo';

import Constants from './constants';
import SetupScreen from './screens/SetupScreen';
import TimerScreen from './screens/TimerScreen';
import CompleteScreen from './screens/CompleteScreen';

const INITIAL_STATE = {
  phaseOneTime: 90,
  phaseTwoTime: 60,
  complete: false,
  started: false,
  splash: true,
  phaseOneComplete: false,
  finalCountdownStarted: false,
  elapsed: 0,
  percent: 0
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class App extends React.Component {
  state = {
    ...INITIAL_STATE
  }

  componentDidMount() {
    this._loadAssets();
  }

  componentWillUnmount() {
    this.loopA.stopAsync();
    this.loopB.stopAsync();
    this.video.stopAsync();
  }

  async _loadAssets() {
    const loopA = new Expo.Audio.Sound();
    const loopB = new Expo.Audio.Sound();

    try {
      await loopA.loadAsync(
        require('./assets/news-loop-a.mp3'),
        Constants.InitialAudioStatus
      );
      await loopB.loadAsync(
        require('./assets/news-loop-b.mp3'),
        Constants.InitialAudioStatus
      );
      await Font.loadAsync({
        'montserrat-bold': require('./assets/fonts/Montserrat-Black.ttf'),
        'montserrat': require('./assets/fonts/Montserrat-Bold.ttf'),
        'montserrat-light': require('./assets/fonts/Montserrat-Regular.ttf')
      });
    } catch (err) {
      console.warn("error loading sounds: ", err)
      return;
    }

    this.loopA = loopA;
    this.loopB = loopB;

    this.setState({
      loaded: true
    });
  }

  hideSplash = () => {
    this.setState({splash: false});
  }

  reset = () => {
    this.setState(INITIAL_STATE);
  }

  async startGame () {
    const {started, phaseOneTime, phaseTwoTime} = this.state;
    if (started) {
      return;
    }

    const totalTime = phaseOneTime + phaseTwoTime;
    const videoStartTime = totalTime - Constants.VideoLength;
    const fadeStartTime = (videoStartTime - Constants.FadeDuration);
    
    const instance = {
      started: false,
      complete: false,
      phaseOneComplete: false,
      finalCountdownStarted: false,
      elapsed: 0
    };

    await this.loopA.setVolumeAsync(1);
    await this.loopB.setVolumeAsync(0);
    
    const startTime = new Date().getTime();
    while (instance.elapsed < totalTime) {
      instance.elapsed = (new Date().getTime() - startTime)/1000;
      if (!instance.started) {
        this.loopA.playFromPositionAsync(0);
        this.loopB.playFromPositionAsync(0);
        instance.started = true;
      } else if (!instance.finalCountdownStarted && !instance.phaseOneComplete && instance.elapsed > phaseOneTime ) {
        await this.loopB.setVolumeAsync(1);
        this.loopA.stopAsync();
        instance.phaseOneComplete = true;
      } else if (instance.elapsed > fadeStartTime && instance.elapsed < videoStartTime) {
        const val = 1 - (( instance.elapsed - fadeStartTime ) / Constants.FadeDuration);
        this.loopA.setVolumeAsync(val);
        this.loopB.setVolumeAsync(val);
      } else if (!instance.finalCountdownStarted && instance.elapsed > videoStartTime ) {
        this.loopA.stopAsync();
        this.loopB.stopAsync();
        this.video.playFromPositionAsync(0);
        instance.finalCountdownStarted = true;
      } else if (instance.elapsed > totalTime) {
        this.loopA.stopAsync();
        this.loopB.stopAsync();
      }
      this.setState(instance);
      await sleep(100);
    }
  }

  onStart = () => {
    this.startGame();
  }

  onDurationChanged = (percent) => {
    this.setState({
      phaseOneTime: Constants.MinPhaseOne + Math.floor((Constants.MaxPhaseOne - Constants.MinPhaseOne) * percent),
      phaseTwoTime: Constants.MinPhaseTwo + Math.floor((Constants.MaxPhaseTwo - Constants.MinPhaseTwo) * percent),
      percent
    });
  }

  _onVideoPlaybackUpdate = (playbackStatus) => {
    if (playbackStatus.didJustFinish) {
      this.setState({complete: true});
    }
  };

  render() {
    const { loaded, splash, started, finalCountdownStarted, elapsed, complete,
      phaseOneTime, phaseTwoTime, percent } = this.state;
    const window = Dimensions.get('window');
    const videoWidth = (window.width > window.height) ?  window.width : window.height;


    if (!loaded) {
      return (
        <AppLoading
          startAsync={this._loadAssets}
          onFinish={() => this.setState({ loaded: true })}
          onError={console.warn} />
      );
    }
    
    let screen;
    if (complete) {
      screen = (
        <CompleteScreen onRestart={this.reset} />
      );
    } else if (!started) {
      screen = (
        <SetupScreen
          phaseOneTime={phaseOneTime}
          phaseTwoTime={phaseTwoTime}
          percent={percent}
          onStart={this.onStart}
          onDurationChanged={this.onDurationChanged} />
      );
    } else if (!finalCountdownStarted) {
      screen = (
        <TimerScreen 
          phaseOneTime={phaseOneTime}
          phaseTwoTime={phaseTwoTime}
          elapsed={elapsed}/>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Video
          ref={v => this.video = v}
          source={require('./assets/action-news-intro.mov')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          onPlaybackStatusUpdate={this._onVideoPlaybackUpdate}
          style={{
            zIndex: 0,
            width: videoWidth,
            height: videoWidth / (16 / 9)
          }} />
          {screen}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1431',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
