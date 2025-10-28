import { useEffect, useState } from 'react';

interface MessageDisplayProps {
  message: string;
  duration?: number;
}

export const MessageDisplay = ({ message, duration = 5000 }: MessageDisplayProps) => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message && message.trim()) {
      setCurrentMessage(message);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        // Clear the message after hiding
        setTimeout(() => setCurrentMessage(''), 300);
      }, duration);

      return () => clearTimeout(timer);
    } else if (!message) {
      // If message is empty, hide immediately
      setVisible(false);
      setCurrentMessage('');
    }
  }, [message, duration]);

  if (!visible || !currentMessage) return null;

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-3 py-2 max-w-xs mx-auto">
        <p className="text-center text-gray-800 text-sm font-medium">{currentMessage}</p>
      </div>
    </div>
  );
};
