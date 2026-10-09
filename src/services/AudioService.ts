// import { Audio } from 'expo-av';

// Preload the asset at module level so Metro can bundle it
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ALARM_SOUND = require('../../assets/sounds/alarm.mp3');

let soundObject: Audio.Sound | null = null;

export const AudioService = {
  async play(): Promise<void> {
    console.log('[AudioService] Play simulated (expo-av removed)');
  },

  async stop(): Promise<void> {
    console.log('[AudioService] Stop simulated (expo-av removed)');
  },

  isPlaying(): boolean {
    return false;
  },
};
