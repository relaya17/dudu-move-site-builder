import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, Truck } from 'lucide-react';
import { fetchBusinessName, FALLBACK_BUSINESS_NAME } from '@/services/businessInfoService';

const NAV_LINKS = [
  { label: 'ראשי', id: 'hero', type: 'hash' as const },
  { label: 'שירותים', id: 'services', type: 'hash' as const },
  { label: 'אודות', id: 'about', type: 'hash' as const },
  { label: 'הצעת מחיר', id: 'estimate-form', type: 'hash' as const },
  { label: 'עיצוב מדומה', id: 'staging', type: 'route' as const, to: '/demo/staging' },
  { label: 'צור קשר', id: 'contact', type: 'route' as const, to: '/demo/contact' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // תמיכה בקישורי hash כשמגיעים מ-/demo/contact → /demo#about
  useEffect(() => {
    if (location.pathname !== '/demo' || !location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [location.pathname, location.hash]);

  const goHash = (id: string) => {
    setMenuOpen(false);
    if (location.pathname === '/demo') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/demo#${id}`);
    }
  };

  const linkClass = scrolled
    ? 'text-gray-700 hover:text-blue-600'
    : 'text-white/90 hover:text-blue-200';

  return (
    <nav
      dir="rtl"
      role="navigation"
      aria-label="ניווט ראשי"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || location.pathname !== '/demo'
          ? 'bg-white/85 backdrop-blur-md shadow-md border-b border-white/40'
          : 'bg-white/5 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/demo')}
          aria-label="דף הבית של העסק"
          className={`flex items-center gap-2 font-bold text-xl tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-1 ${
            scrolled || location.pathname !== '/demo'
              ? 'text-blue-700 hover:text-blue-900'
              : 'text-white hover:text-blue-200'
          }`}
        >
          <Truck size={26} aria-hidden="true" />
          <span dir="auto">{businessName}</span>
        </button>

        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0" role="list">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              {link.type === 'route' ? (
                <Link
                  to={link.to!}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1 py-0.5 ${
                    scrolled || location.pathname !== '/demo' ? 'text-gray-700 hover:text-blue-600' : linkClass
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  onClick={() => goHash(link.id)}
                  className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1 py-0.5 ${
                    scrolled || location.pathname !== '/demo' ? 'text-gray-700 hover:text-blue-600' : linkClass
                  }`}
                >
                  {link.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          className={`md:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded p-1 ${
            scrolled || location.pathname !== '/demo' ? 'text-gray-700' : 'text-white'
          }`}
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'סגור תפריט' : 'פתח תפריט'}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-4 px-6 flex flex-col gap-1"
        >
          {NAV_LINKS.map(link =>
            link.type === 'route' ? (
              <Link
                key={link.label}
                to={link.to!}
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium text-right py-2.5 px-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors w-full"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => goHash(link.id)}
                className="text-gray-700 font-medium text-right py-2.5 px-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors w-full"
              >
                {link.label}
              </button>
            )
          )}
        </div>
      )}
    </nav>
  );
};
