import React from 'react';
import { StyleSheet, View, Dimensions, StatusBar} from 'react-native';
import { AppLoading, Asset, Font, Video} from 'expo';

import Constants from './constants';
import SetupScreen from './screens/SetupScreen';
import TimerScreen from './screens/TimerScreen';
import CompleteScreen from './screens/CompleteScreen';
import StartupScreen from './screens/StartupScreen';

const INITIAL_STATE = {
  phaseOneTime: 90,
  phaseTwoTime: 60,
  complete: false,
  started: false,
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
    ...INITIAL_STATE,
  }

  componentWillMount() {
    this._loadAssets = this._loadAssets.bind(this);
    this._loadFinished = this._loadFinished.bind(this);
  }

  componentWillUnmount() {
    this.loopA.stopAsync();
    this.loopB.stopAsync();
    this.video.stopAsync();
  }

  async _loadAssets() {
    try {
      console.log("loading fonts");
      Font.loadAsync({
        'montserrat-bold': Constants.Fonts.MontserratBlack,
        'montserrat': Constants.Fonts.MontserratBold,
        'montserrat-light': Constants.Fonts.MontserratRegular
      });
    } catch (err) {
      console.warn("error loading fonts: ", err)
      return;
    }

    const promises = [];
    try {
      console.log("loading audio/images/video");
      promises.push(Expo.Asset.loadAsync(
        Constants.Audio.NewsLoopA,
        Constants.Audio.NewsLoopB,
        Constants.Images.RangeSlider,
        Constants.Images.RangeThumb,
        Constants.Images.RangeMinSlider,
        Constants.Video.ActionNewsIntro
      ));
    } catch (err) {
      console.warn("error loading audio/images/video: ", err)
      return;
    }

    return Promise.all(promises);
  }

  async _loadFinished () {
    const loopA = new Expo.Audio.Sound();
    const loopB = new Expo.Audio.Sound();

    try {
      await loopA.loadAsync(
        Constants.Audio.NewsLoopA,
        Constants.InitialAudioStatus
      );

      await loopB.loadAsync(
        Constants.Audio.NewsLoopB,
        Constants.InitialAudioStatus
      );
    } catch (error) {
      console.warn("unable to create sounds")
    }

    this.loopA = loopA;
    this.loopB = loopB;
    this.setState({ loaded: true })
  }

  hideIntro = () => {
    this.setState({hideIntro: true});
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
    console.log("startGame")

    await this.loopA.setVolumeAsync(1);
    await this.loopB.setVolumeAsync(0);
    
    const startTime = new Date().getTime();
    while (instance.elapsed < totalTime) {
      instance.elapsed = (new Date().getTime() - startTime)/1000;
      if (!instance.started) {
        console.log("START")
        await this.loopA.playFromPositionAsync(0);
        await this.loopB.playFromPositionAsync(0);
        instance.started = true;
      } else if (!instance.finalCountdownStarted && !instance.phaseOneComplete && instance.elapsed > phaseOneTime ) {
        await this.loopB.setVolumeAsync(1);
        await this.loopA.stopAsync();
        console.log("------------ ENTER PHASE TWO ------------")
        instance.phaseOneComplete = true;
      } else if (instance.elapsed > fadeStartTime && instance.elapsed < videoStartTime) {
        const val = 1 - (( instance.elapsed - fadeStartTime ) / Constants.FadeDuration);
        console.log("------------ FADE OUT ------------")
        await this.loopA.setVolumeAsync(val);
        await this.loopB.setVolumeAsync(val);
      } else if (!instance.finalCountdownStarted && instance.elapsed > videoStartTime ) {
        console.log("------------ START VIDEO ------------")
        await this.loopA.stopAsync();
        await this.loopB.stopAsync();
        await this.video.playFromPositionAsync(0);
        instance.finalCountdownStarted = true;
      } else if (instance.elapsed > totalTime) {
        console.log("------------ END ------------")
        await this.loopA.stopAsync();
        await this.loopB.stopAsync();
        return;
      }
      
      this.setState(instance);
      await sleep(100);
    }
  }

  onStart = () => {
    console.log('onStart')
    try {
      this.startGame();
    } catch(e) {
      console.warn('Start Game error: ', e);
    }
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
    const { loaded, started, finalCountdownStarted, elapsed, complete,
      phaseOneTime, phaseTwoTime, percent, hideIntro } = this.state;
    const window = Dimensions.get('window');
    const videoWidth = (window.width > window.height) ?  window.width : window.height;


    if (!loaded) {
      return (
        <AppLoading
          startAsync={this._loadAssets}
          onFinish={this._loadFinished}
          onError={console.warn} />
      );
    }

    let screen;
    if (!hideIntro) {
      screen = (
        <StartupScreen onPress={this.hideIntro} />
      );
    } else if (complete) {
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
          source={Constants.Video.ActionNewsIntro}
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
    justifyContent: 'center'
  }
});
