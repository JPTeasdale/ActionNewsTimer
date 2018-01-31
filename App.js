import React from 'react';
import { StyleSheet, AppState, View, Dimensions, StatusBar, Text } from 'react-native';
import { AppLoading, Asset, Font, Video, KeepAwake } from 'expo';

import Constants from './constants';
import SetupScreen from './screens/SetupScreen';
import TimerScreen from './screens/TimerScreen';
import CompleteScreen from './screens/CompleteScreen';
import StartupScreen from './screens/StartupScreen';

import TimerText from './components/TimerText';

const VideoWidth = 1280;
const VideoHeight = 720;

const defaultPercent = 0.5;

const computePhaseOne = (p) => Constants.MinPhaseOne + Math.floor((Constants.MaxPhaseOne - Constants.MinPhaseOne) * p);
const computePhaseTwo = (p) => Constants.MinPhaseTwo + Math.floor((Constants.MaxPhaseTwo - Constants.MinPhaseTwo)) * p;

const INITIAL_STATE = {
  phaseOneTime: computePhaseOne(defaultPercent),
  phaseTwoTime: computePhaseTwo(defaultPercent),
  complete: false,
  started: false,
  phaseOneComplete: false,
  finalCountdownStarted: false,
  elapsed: 0
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class App extends React.Component {
  state = {
    percent: 0,
    ...INITIAL_STATE
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    this._reset();
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState !== 'active') {
      this._reset();
    }
  }

  _loadAssets = async () => {
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
        Constants.Images.OnTheAirSplash,
        Constants.Video.ActionNewsIntro
      ));
    } catch (err) {
      console.warn("error loading audio/images/video: ", err)
      return;
    }

    return Promise.all(promises);
  }

  _loadFinished  = async () => {
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

  _mountVideo = async (v) =>  {
    this.video = v;
    try {
      await this.video.loadAsync(
        Constants.Video.ActionNewsIntro,
        Constants.InitialVideoStatus
      );
    } catch (e) {
      console.warn("unable to mount video", e)
    }
  }
  
  startGame = () => {
    try {
      this._startGame();
    } catch (e) {
      console.log("GAME ERROR: ", e);
    }
  }

  _startGame = async () => {
    const {started, phaseOneTime, phaseTwoTime} = this.state;

    if (started) {
      return;
    }
    KeepAwake.activate();
    
    const totalTime = phaseOneTime + phaseTwoTime;
    const videoStartTime = totalTime - Constants.VideoLength;
    const fadeStartTime = (videoStartTime - Constants.FadeDuration);

    const phaseTwoFadeInTime = phaseOneTime - Constants.FadeDuration;

    //only switch tracks if there is enough time to fully switch before the fade out begins
    const shouldSwitchTracks = (phaseTwoTime - Constants.VideoLength) > (2*Constants.FadeDuration);
    
    const instance = {
      started: false,
      complete: false,
      phaseOneComplete: false,
      finalCountdownStarted: false,
      elapsed: 0
    };
    console.log("startGame:", shouldSwitchTracks)

    await this.loopA.setVolumeAsync(1);
    await this.loopB.setVolumeAsync(0);
    
    const startTime = new Date().getTime();
    while (instance.elapsed < totalTime) {
      instance.elapsed = (new Date().getTime() - startTime)/1000;
      if (!instance.started) {
        console.log("------------ START ------------")
        await this.loopA.playFromPositionAsync(0);
        if (shouldSwitchTracks) {
          await this.loopB.playFromPositionAsync(0);
        }
        instance.started = true;
      } else if (shouldSwitchTracks && (phaseTwoFadeInTime < instance.elapsed) && (instance.elapsed < phaseOneTime) ){
        console.log("------------ ENTER FADE IN SECOND TRACK ------------")
        //Fade in second track
        const val = (( instance.elapsed - phaseTwoFadeInTime ) / Constants.FadeDuration)
        await this.loopB.setVolumeAsync(val);
      } else if (shouldSwitchTracks && !instance.finalCountdownStarted && !instance.phaseOneComplete && instance.elapsed > phaseOneTime ) {
        console.log("------------ ENTER PHASE TWO ------------")
        //Switch to second track
        await this.loopB.setVolumeAsync(1);
        await this.loopA.stopAsync();
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
      if (!this.state.started) { return; }
    }
    KeepAwake.deactivate();
  }

  onDurationChanged = (percent) => {
    this.setState({
      phaseOneTime: computePhaseOne(percent),
      phaseTwoTime: computePhaseTwo(percent),
      percent
    });
  }

  _onVideoPlaybackUpdate = (playbackStatus) => {
    if (playbackStatus.didJustFinish) {
      this.setState({complete: true});
    }
  };

  _getVideoDimensions = () => {
    const {height, width} = Dimensions.get('window');

    let videoHeight = width * VideoHeight / VideoWidth;
    let videoWidth = width;

    if ((width / height) > (VideoWidth / VideoHeight)) {
      videoHeight = height;
      videoWidth = height * VideoWidth / VideoHeight;
    }

    return {
      videoHeight,
      videoWidth,
      height,
      width
    };
  }

  _reset = () => {
    this.loopA.stopAsync();
    this.loopB.stopAsync();
    this.video.stopAsync();
    this.setState({
      percent: 0.5,
      ...INITIAL_STATE
    });
  }

  render() {
    const { loaded, started, finalCountdownStarted, elapsed, complete,
      phaseOneTime, phaseTwoTime, percent, hideStartupScreen } = this.state;


    if (!loaded) {
      return (
        <AppLoading
          startAsync={this._loadAssets}
          onFinish={this._loadFinished}
          onError={console.warn} />
      );
    }

    let screen;
    if (!hideStartupScreen) {
      screen = (
        <StartupScreen onPress={() => this.setState({hideStartupScreen: true})} />
      );
    } else if (complete) {
      screen = (
        <CompleteScreen onRestart={this._reset} />
      );
    } else if (!started) {
      screen = (
        <SetupScreen
          videoHeight={videoHeight}
          videoWidth={videoWidth}
          phaseOneTime={phaseOneTime}
          phaseTwoTime={phaseTwoTime}
          percent={percent}
          onStart={this.startGame}
          onDurationChanged={this.onDurationChanged} />
      );
    } else if (!finalCountdownStarted) {
      screen = (
        <TimerScreen 
          onCancel={this._reset}
          phaseOneTime={phaseOneTime}
          phaseTwoTime={phaseTwoTime}
          elapsed={elapsed}/>
      );
    }

    let timeRemaining;
    if (!screen) {
      timeRemaining = phaseOneTime + phaseTwoTime - elapsed;
    }

    const {
      videoHeight,
      videoWidth,
      height,
      width
    } = this._getVideoDimensions();

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" hidden={true} />
        {/* <View style={styles.debug}>
          <Text style={{color: 'white'}}>
            {
`Video Height: ${videoHeight}
Video Width: ${videoWidth}
Aspect Ratio: ${videoWidth/videoHeight}
Screen Height: ${height}
Screen Width: ${width}
Aspect Ratio: ${width/height}
VERSION: 2`
            }
          </Text>
        </View> */}
        <View style={styles.smallTimer} >
         <TimerText time={timeRemaining} fontSize={40} color={'#f15b40'} />
        </View>
        <Video
          ref={this._mountVideo}
          source={Constants.Video.ActionNewsIntro}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={Expo.Video.RESIZE_MODE_STRETCH}
          onPlaybackStatusUpdate={this._onVideoPlaybackUpdate}
          style={{
            zIndex: 0,
            height: videoHeight,
            width: videoWidth,
            backgroundColor: '#1b1431'
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
  },
  debug: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    left: 0,
    color: 'white'
  },
  smallTimer: {
    zIndex: 2,
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
});
