import { useState } from 'react';
import { Button } from './button';

export const AccessibilityButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setFontSize] = useState(16);

  const increaseFontSize = () => {
    setFontSize(prev => {
      const next = Math.min(prev + 2, 24);
      document.documentElement.style.fontSize = `${next}px`;
      return next;
    });
  };

  const decreaseFontSize = () => {
    setFontSize(prev => {
      const next = Math.max(prev - 2, 12);
      document.documentElement.style.fontSize = `${next}px`;
      return next;
    });
  };

  const toggleHighContrast = () => {
    document.body.classList.toggle('high-contrast');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white"
        aria-label="אפשרויות נגישות"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </Button>

      {isMenuOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-lg p-4 space-y-2 rtl">
          <Button
            onClick={increaseFontSize}
            className="w-full"
            aria-label="הגדל טקסט"
          >
            הגדל טקסט (A+)
          </Button>
          <Button
            onClick={decreaseFontSize}
            className="w-full"
            aria-label="הקטן טקסט"
          >
            הקטן טקסט (A-)
          </Button>
          <Button
            onClick={toggleHighContrast}
            className="w-full"
            aria-label="ניגודיות גבוהה"
          >
            ניגודיות גבוהה
          </Button>
        </div>
      )}
    </div>
  );
};