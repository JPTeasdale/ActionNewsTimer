const MinPhaseTwo = 20;
const MaxPhaseTwo = 110;

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
    NewsLoopA: require('./assets/audio/news-loop-a-looped.mp3'),
    NewsLoopB: require('./assets/audio/news-loop-b.mp3')
  },
  Video: {
    ActionNewsIntro: require('./assets/video/action-news-intro.mov')
  },
  Fonts: {
    MontserratBlack: require('./assets/fonts/Montserrat-Black.ttf'),
    MontserratBold: require('./assets/fonts/Montserrat-Bold.ttf'),
    MontserratRegular: require('./assets/fonts/Montserrat-Regular.ttf')
  }
};