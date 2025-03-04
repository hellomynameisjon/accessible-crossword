import { useEffect, useRef } from 'react';

// Sound effect URLs - using base64 encoded audio for simplicity
const SUCCESS_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGUACFhYWFhYWFhYWFhYWFhYWFhYWFvb29vb29vb29vb29vb29vb29vb3r6+vr6+vr6+vr6+vr6+vr6+vr6/////////////////////////////////8AAAA8TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAAA+hleKQdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

const ERROR_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAEAAAGhgCQkJCQkJCQkJCQkJCQkJCQkJCQkJC3t7e3t7e3t7e3t7e3t7e3t7e3t7ff39/f39/f39/f39/f39/f39/f3///////////////////////////////////AAAA8TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAABoWI6y4OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

interface SoundEffectsProps {
  enabled: boolean;
}

/**
 * Component that handles sound effects for the app
 * Provides functions for playing success and error sounds
 */
const SoundEffects: React.FC<SoundEffectsProps> = ({ enabled }) => {
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements
    successAudioRef.current = new Audio(SUCCESS_SOUND);
    errorAudioRef.current = new Audio(ERROR_SOUND);
    
    // Set volume
    if (successAudioRef.current) successAudioRef.current.volume = 0.5;
    if (errorAudioRef.current) errorAudioRef.current.volume = 0.5;
    
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
    };
  }, []);

  // Function to play success sound
  const playSuccessSound = () => {
    if (enabled && successAudioRef.current) {
      // Reset the audio to the beginning if it's already playing
      successAudioRef.current.pause();
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.play().catch(err => console.error('Error playing success sound:', err));
    }
  };

  // Function to play error sound
  const playErrorSound = () => {
    if (enabled && errorAudioRef.current) {
      // Reset the audio to the beginning if it's already playing
      errorAudioRef.current.pause();
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch(err => console.error('Error playing error sound:', err));
    }
  };

  // Expose the functions to the global window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).playSuccessSound = playSuccessSound;
      (window as any).playErrorSound = playErrorSound;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).playSuccessSound;
        delete (window as any).playErrorSound;
      }
    };
  }, [enabled]);

  // This component doesn't render anything visible
  return null;
};

export default SoundEffects;

// Add these types to make TypeScript happy
declare global {
  interface Window {
    playSuccessSound?: () => void;
    playErrorSound?: () => void;
  }
} 