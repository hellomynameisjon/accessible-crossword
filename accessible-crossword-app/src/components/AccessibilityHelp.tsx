import { FC, useState } from 'react';
import './AccessibilityHelp.css';
import { useGameStore } from '../store/gameStore';

interface AccessibilityHelpProps {
  isVoiceControlActive: boolean;
}

const AccessibilityHelp: FC<AccessibilityHelpProps> = ({ isVoiceControlActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  
  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <>
      <button 
        className="help-button" 
        onClick={toggleHelp}
        aria-label="Accessibility help"
        aria-expanded={isOpen}
      >
        ?
      </button>
      
      {isOpen && (
        <div className="help-overlay" onClick={handleOverlayClick} role="dialog" aria-labelledby="help-title">
          <div className="help-content" onClick={e => e.stopPropagation()}>
            <h2 id="help-title">Accessibility Features</h2>
            
            <button 
              className="close-button" 
              onClick={toggleHelp}
              aria-label="Close help"
            >
              ×
            </button>
            
            <h3>Keyboard Shortcuts</h3>
            <ul>
              <li><strong>Left/Right Arrow:</strong> Navigate between clues</li>
              <li><strong>Space:</strong> Read current clue aloud</li>
              <li><strong>V:</strong> Toggle voice control</li>
              <li><strong>S:</strong> Toggle sound effects</li>
              <li><strong>Tab:</strong> Navigate through input fields</li>
              <li><strong>H:</strong> Toggle this help dialog</li>
            </ul>
            
            <h3>Voice Commands {isVoiceControlActive ? '(Active)' : '(Inactive)'}</h3>
            <ul>
              <li><strong>"Next" or "Next Clue":</strong> Go to next clue</li>
              <li><strong>"Previous" or "Previous Clue":</strong> Go to previous clue</li>
              <li><strong>"Read" or "Speak":</strong> Read current clue aloud</li>
              <li><strong>Single letters (A-Z):</strong> Input a letter in the first empty cell</li>
              <li><strong>"Letter A" (etc.):</strong> Input a specific letter</li>
              <li><strong>"Stop Listening":</strong> Turn off voice control</li>
            </ul>
            
            <h3>Sound Effects</h3>
            <ul>
              <li><strong>Correct letter</strong> - A high-pitched success sound plays when you enter a correct letter</li>
              <li><strong>Incorrect letter</strong> - A low-pitched error sound plays when you enter an incorrect letter</li>
              <li><strong>Clue completed</strong> - A celebratory sound plays when you complete a clue correctly</li>
              <li>Sound effects can be toggled on/off with the 🔊 button or by pressing the S key</li>
              <li>Current status: {soundEnabled ? 'Enabled' : 'Disabled'}</li>
            </ul>
            
            <h3>Screen Reader Support</h3>
            <p>This app is fully compatible with screen readers. It provides:</p>
            <ul>
              <li>Announcements for clue navigation</li>
              <li>Feedback when answers are correct</li>
              <li>Detailed descriptions of the current state</li>
              <li>ARIA labels for all interactive elements</li>
            </ul>
            
            <p className="help-note">
              Voice control is currently {isVoiceControlActive ? 'active' : 'inactive'}. 
              {isVoiceControlActive ? ' Try saying "next", "previous", or a letter.' : ' Press V to activate.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityHelp; 