import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle the closing animation sequence
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation (0.2s = 200ms) to finish before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false); 
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Solid opacity (no blur) */}
      <div 
        className={`absolute inset-0 bg-black/70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} 
        onClick={handleClose}
      />
      
      {/* Content */}
      <div 
        className={`relative glass-panel rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-out' : 'animate-pop-in'}`}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-black/30 rounded-full p-2 hover:bg-black/50 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};