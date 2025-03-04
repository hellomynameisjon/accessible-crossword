import React from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalClues: number;
  completedClues: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentIndex,
  totalClues,
  completedClues
}) => {
  const progressPercentage = totalClues > 0 ? (completedClues / totalClues) * 100 : 0;
  
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span>Clue {currentIndex + 1} of {totalClues}</span>
        <span>{completedClues} completed ({Math.round(progressPercentage)}%)</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`${Math.round(progressPercentage)}% of clues completed`}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 