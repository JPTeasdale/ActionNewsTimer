const MinPhaseTwo = 15;
const MaxPhaseTwo = 105;

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
    isLooping: true,
  }
};