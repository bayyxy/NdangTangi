import { useEffect, useRef, useState, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8; // g-force threshold
const SAMPLE_RATE = 100; // ms

interface UseShakeDetectorOptions {
  onShake?: () => void;
  enabled?: boolean;
}

export function useShakeDetector({ onShake, enabled = true }: UseShakeDetectorOptions = {}) {
  const [shaking, setShaking] = useState(false);
  const [hasSensor, setHasSensor] = useState(true);
  const lastReading = useRef({ x: 0, y: 0, z: 0 });
  const subscriptionRef = useRef<any>(null);

  const triggerShake = useCallback(() => {
    setShaking(true);
    onShake?.();
    setTimeout(() => setShaking(false), 200);
  }, [onShake]);

  useEffect(() => {
    if (!enabled) {
      subscriptionRef.current?.remove?.();
      subscriptionRef.current = null;
      return;
    }

    let isMounted = true;

    async function setupAccelerometer() {
      try {
        if (!Accelerometer || typeof Accelerometer.isAvailableAsync !== 'function') {
          if (isMounted) setHasSensor(false);
          return;
        }

        const available = await Accelerometer.isAvailableAsync();
        if (!isMounted) return;

        if (!available) {
          setHasSensor(false);
          return;
        }

        setHasSensor(true);
        Accelerometer.setUpdateInterval(SAMPLE_RATE);
        subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
          const prev = lastReading.current;
          const delta = Math.sqrt(
            Math.pow(x - prev.x, 2) + Math.pow(y - prev.y, 2) + Math.pow(z - prev.z, 2)
          );
          lastReading.current = { x, y, z };

          if (delta > SHAKE_THRESHOLD) {
            setShaking(true);
            onShake?.();
          } else {
            setShaking(false);
          }
        });
      } catch {
        if (isMounted) setHasSensor(false);
      }
    }

    setupAccelerometer();

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove?.();
      subscriptionRef.current = null;
    };
  }, [enabled, onShake]);

  return { shaking, hasSensor, triggerShake };
}

