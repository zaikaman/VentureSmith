import React, { createContext, useContext, useRef, useCallback } from 'react';

interface ScrollAndHighlightContextType {
  scrollToTopAndHighlight: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const ScrollAndHighlightContext = createContext<ScrollAndHighlightContextType | undefined>(undefined);

export const ScrollAndHighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToTopAndHighlight = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (inputRef.current) {
      inputRef.current.focus();
      // Add a class for visual highlight, then remove it after a short delay
      inputRef.current.classList.add('highlight-input');
      setTimeout(() => {
        inputRef.current?.classList.remove('highlight-input');
      }, 1000); // Highlight for 1 second
    }
  }, []);

  return (
    <ScrollAndHighlightContext.Provider value={{ scrollToTopAndHighlight, inputRef }}>
      {children}
    </ScrollAndHighlightContext.Provider>
  );
};

export const useScrollAndHighlight = () => {
  const context = useContext(ScrollAndHighlightContext);
  if (context === undefined) {
    throw new Error('useScrollAndHighlight must be used within a ScrollAndHighlightProvider');
  }
  return context;
};