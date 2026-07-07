import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Truck } from 'lucide-react';
import { fetchBusinessName, FALLBACK_BUSINESS_NAME } from '@/services/businessInfoService';

const NAV_LINKS = [
  { label: 'ראשי', id: 'hero' },
  { label: 'שירותים', id: 'services' },
  { label: 'אודות', id: 'about' },
  { label: 'הצעת מחיר', id: 'estimate-form' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // שם העסק מגיע מהגדרות העסק בפאנל הניהול (BusinessSettings) ולא קבוע בקוד -
  // כך כל מוביל שמפעיל את המערכת רואה בנאב שלו את השם העסקי שלו, לא שם קבוע.
  const [businessName, setBusinessName] = useState(FALLBACK_BUSINESS_NAME);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchBusinessName().then(name => {
      if (!cancelled) setBusinessName(name);
    });
    return () => { cancelled = true; };
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      dir="rtl"
      role="navigation"
      aria-label="ניווט ראשי"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md shadow-md border-b border-white/40'
          : 'bg-white/5 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* לוגו — ימין (RTL first child) — קליק שקט לאדמין */}
        <button
          onClick={() => navigate('/admin')}
          aria-label="כניסה לפאנל הניהול"
          className={`flex items-center gap-2 font-bold text-xl tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-1 ${
            scrolled ? 'text-blue-700 hover:text-blue-900' : 'text-white hover:text-blue-200'
          }`}
        >
          <Truck size={26} aria-hidden="true" />
          {/* dir="auto" - שם העסק דינמי (עברית או אנגלית, תלוי מה כל מוביל הזין) */}
          <span dir="auto">{businessName}</span>
        </button>

        {/* קישורי ניווט — desktop */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0" role="list">
          {NAV_LINKS.map(link => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className={`text-sm font-medium transition-colors hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1 py-0.5 ${
                  scrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* כפתור המבורגר — mobile */}
        <button
          className={`md:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded p-1 ${
            scrolled ? 'text-gray-700' : 'text-white'
          }`}
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'סגור תפריט' : 'פתח תפריט'}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* תפריט mobile */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-4 px-6 flex flex-col gap-1"
        >
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-gray-700 font-medium text-right py-2.5 px-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors w-full"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
