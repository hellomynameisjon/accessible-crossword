import { useCallback, useEffect, useRef } from 'react';

// Sound effect URLs - using base64 encoded audio for simplicity
const SUCCESS_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGUACFhYWFhYWFhYWFhYWFhYWFhYWFvb29vb29vb29vb29vb29vb29vb3r6+vr6+vr6+vr6+vr6+vr6+vr6/////////////////////////////////8AAAA8TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAAA+hleKQdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

const ERROR_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAEAAAGhgCQkJCQkJCQkJCQkJCQkJCQkJCQkJC3t7e3t7e3t7e3t7e3t7e3t7e3t7ff39/f39/f39/f39/f39/f39/f3///////////////////////////////////AAAA8TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAABoWI6y4OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

// Additional sound for clue completion
const COMPLETE_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAGAAAJrQBpaWlpaWlpaWlpaWlpaWlpaWlpaWmPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+vr6+vr6+vr6+vr6+vr6+vr6+vr6/T09PT09PT09PT09PT09PT09PT09P////////////////////////////////8AAAA8TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAACSvXYtQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

interface SoundEffectsOptions {
  enabled?: boolean;
  volume?: number;
}

/**
 * Custom hook for using sound effects in the app
 * @param options Configuration options for sound effects
 * @returns Object with functions to play different sounds
 */
export const useSoundEffects = (options: SoundEffectsOptions = {}) => {
  const { enabled = true, volume = 0.5 } = options;
  
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create audio elements
    successAudioRef.current = new Audio(SUCCESS_SOUND);
    errorAudioRef.current = new Audio(ERROR_SOUND);
    completeAudioRef.current = new Audio(COMPLETE_SOUND);
    
    // Set volume
    if (successAudioRef.current) successAudioRef.current.volume = volume;
    if (errorAudioRef.current) errorAudioRef.current.volume = volume;
    if (completeAudioRef.current) completeAudioRef.current.volume = volume;
    
    // Cleanup
    return () => {
      if (successAudioRef.current) {
        successAudioRef.current.pause();
        successAudioRef.current = null;
      }
      if (errorAudioRef.current) {
        errorAudioRef.current.pause();
        errorAudioRef.current = null;
      }
      if (completeAudioRef.current) {
        completeAudioRef.current.pause();
        completeAudioRef.current = null;
      }
    };
  }, [volume]);

  // Function to play success sound
  const playSuccessSound = useCallback(() => {
    if (!enabled || !successAudioRef.current) return;
    
    // Reset the audio to the beginning if it's already playing
    successAudioRef.current.pause();
    successAudioRef.current.currentTime = 0;
    successAudioRef.current.play().catch(err => console.error('Error playing success sound:', err));
  }, [enabled]);

  // Function to play error sound
  const playErrorSound = useCallback(() => {
    if (!enabled || !errorAudioRef.current) return;
    
    // Reset the audio to the beginning if it's already playing
    errorAudioRef.current.pause();
    errorAudioRef.current.currentTime = 0;
    errorAudioRef.current.play().catch(err => console.error('Error playing error sound:', err));
  }, [enabled]);

  // Function to play complete sound
  const playCompleteSound = useCallback(() => {
    if (!enabled || !completeAudioRef.current) return;
    
    // Reset the audio to the beginning if it's already playing
    completeAudioRef.current.pause();
    completeAudioRef.current.currentTime = 0;
    completeAudioRef.current.play().catch(err => console.error('Error playing complete sound:', err));
  }, [enabled]);

  return {
    playSuccessSound,
    playErrorSound,
    playCompleteSound,
    enabled
  };
};

export default useSoundEffects; 