import { useEffect, useState, useCallback } from 'react';
import './App.css';
import AccessibilityHelp from './components/AccessibilityHelp';
import ClueDisplay from './components/ClueDisplay';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ProgressIndicator from './components/ProgressIndicator';
import ScreenReaderAnnouncement from './components/ScreenReaderAnnouncement';
import VoiceControl from './components/VoiceControl';
import { useGameStore } from './store/gameStore';
import { Clue } from './types';

function App() {
  // Get state and actions from our store
  const {
    clues,
    cells,
    currentClueIndex,
    loading,
    isSpeaking,
    userAnswersForCells,
    setClues,
    setCells,
    setLoading,
    setIsSpeaking,
    setCurrentClueIndex,
    setAnswerForCell,
    getCompletedClues,
    isClueComplete,
    soundEnabled,
    toggleSound
  } = useGameStore();

  // State for screen reader announcements
  const [announcement, setAnnouncement] = useState<string>('');
  
  // State for voice control
  const [isVoiceControlActive, setIsVoiceControlActive] = useState<boolean>(false);
  
  // Track previously completed clues to announce new completions
  const [completedClueIds, setCompletedClueIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch the puzzle data
    fetch('/puzzle.json')
      .then(response => response.json())
      .then(data => {
        setClues(data.clues);
        setCells(data.cells);
        setLoading(false);
        
        // Initial announcement for screen readers
        setAnnouncement('Crossword puzzle loaded. Use arrow keys to navigate between clues, space to read the current clue aloud, and V key to toggle voice control. Press H for help.');
      })
      .catch(error => {
        console.error('Error loading puzzle data:', error);
        setLoading(false);
        setAnnouncement('Error loading puzzle data. Please try again later.');
      });
      
    // Set up speech synthesis end event listener
    if ('speechSynthesis' in window) {
      const handleSpeechEnd = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      
      return () => {
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
      };
    }
  }, [setClues, setCells, setLoading, setIsSpeaking]);

  // Check for newly completed clues
  useEffect(() => {
    if (clues.length === 0) return;
    
    const newCompletedClueIds = new Set<number>();
    
    clues.forEach((clue: Clue) => {
      if (isClueComplete(clue.id)) {
        newCompletedClueIds.add(clue.id);
        
        // If this clue wasn't previously completed, announce it
        if (!completedClueIds.has(clue.id)) {
          setAnnouncement(`Clue ${clue.name} completed! The answer is ${clue.complete_answer}.`);
        }
      }
    });
    
    setCompletedClueIds(newCompletedClueIds);
  }, [clues, isClueComplete, userAnswersForCells, completedClueIds]);

  const handlePrevClue = useCallback(() => {
    if (currentClueIndex > 0) {
      setCurrentClueIndex(currentClueIndex - 1);
    } else {
      // Wrap around to the last clue
      setCurrentClueIndex(clues.length - 1);
    }
  }, [currentClueIndex, clues.length, setCurrentClueIndex]);

  const handleNextClue = useCallback(() => {
    if (currentClueIndex < clues.length - 1) {
      setCurrentClueIndex(currentClueIndex + 1);
    } else {
      // Wrap around to the first clue
      setCurrentClueIndex(0);
    }
  }, [currentClueIndex, clues.length, setCurrentClueIndex]);
  
  // Announce the current clue when it changes
  useEffect(() => {
    if (clues.length > 0 && !loading) {
      const currentClue = clues[currentClueIndex];
      setAnnouncement(`Current clue: ${currentClue.name}. ${currentClue.text}`);
    }
  }, [currentClueIndex, clues, loading]);

  const handleSpeakClue = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    
    if (clues.length > 0 && 'speechSynthesis' in window) {
      const currentClue = clues[currentClueIndex];
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Format the answer for speech
      let answerText = '';
      if (currentClue.complete_answer) {
       
        answerText = currentClue.cell_ids.map((cellId: number, index: number) => {
          const userAnswer = userAnswersForCells[cellId] || '';
          if (userAnswer) {
            return `${userAnswer}`;
          }
          return `Letter ${index + 1}: blank. `;
        }).join('');
      }
      
      const textToSpeak = `${currentClue.name}. ${currentClue.text}. The answer has ${currentClue.complete_answer.length} letters. ${answerText}`;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9; // Slightly slower rate for better comprehension
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [clues, currentClueIndex, userAnswersForCells, setIsSpeaking]);

  const handleCellUpdated = useCallback((cellId: number, value: string) => {
    setAnswerForCell(cellId, value);
  }, [setAnswerForCell]);

  // Handle voice input for letters
  const handleVoiceLetterInput = useCallback((letter: string) => {
    if (!clues.length) return;
    
    const currentClue = clues[currentClueIndex];
    
    // Find the first empty cell in the current clue
    for (let i = 0; i < currentClue.cell_ids.length; i++) {
      const cellId = currentClue.cell_ids[i];
      if (!userAnswersForCells[cellId]) {
        setAnswerForCell(cellId, letter);
        setAnnouncement(`Entered letter ${letter} at position ${i + 1}`);
        return;
      }
    }
    
    // If all cells are filled, announce it
    setAnnouncement('All cells in this clue are already filled. Try saying "next" to move to the next clue.');
  }, [clues, currentClueIndex, userAnswersForCells, setAnswerForCell, setAnnouncement]);


  const toggleVoiceControl = useCallback(() => {
    // If turning off, do it immediately
    if (isVoiceControlActive) {
      setIsVoiceControlActive(false);
      setAnnouncement('Voice control deactivated');
    } else {
      // If turning on, add a small delay to ensure clean startup
      setAnnouncement('Activating voice control, please wait...');
      
      // Short delay to ensure any previous instance is fully stopped
      setTimeout(() => {
        setIsVoiceControlActive(true);
        setAnnouncement('Voice control activated. You can say "next", "previous", "read", or letter names.');
      }, 500);
    }
  }, [isVoiceControlActive, setAnnouncement]);

  // Toggle voice control with V key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Toggle voice control with 'v' key
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        toggleVoiceControl();
      }
      
      // Toggle sound with 's' key
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        toggleSound();
        setAnnouncement(soundEnabled ? 'Sound effects disabled' : 'Sound effects enabled');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceControlActive, soundEnabled, setAnnouncement, toggleVoiceControl, toggleSound]);


  const handleVoiceControlError = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  if (loading) {
    return <div className="loading">Loading puzzle data...</div>;
  }

  const completedClues = getCompletedClues();
  const currentClue = clues[currentClueIndex];

  return (
    <div className="app-container">
      <ScreenReaderAnnouncement message={announcement} />
      
      <VoiceControl 
        isActive={isVoiceControlActive}
        onPrevious={handlePrevClue}
        onNext={handleNextClue}
        onSpeak={handleSpeakClue}
        onLetterInput={handleVoiceLetterInput}
        onToggleVoiceControl={toggleVoiceControl}
        onError={handleVoiceControlError}
      />
      
      <div className="controls">
        <button 
          className={`control-button ${isVoiceControlActive ? 'active' : ''}`}
          onClick={toggleVoiceControl}
          aria-pressed={isVoiceControlActive}
          aria-label="Toggle voice control"
        >
          <span role="img" aria-hidden="true">🎤</span>
        </button>
        
        <button 
          className={`control-button ${soundEnabled ? 'active' : ''}`}
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label="Toggle sound effects"
        >
          <span role="img" aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
        </button>
      </div>
      
      <AccessibilityHelp isVoiceControlActive={isVoiceControlActive} />
      
      <ProgressIndicator 
        currentIndex={currentClueIndex}
        totalClues={clues.length}
        completedClues={completedClues}
      />
      
      <KeyboardShortcuts 
        onPrevious={handlePrevClue}
        onNext={handleNextClue}
        onSpeak={handleSpeakClue}
      />
      
      <div 
        className="left-area" 
        onClick={handlePrevClue} 
        aria-label="Previous clue"
        role="button"
        tabIndex={0}
      >
        &lt;
      </div>
      
      <div 
        className={`center-area ${isSpeaking ? 'speaking' : ''}`} 
        onDoubleClick={handleSpeakClue}
        aria-label="Read clue aloud"
        role="button"
        tabIndex={0}
      >
        {clues.length > 0 && (
          <ClueDisplay 
            clue={currentClue} 
            cells={cells}
            userAnswersForCells={userAnswersForCells}
            onCellUpdated={handleCellUpdated}
          />
        )}
      </div>
      
      <div 
        className="right-area" 
        onClick={handleNextClue} 
        aria-label="Next clue"
        role="button"
        tabIndex={0}
      >
        &gt;
      </div>
    </div>
  );
}

export default App; 