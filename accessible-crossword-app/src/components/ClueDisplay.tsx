import { FC, useRef, useEffect, useState } from 'react';
import { Clue, Cell } from '../types';
import './ClueDisplay.css';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGameStore } from '../store/gameStore';

interface ClueDisplayProps {
  clue: Clue;
  cells: Record<string, Cell>,
  userAnswersForCells: Record<number, string>;
  onCellUpdated: (cellId: number, value: string) => void;
}

const ClueDisplay: FC<ClueDisplayProps> = ({ clue, cells, userAnswersForCells, onCellUpdated }) => {
  // Count the number of letters in the answer
  const letterCount = clue.cell_ids.length;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [previousAnswers, setPreviousAnswers] = useState<Record<number, string>>({});
  const [wasClueComplete, setWasClueComplete] = useState<boolean>(false);
  
  // Get sound effects and sound enabled state
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const { playSuccessSound, playErrorSound, playCompleteSound } = useSoundEffects({ 
    enabled: soundEnabled 
  });
  
  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, letterCount);
  }, [letterCount]);

  // Check if the entire answer is correct
  const isAnswerCorrect = (): boolean => {
    if (!clue.cell_ids.length) return false;
    
    for (const cell_id of clue.cell_ids) {
      const correct = isLetterCorrect(cell_id);
      if (correct === null || correct === false) {
        return false;
      }
    }
    
    return true;
  };
  
  // Effect to play sound when clue is completed
  useEffect(() => {
    const isComplete = isAnswerCorrect();
    if (isComplete && !wasClueComplete) {
      playCompleteSound();
    }
    setWasClueComplete(isComplete);
  }, [userAnswersForCells, wasClueComplete, playCompleteSound]);
  
  // Effect to track previous answers for sound effects
  useEffect(() => {
    // Check for changes in answers and play sounds
    Object.keys(userAnswersForCells).forEach(cellIdStr => {
      const cellId = parseInt(cellIdStr, 10);
      const currentAnswer = userAnswersForCells[cellId];
      const previousAnswer = previousAnswers[cellId];
      
      // Only play sounds if the answer has changed
      if (currentAnswer && currentAnswer !== previousAnswer) {
        const isCorrect = isLetterCorrect(cellId);
        if (isCorrect === true) {
          playSuccessSound();
        } else if (isCorrect === false) {
          playErrorSound();
        }
      }
    });
    
    // Update previous answers
    setPreviousAnswers({...userAnswersForCells});
  }, [userAnswersForCells, playSuccessSound, playErrorSound]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single letters
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    
    // Convert to uppercase
    value = value.toUpperCase();
    
    // Update the answer
    onCellUpdated(clue.cell_ids[index], value);
    
    // Move focus to next input if a letter was entered
    if (value && index < letterCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !userAnswersForCells[clue.cell_ids[index]] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < letterCount - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Check if a letter is correct
  const isLetterCorrect = (cell_id: number): boolean | null => {
    const userAnswer = userAnswersForCells[cell_id];

    if (!userAnswer) return null; // Not answered yet
    
    const cell = cells[cell_id];
    if (!cell) return null;
    
    const correctAnswer = cell.answer;
    return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
  };
  
  // Generate a description of the current state for screen readers
  const generateAriaDescription = () => {
    const filledCount = clue.cell_ids.filter(id => userAnswersForCells[id]).length;
    const correctCount = clue.cell_ids.filter(id => isLetterCorrect(id) === true).length;
    
    let description = `${clue.name}. ${clue.text}. ${letterCount} letter answer. `;
    description += `${filledCount} of ${letterCount} letters filled. `;
    
    if (correctCount > 0) {
      description += `${correctCount} letters correct. `;
    }
    
    if (isAnswerCorrect()) {
      description += 'Answer is correct! ';
    }
    
    return description;
  };
  
  return (
    <div 
      className="clue-container"
      aria-label={`Crossword clue: ${clue.name}`}
      aria-describedby={`clue-description-${clue.id}`}
    >
      <div id={`clue-description-${clue.id}`} className="sr-only">
        {generateAriaDescription()}
      </div>
      
      <div className="clue-name">{clue.name}</div>
      <div className="clue-text">{clue.text}</div>
      
      <div 
        className="answer-container"
        role="group"
        aria-label={`Answer grid for ${clue.name}, ${letterCount} letters`}
      >
        {clue.cell_ids.map((cell_id, index) => {
          const letterStatus = isLetterCorrect(cell_id);
          const letterClass = letterStatus === null 
            ? '' 
            : letterStatus 
              ? 'correct' 
              : 'incorrect';
          
          const userAnswer = userAnswersForCells[cell_id] || '';
          
          return (
            <div 
              key={index} 
              className={`letter-box ${letterClass}`}
              aria-label={`Letter ${index + 1} of ${letterCount}`}
            >
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={userAnswer}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                aria-label={`Letter ${index + 1} of ${letterCount}${userAnswer ? `, current value: ${userAnswer}` : ', empty'}`}
                className="letter-input"
                aria-invalid={letterStatus === false}
                aria-describedby={letterStatus === true ? `correct-letter-${index}` : letterStatus === false ? `incorrect-letter-${index}` : undefined}
              />
              {letterStatus === true && (
                <span id={`correct-letter-${index}`} className="sr-only">Correct letter</span>
              )}
              {letterStatus === false && (
                <span id={`incorrect-letter-${index}`} className="sr-only">Incorrect letter</span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="answer-info">
        {letterCount} letter{letterCount !== 1 ? 's' : ''}
        {isAnswerCorrect() && (
          <span className="answer-correct" role="status" aria-live="polite">✓ Correct!</span>
        )}
      </div>
    </div>
  );
};

export default ClueDisplay; 