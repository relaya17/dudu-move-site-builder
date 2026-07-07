import { BusinessSettings } from '../database/models/BusinessSettings';
import { tenantFilter } from './tenantFilter';

// placeholder עד שהדומיין הסופי נקבע - יש לעדכן יחד עם אותו placeholder ב-
// frontend/index.html, frontend/public/sitemap.xml ו-frontend/src/hooks/usePageMeta.ts.
const SITE_ORIGIN = 'https://movalo.co.il';
const OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

/**
 * בוטים ידועים של תצוגה מקדימה לשיתוף קישורים (וואטסאפ, פייסבוק, טוויטר/X,
 * לינקדאין, סלאק, טלגרם, דיסקורד...). הם *לא* מריצים JavaScript - קוראים רק
 * את ה-HTML הסטטי שהשרת מחזיר בבקשה הראשונה. גוגלבוט כן מריץ JS (ורואה את
 * usePageMeta בצד הלקוח כרגיל), אז הוא לא חייב להיות ברשימה כאן - אבל אין נזק
 * אם גם הוא מקבל את התשובה המהירה הזו.
 */
const SOCIAL_BOT_UA = /(facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|redditbot|Pinterest|vkShare|Googlebot)/i;

export function isSocialPreviewBot(userAgent: string | undefined | null): boolean {
  return !!userAgent && SOCIAL_BOT_UA.test(userAgent);
}

interface PreviewMeta {
  title: string;
  description: string;
  canonical: string;
  hreflang?: { lang: string; href: string }[];
}

const LANGS = ['en', 'fr', 'ar', 'ru'] as const;

function forMoversHreflang(): { lang: string; href: string }[] {
  return [
    { lang: 'he', href: `${SITE_ORIGIN}/` },
    ...LANGS.map((l) => ({ lang: l, href: `${SITE_ORIGIN}/for-movers/${l}` })),
    { lang: 'x-default', href: `${SITE_ORIGIN}/` },
  ];
}

const FOR_MOVERS_META: Record<'he' | (typeof LANGS)[number], { title: string; description: string }> = {
  he: {
    title: 'Movalo - פלטפורמת ניהול למובילים | אתר, חשבוניות, GPS ו-AI במנוי אחד',
    description: 'Movalo נותנת לחברת ההובלות שלך אתר, הצעות מחיר וחשבוניות אוטומטיות, מעקב GPS ומזכירה חכמה מבוססת AI - הכול במנוי חודשי אחד, במקום לשלם בנפרד על כל כלי.',
  },
  en: {
    title: 'Movalo - Management Platform for Moving Companies',
    description: 'Movalo gives your moving company a website, automatic quotes and invoices, GPS tracking and an AI-powered assistant - all under a single monthly subscription instead of separate tools.',
  },
  fr: {
    title: 'Movalo - Plateforme de gestion pour déménageurs',
    description: 'Movalo offre à votre entreprise de déménagement un site web, des devis et factures automatiques, un suivi GPS et un assistant IA - le tout via un seul abonnement mensuel.',
  },
  ar: {
    title: 'Movalo - منصة إدارة لشركات النقل',
    description: 'توفر Movalo لشركة النقل الخاصة بك موقعًا إلكترونيًا وعروض أسعار وفواتير تلقائية وتتبع GPS ومساعدًا ذكيًا - كل ذلك ضمن اشتراك شهري واحد.',
  },
  ru: {
    title: 'Movalo - Платформа управления для транспортных компаний',
    description: 'Movalo предоставляет вашей транспортной компании сайт, автоматические предложения и счета, GPS-отслеживание и ИИ-помощника - всё в рамках одной ежемесячной подписки.',
  },
};

/**
 * מחזיר את המטא-דאטה לתצוגה מקדימה עבור נתיב נתון, או null אם זה נתיב שלא
 * מיועד לשיתוף (admin/dashboard/login וכו') - ואז ה-caller יחזור להתנהגות
 * הרגילה (index.html הגנרי).
 */
export async function getSocialPreviewMeta(pathname: string): Promise<PreviewMeta | null> {
  if (pathname === '/' || pathname === '/for-movers') {
    return { ...FOR_MOVERS_META.he, canonical: `${SITE_ORIGIN}/`, hreflang: forMoversHreflang() };
  }

  const langMatch = pathname.match(/^\/for-movers\/(en|fr|ar|ru)$/);
  if (langMatch) {
    const lang = langMatch[1] as (typeof LANGS)[number];
    return { ...FOR_MOVERS_META[lang], canonical: `${SITE_ORIGIN}/for-movers/${lang}`, hreflang: forMoversHreflang() };
  }

  if (pathname === '/register') {
    return {
      title: 'הרשמה למובילים | Movalo',
      description: 'הרשמה לפלטפורמת Movalo - אתר, ניהול לקוחות, הצעות מחיר וחשבוניות לחברת ההובלות שלך. 14 יום ניסיון ללא כרטיס אשראי.',
      canonical: `${SITE_ORIGIN}/register`,
    };
  }

  if (pathname === '/demo') {
    // שם העסק האמיתי (לא "Movalo" - זה שם הפלטפורמה, לא שם העסק) - אותו מקור
    // אמת בדיוק כמו getPublicInfo ב-settingsController.ts.
    let businessName = 'David Move';
    try {
      const settings = await BusinessSettings.findOne(tenantFilter(undefined));
      if (settings?.businessName) businessName = settings.businessName;
    } catch (error) {
      console.error('שגיאה בשליפת שם העסק לתצוגה מקדימה (og:title) של /demo:', error);
    }
    return {
      title: `${businessName} - הערכת מחיר להובלה`,
      description: `${businessName} - שירותי הובלות ואריזה מקצועיים. קבלו הצעת מחיר מיידית ומעקב GPS בזמן אמת אחרי ההובלה שלכם.`,
      canonical: `${SITE_ORIGIN}/demo`,
    };
  }

  // admin/dashboard/login/tracking/thank-you וכו' - אין להם תצוגה מקדימה ייעודית
  // (רובם פרטיים ממילא) - עדיף שהקורא יחזור ל-index.html הרגיל.
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * בונה מסמך HTML מינימלי אך תקין עם תגיות ה-meta/OG/Twitter/hreflang הנכונות
 * לנתיב הזה. אין צורך ב-JS/React בכלל - הבוט קורא רק את ה-<head>. בן אדם
 * שבטעות יגיע לכתובת הזו (במקום דרך ה-SPA) עדיין יראה תוכן קריא + קישור להמשיך.
 */
export function renderSocialPreviewHtml(meta: PreviewMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const hreflangTags = (meta.hreflang || [])
    .map((h) => `  <link rel="alternate" hreflang="${h.lang}" href="${h.href}" />`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${meta.canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Movalo" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${meta.canonical}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
${hreflangTags}
  <meta http-equiv="refresh" content="0; url=${meta.canonical}" />
</head>
<body>
  <p><a href="${meta.canonical}">${title}</a></p>
</body>
</html>`;
}
