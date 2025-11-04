import React, { useState, useEffect } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-green-700 text-white p-2 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-900 transition-all duration-300 z-40 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Go to top"
      title="Go to top"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
};

export default BackToTopButton;