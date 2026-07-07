import { useEffect } from 'react';

// Placeholder עד שהדומיין הסופי נקבע (ר' אותה הערה ב-index.html וב-sitemap.xml) -
// יש לעדכן את שלושתם יחד כשהאתר עולה לאוויר בכתובת האמיתית.
export const SITE_ORIGIN = 'https://movalo.co.il';

export interface HreflangEntry {
  /** קוד שפה (he/en/fr/ar/ru) או 'x-default' */
  lang: string;
  /** כתובת מלאה (absolute URL) */
  href: string;
}

export interface PageMetaOptions {
  title: string;
  description?: string;
  /** כתובת מלאה (absolute URL) של הדף הנוכחי */
  canonical?: string;
  /** true עבור דפים פרטיים/ניהוליים שאין טעם לאנדקס (למשל /admin, /dashboard, /login) */
  noindex?: boolean;
  hreflang?: HreflangEntry[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function clearHreflangLinks() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
}

function setHreflangLinks(entries: HreflangEntry[]) {
  clearHreflangLinks();
  entries.forEach(({ lang, href }) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', lang);
    el.setAttribute('href', href);
    document.head.appendChild(el);
  });
}

/**
 * מעדכן את ה-<head> (כותרת טאב, meta description, canonical, Open Graph, robots,
 * hreflang) בהתאם לדף שמוצג כרגע - כי זה SPA (React Router) בלי server-side
 * rendering, ו-index.html מכיל רק ברירת מחדל אחת גורפת לכל הנתיבים.
 *
 * הערה חשובה שנשארת נכונה גם אחרי זה: גוגל מריץ JavaScript וקורא את השינויים
 * האלה, כך שזה עוזר אמיתי לדירוג ולתוצאות חיפוש נכונות לכל דף/שפה. אבל בוטים
 * של תצוגה מקדימה לשיתוף (וואטסאפ, פייסבוק, טוויטר/X) בדרך כלל *לא* מריצים
 * JavaScript - הם קוראים רק את ה-HTML הסטטי המקורי. כלומר קישור ששותף
 * ב-וואטסאפ תמיד יראה בתצוגה המקדימה את מה שכתוב ב-index.html (עמוד הבית),
 * לא משנה לאיזה דף בפועל הקישור מצביע. לתקן את זה עד הסוף דורש
 * prerendering/SSR אמיתי (למשל מעבר ל-Next.js/Astro או תוסף prerender ל-Vite) -
 * שינוי תשתית גדול יותר, לא רק קוד עמוד בודד.
 */
export function usePageMeta({ title, description, canonical, noindex, hreflang }: PageMetaOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    upsertMeta('property', 'og:title', title);

    if (canonical) {
      upsertCanonical(canonical);
      upsertMeta('property', 'og:url', canonical);
    }

    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (hreflang?.length) {
      setHreflangLinks(hreflang);
    }

    return () => {
      // מנקה hreflang כשעוברים לדף אחר שלא מגדיר משלו, כדי לא להשאיר קישורי
      // שפה שגויים/ישנים ב-head.
      if (hreflang?.length) clearHreflangLinks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hreflang הוא מערך
    // חדש בכל רינדור, אבל הוא תמיד משתנה יחד עם title/canonical (אותו מעבר
    // דף/שפה), כך שאין צורך לכלול אותו כערך תלות בנפרד.
  }, [title, description, canonical, noindex]);
}
