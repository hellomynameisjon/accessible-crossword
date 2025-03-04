import { FC, useEffect, useState, useCallback, useRef } from 'react';

interface VoiceControlProps {
  onPrevious: () => void;
  onNext: () => void;
  onSpeak: () => void;
  onLetterInput: (letter: string) => void;
  onToggleVoiceControl: () => void;
  onError?: (message: string) => void;
  isActive: boolean;
}

/**
 * Component that handles voice control for the app
 * Uses the Web Speech API for speech recognition
 */
const VoiceControl: FC<VoiceControlProps> = ({
  onPrevious,
  onNext,
  onSpeak,
  onLetterInput,
  onToggleVoiceControl,
  onError,
  isActive
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [microphoneStatus, setMicrophoneStatus] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const restartAttemptsRef = useRef<number>(0);
  const lastRestartTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  // Update the error handler to use the onError prop if available
  const handleError = useCallback((message: string) => {
    setErrorMessage(message);
    if (onError) {
      onError(message);
    }
  }, [onError]);
  
  // Check microphone access - only run this when explicitly requested
  const checkMicrophoneAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      
      // Check if we're getting audio levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio levels for a short period
      let silenceCounter = 0;
      const checkAudio = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(checkAudio);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        console.log('Microphone level:', average);
        
        if (average < 10) {
          silenceCounter++;
        } else {
          silenceCounter = 0;
          setMicrophoneStatus('Microphone is working and detecting sound');
          if (onError) {
            onError('Microphone is working and detecting sound');
          }
        }
        
        if (silenceCounter > 5) {
          const message = 'Microphone is connected but not detecting sound. Please speak louder or check your microphone settings.';
          setMicrophoneStatus(message);
          if (onError) {
            onError(message);
          }
        }
      }, 500);
      
      // Stop checking after 5 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          clearInterval(checkAudio);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      const message = 'Could not access microphone. Please check browser permissions.';
      setMicrophoneStatus(message);
      if (onError) {
        onError(message);
      }
      return false;
    }
  }, [onError]);
  
  // Safely start speech recognition with error handling
  const safelyStartRecognition = useCallback(() => {
    if (!recognitionRef.current || !isActive) return;
    
    try {
      recognitionRef.current.start();
      console.log('Voice control activated');
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      
      // If already started, don't try to restart
      if (e instanceof DOMException && e.name === 'InvalidStateError') {
        console.log('Recognition already started, ignoring');
      } else {
        handleError('Error starting speech recognition. Please try again.');
      }
    }
  }, [isActive, handleError]);
  
  // Safely stop speech recognition with error handling
  const safelyStopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      console.log('Voice control deactivated');
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }, []);
  
  // Check if we should restart based on cooldown and attempt limits
  const shouldRestartRecognition = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRestart = now - lastRestartTimeRef.current;
    
    // If we've restarted too many times, don't restart
    if (restartAttemptsRef.current >= 5) {
      handleError('Voice recognition has been restarted too many times. Please toggle it off and on again.');
      return false;
    }
    
    // If we've restarted too recently, don't restart
    if (timeSinceLastRestart < 2000) {
      console.log('Throttling restart attempts, too frequent');
      return false;
    }
    
    lastRestartTimeRef.current = now;
    restartAttemptsRef.current++;
    return true;
  }, [handleError]);
  
  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      handleError('Speech recognition is not supported in this browser.');
      return false;
    }
    
    try {
      // Stop any existing recognition instance
      safelyStopRecognition();
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Changed to false to prevent multiple triggers
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      // Try to increase sensitivity
      if ('maxAlternatives' in recognition) {
        recognition.maxAlternatives = 3; // Get more alternatives to improve accuracy
      }
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();
        
        console.log('Voice command recognized:', command);
        
        // Process commands
        if (command === 'next' || command === 'next clue') {
          onNext();
        } else if (command === 'previous' || command === 'previous clue') {
          onPrevious();
        } else if (command === 'read' || command === 'speak' || command === 'read clue') {
          onSpeak();
        } else if (command === 'stop listening' || command === 'turn off voice') {
          onToggleVoiceControl();
        } else if (command.length === 1 && /[a-z]/i.test(command)) {
          // Single letter input
          onLetterInput(command.toUpperCase());
        } else if (command.startsWith('letter ') && command.length === 8) {
          // Format: "letter A"
          const letter = command.charAt(7).toUpperCase();
          if (/[A-Z]/.test(letter)) {
            onLetterInput(letter);
          }
        }
        
        // Restart recognition after processing command
        if (isActive && shouldRestartRecognition()) {
          setTimeout(() => {
            safelyStartRecognition();
          }, 500);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        
        if (event.error === 'no-speech') {
          // Handle no-speech error specifically
          // Don't show error message every time, it's annoying
          console.log('No speech detected');
          
          // Restart with a longer delay and only if we should
          if (isActive && shouldRestartRecognition()) {
            setTimeout(() => {
              safelyStartRecognition();
            }, 1000);
          }
        } else if (event.error === 'audio-capture') {
          handleError('No microphone detected. Please check your microphone settings.');
        } else if (event.error === 'not-allowed') {
          handleError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'aborted') {
          // This is normal when stopping, don't show an error
          console.log('Speech recognition aborted');
        } else {
          handleError(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognition.onstart = () => {
        console.log('Speech recognition started, listening for commands...');
        setErrorMessage(''); // Clear any previous error messages when successfully started
        setIsListening(true);
        if (onError) {
          onError('Voice recognition started. Try saying "next", "previous", or a letter.');
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition service disconnected');
        setIsListening(false);
        
        // Restart if still active and not intentionally stopped
        if (isActive && shouldRestartRecognition()) {
          console.log('Restarting speech recognition service');
          setTimeout(() => {
            safelyStartRecognition();
          }, 1000);
        }
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      handleError('Error initializing speech recognition.');
      return false;
    }
  }, [
    onNext, 
    onPrevious, 
    onSpeak, 
    onLetterInput, 
    onToggleVoiceControl, 
    isActive, 
    handleError, 
    safelyStopRecognition, 
    safelyStartRecognition,
    shouldRestartRecognition
  ]);
  
  // Reset restart attempts when voice control is toggled
  useEffect(() => {
    restartAttemptsRef.current = 0;
    lastRestartTimeRef.current = 0;
  }, [isActive]);
  
  // Start/stop speech recognition based on isActive
  useEffect(() => {
    if (isActive) {
      // Just initialize and start recognition without checking microphone
      // This makes it more responsive and less likely to cause issues
      const success = initSpeechRecognition();
      if (success) {
        safelyStartRecognition();
      }
    } else {
      safelyStopRecognition();
    }
    
    return () => {
      safelyStopRecognition();
    };
  }, [isActive, initSpeechRecognition, safelyStartRecognition, safelyStopRecognition]);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      safelyStopRecognition();
    };
  }, [safelyStopRecognition]);
  
  // If there's an error, show it to screen readers and visually
  if (errorMessage || microphoneStatus) {
    return (
      <>
        {errorMessage && <div className="sr-only" role="alert">{errorMessage}</div>}
        {isActive && (
          <div className="voice-control-error" aria-hidden="true">
            {errorMessage || microphoneStatus}
            {errorMessage && <p>Try saying "next", "previous", or a letter like "A"</p>}
          </div>
        )}
      </>
    );
  }
  
  // This component doesn't render anything visible
  return (
    <>
      {isActive ? (
        <div className={`voice-control-active ${isListening ? 'listening' : ''}`} aria-live="polite">
          {isListening ? 'Listening...' : 'Voice Control Active'}
          <button 
            className="mic-debug-button" 
            onClick={() => checkMicrophoneAccess()}
            aria-label="Test microphone"
          >
            Test Mic
          </button>
        </div>
      ) : null}
    </>
  );
};

export default VoiceControl;

// Add these types to make TypeScript happy with the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 