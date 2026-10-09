import { Audio } from 'expo-av';

let soundObject: Audio.Sound | null = null;

export const AudioService = {
  async play(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        staysActiveInBackground: true,
      });

      if (soundObject) {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        soundObject = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundObject = sound;
    } catch (err) {
      console.error('[AudioService] Error playing alarm:', err);
    }
  },

  async stop(): Promise<void> {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch {}
      soundObject = null;
    }
  },

  isPlaying(): boolean {
    return soundObject !== null;
  },
};
