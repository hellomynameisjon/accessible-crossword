import { FC, useEffect, useState } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Component that announces messages to screen readers
 * Uses aria-live regions to make announcements without visual elements
 */
const ScreenReaderAnnouncement: FC<ScreenReaderAnnouncementProps> = ({ 
  message, 
  politeness = 'polite' 
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    if (!message) return;
    
    // Add the new message to the queue
    setAnnouncements(prev => [...prev, message]);
    
    // Clean up old announcements after they've been read
    const timer = setTimeout(() => {
      setAnnouncements(prev => prev.filter(item => item !== message));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="sr-only">
      {politeness === 'assertive' ? (
        <div role="alert" aria-live="assertive">
          {announcements.map((announcement, index) => (
            <div key={`${announcement}-${index}`}>{announcement}</div>
          ))}
        </div>
      ) : (
        <div aria-live="polite">
          {announcements.map((announcement, index) => (
            <div key={`${announcement}-${index}`}>{announcement}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenReaderAnnouncement; 