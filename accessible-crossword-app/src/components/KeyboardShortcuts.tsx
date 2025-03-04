import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSpeak: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ 
  onPrevious, 
  onNext, 
  onSpeak 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input element
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case ' ': // Space key
          e.preventDefault(); // Prevent page scrolling
          onSpeak();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrevious, onNext, onSpeak]);
  
  // This component doesn't render anything
  return null;
};

export default KeyboardShortcuts; 