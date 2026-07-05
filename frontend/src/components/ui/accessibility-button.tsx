import { useEffect, useRef, useState } from 'react';
import { Button } from './button';

export const AccessibilityButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setFontSize] = useState(16);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
    <div ref={containerRef} className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white"
        aria-label="אפשרויות נגישות"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
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
        <div
          role="menu"
          aria-label="אפשרויות נגישות"
          className="absolute bottom-16 left-0 bg-white rounded-lg shadow-lg p-4 space-y-2 rtl min-w-[200px]"
        >
          <Button
            role="menuitem"
            onClick={increaseFontSize}
            className="w-full"
            aria-label="הגדל טקסט"
          >
            הגדל טקסט (A+)
          </Button>
          <Button
            role="menuitem"
            onClick={decreaseFontSize}
            className="w-full"
            aria-label="הקטן טקסט"
          >
            הקטן טקסט (A-)
          </Button>
          <Button
            role="menuitem"
            onClick={toggleHighContrast}
            className="w-full"
            aria-label="הפעל או כבה ניגודיות גבוהה"
          >
            ניגודיות גבוהה
          </Button>
        </div>
      )}
    </div>
  );
};