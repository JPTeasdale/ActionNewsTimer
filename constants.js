const MinPhaseTwo = 20;
const MaxPhaseTwo = 100;

const MinPhaseOne = 30;
const MaxPhaseOne = 150;

export default {
  MinPhaseOne,
  MaxPhaseOne,
  MinPhaseTwo,
  MaxPhaseTwo,
  BeginnerThreshold: 220,
  EasyThreshold: 180,
  MediumThreshold: 120,
  HardThreshold: 75,
  VideoLength: 20,
  FadeDuration: 2,
  InitialAudioStatus: {
    progressUpdateIntervalMillis: 500,
    positionMillis: 0,
    shouldPlay: false,
    rate: 1.0,
    shouldCorrectPitch: false,
    volume: 1.0,
    isMuted: false,
    isLooping: true
  },
  InitialVideoStatus: {
    progressUpdateIntervalMillis: 500,
    positionMillis: 0,
    shouldPlay: false,
    rate: 1.0,
    shouldCorrectPitch: false,
    volume: 1.0,
    isMuted: false,
    isLooping: false
  },
  Images: {
    Rainbow: require('./assets/images/rainbow.png'),
    ActionNewsSplash: require('./assets/images/action-news.png'),
    RangeMinSlider: require('./assets/images/range-min-slider-color.png'),
    RangeThumb: require('./assets/images/range-thumb-only.png'),
    ButtonStart: require('./assets/images/button-start.png'),
    StartupSplash: require('./assets/images/explaination-bg.png'),
    OnTheAirSplash: require('./assets/images/on-the-air.png')
  },
  Audio: {
    NewsLoopA: require('./assets/audio/breaking-news-headlines-loop.m4a'),
    NewsLoopB: require('./assets/audio/breaking-news-headlines-loop-b.m4a')
  },
  Video: {
    ActionNewsIntro: require('./assets/video/action-news-intro.mp4')
  },
  Fonts: {
    MontserratBlack: require('./assets/fonts/Montserrat-Black.ttf'),
    MontserratBold: require('./assets/fonts/Montserrat-Bold.ttf'),
    MontserratRegular: require('./assets/fonts/Montserrat-Regular.ttf')
  }
};