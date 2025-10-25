import React, { useState, useEffect } from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  widthClass?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, widthClass = 'max-w-md' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation to finish
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full ${widthClass} transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;