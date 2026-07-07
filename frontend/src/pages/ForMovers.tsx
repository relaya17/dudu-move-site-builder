import { useState } from 'react';
import { VideoIntro, hasSeenIntro } from '../components/VideoIntro';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Globe,
  Bot,
  FileText,
  MapPin,
  Users,
  BellRing,
  BarChart3,
  ShieldCheck,
  Check,
  X as XIcon,
} from 'lucide-react';

type Lang = 'he' | 'en' | 'fr' | 'ar' | 'ru';

interface FeatureItem {
  icon: JSX.Element;
  title: string;
  desc: string;
}

interface SavingsRow {
  label: string;
  cost: string;
}

interface HiddenItem {
  title: string;
  desc: string;
}

interface PageContent {
  dir: 'rtl' | 'ltr';
  langLabel: string;
  brand: string;
  nav: { backHome: string };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  savings: {
    title: string;
    intro: string;
    rows: SavingsRow[];
    aloneTotal: string;
    bundleTitle: string;
    bundleText: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  hidden: {
    title: string;
    intro: string;
    items: HiddenItem[];
  };
  comparison: {
    title: string;
    text: string;
  };
  cta: {
    title: string;
    text: string;
    button: string;
  };
  footer: string;
}

const iconClass = 'h-8 w-8 text-blue-600';

function buildContent(): Record<Lang, PageContent> {
  return {
    he: {
      dir: 'rtl',
      langLabel: 'עברית',
      brand: 'מערכת ניהול חכמה למובילים',
      nav: { backHome: 'לאתר של דוד הובלות' },
      hero: {
        eyebrow: 'למובילים ולחברות הובלה',
        title: 'כל מה שחברת הובלה צריכה,',
        highlight: 'במקום אחד ובמחיר אחד',
        subtitle:
          'אתר, מאגר לקוחות, הצעות מחיר וחשבוניות אוטומטיות, מעקב GPS בזמן אמת, ומזכירה חכמה מבוססת AI שעונה ללקוחות - הכול תחת מנוי חודשי אחד, במקום לשלם בנפרד על כל כלי.',
        ctaPrimary: 'רוצה לראות איך זה עובד',
        ctaSecondary: 'לצפות בדוגמה חיה',
      },
      savings: {
        title: 'כמה זה עולה בנפרד היום',
        intro: 'אם תרצו להרכיב את זה לבד, אלו המחירים המקובלים בישראל לכל כלי בנפרד:',
        rows: [
          { label: 'בניית אתר ותחזוקה שוטפת', cost: '₪150-300 לחודש' },
          { label: 'תוכנת חשבוניות', cost: '₪50-150 לחודש' },
          { label: 'מערכת לניהול לקוחות ולידים', cost: '₪100-300 לחודש' },
          { label: 'מעקב משלוחים בזמן אמת', cost: '₪100-300 לחודש (אם בכלל קיים)' },
          { label: 'עוזר/מזכירה', cost: 'אלפי שקלים בחודש' },
        ],
        aloneTotal: 'סה"כ בנפרד: כ-₪400-1,050 לחודש, ובלי מזכירה אנושית - בלי AI בכלל',
        bundleTitle: 'עם המערכת הזו',
        bundleText: 'כל זה במנוי חודשי אחד ופשוט - אתם חוסכים גם כסף וגם זמן ניהול של כמה ספקים שונים.',
      },
      features: {
        title: 'מה בפועל מקבלים',
        subtitle: 'לא הבטחות - פיצ׳רים שכבר בנויים ועובדים',
        items: [
          {
            icon: <Globe className={iconClass} aria-hidden="true" />,
            title: 'אתר מקצועי משלכם',
            desc: 'אתר לקוחות עם טופס הערכת מחיר אוטומטי, מותאם למובייל ונגיש.',
          },
          {
            icon: <Bot className={iconClass} aria-hidden="true" />,
            title: 'מזכירה חכמה מבוססת AI',
            desc: 'עוזרת דיגיטלית שעונה על שאלות, מסכמת נתונים עסקיים ומנפיקה הצעות מחיר - זמינה 24/7.',
          },
          {
            icon: <FileText className={iconClass} aria-hidden="true" />,
            title: 'הצעות מחיר וחשבוניות אוטומטיות',
            desc: 'מספור סידורי אוטומטי, הפקה עצמאית חינמית או חיבור ל-Green Invoice לעסקים גדולים יותר.',
          },
          {
            icon: <MapPin className={iconClass} aria-hidden="true" />,
            title: 'מעקב הובלה בזמן אמת',
            desc: 'הלקוח מקבל קישור אישי ורואה את סטטוס ההובלה ומיקומה בזמן אמת, בלי להתקשר לשאול.',
          },
          {
            icon: <Users className={iconClass} aria-hidden="true" />,
            title: 'מאגר לקוחות ולידים מרכזי',
            desc: 'כל פנייה נשמרת אוטומטית - שום ליד לא הולך לאיבוד גם אם מחליפים עובד מזכירות.',
          },
          {
            icon: <BellRing className={iconClass} aria-hidden="true" />,
            title: 'תזכורות אוטומטיות ב-SMS ואימייל',
            desc: 'הפחתת ביטולים ושכחות של לקוחות לפני מועד ההובלה, בלי מאמץ ידני.',
          },
          {
            icon: <BarChart3 className={iconClass} aria-hidden="true" />,
            title: 'דוחות והמלצות AI לתמחור',
            desc: 'ניתוח ימים עמוסים, פריטים פופולריים והמלצות תמחור מבוססות נתונים אמיתיים, לא ניחוש.',
          },
          {
            icon: <ShieldCheck className={iconClass} aria-hidden="true" />,
            title: 'הגנה משפטית מובנית',
            desc: 'מדיניות פרטיות, תנאי שימוש והצהרת נגישות - מוכנים מראש, בלי לשלם לעורך דין בנפרד.',
          },
        ],
      },
      hidden: {
        title: 'דברים שכנראה לא חשבתם עליהם',
        intro: 'כשמסתכלים רק על "אתר + חשבוניות" מפספסים כמה דברים שבאמת חוסכים כסף וסיכון:',
        items: [
          {
            title: 'סיכון משפטי שנעלם',
            desc: 'עסק בישראל בלי הצהרת נגישות ומדיניות פרטיות חשוף לתביעות. כאן זה כבר קיים ומוכן.',
          },
          {
            title: 'רצף תיעוד לרואה חשבון',
            desc: 'מספור אוטומטי ורציף של הצעות מחיר וחשבוניות עוזר בביקורת ובדוחות מס - בלי עבודה ידנית.',
          },
          {
            title: 'ייעוץ עסקי בלי לשלם ליועץ',
            desc: 'ה-AI מזהה בעצמו ימים עמוסים, פריטים נפוצים ומגמות מחיר - תובנות שבדרך כלל עולות כסף.',
          },
          {
            title: 'פחות "שכחתי להגיע"',
            desc: 'תזכורות אוטומטיות ללקוח לפני ההובלה מפחיתות ביטולים של הרגע האחרון.',
          },
        ],
      },
      comparison: {
        title: 'איך זה משתווה לרמה העולמית',
        text:
          'מעקב חי בזמן אמת, תקשורת אוטומטית עם הלקוח ושירות מבוסס AI - אלו בדיוק אותם רכיבי הליבה שחברות המשלוחים והלוגיסטיקה הגדולות בעולם בנו במשך שנים ובעלויות גבוהות. המערכת הזו לא "מעתיקה" חברה ספציפית, אלא מביאה את אותו עיקרון - שקיפות, אוטומציה ומידע בזמן אמת ללקוח - לחברת הובלות קטנה, במחיר נגיש.',
      },
      cta: {
        title: 'רוצים להיות בין הראשונים?',
        text: 'המערכת בשלבי הרחבה למובילים נוספים. השאירו פרטים ונחזור אליכם עם כל הפרטים והמחיר.',
        button: 'מעוניין/ת - דברו איתי',
      },
      footer: '© 2026 מערכת ניהול הובלות חכמה. כל הזכויות שמורות.',
    },
    en: {
      dir: 'ltr',
      langLabel: 'English',
      brand: 'Smart Management System for Movers',
      nav: { backHome: 'Back to David Move site' },
      hero: {
        eyebrow: 'For movers & relocation companies',
        title: 'Everything a moving company needs,',
        highlight: 'in one place, one price',
        subtitle:
          'A website, customer database, automatic quotes and invoices, real-time GPS tracking, and an AI-powered smart secretary that talks to your customers - all under a single monthly subscription instead of paying for separate tools.',
        ctaPrimary: 'See how it works',
        ctaSecondary: 'View a live example',
      },
      savings: {
        title: 'What this costs separately today',
        intro: 'If you built this yourself, here is what each piece typically costs in the market:',
        rows: [
          { label: 'Website build & ongoing maintenance', cost: '$40-80/month' },
          { label: 'Invoicing software', cost: '$15-40/month' },
          { label: 'CRM / lead management', cost: '$30-80/month' },
          { label: 'Real-time shipment tracking', cost: '$30-80/month (if available at all)' },
          { label: 'A human assistant/secretary', cost: 'Hundreds of dollars a month' },
        ],
        aloneTotal: 'Total separately: roughly $115-280/month, and still no human assistant, no AI at all',
        bundleTitle: 'With this system',
        bundleText: 'All of it in one simple monthly subscription - you save money and the hassle of managing several vendors.',
      },
      features: {
        title: 'What you actually get',
        subtitle: 'Not promises - features that are already built and working',
        items: [
          {
            icon: <Globe className={iconClass} aria-hidden="true" />,
            title: 'Your own professional website',
            desc: 'A customer-facing site with an automatic price-estimate form, mobile-friendly and accessible.',
          },
          {
            icon: <Bot className={iconClass} aria-hidden="true" />,
            title: 'AI-powered smart secretary',
            desc: 'A digital assistant that answers questions, summarizes business data and issues quotes - available 24/7.',
          },
          {
            icon: <FileText className={iconClass} aria-hidden="true" />,
            title: 'Automatic quotes & invoicing',
            desc: 'Automatic sequential numbering, free built-in issuing, or a connection to a licensed invoicing provider for bigger businesses.',
          },
          {
            icon: <MapPin className={iconClass} aria-hidden="true" />,
            title: 'Real-time move tracking',
            desc: 'Customers get a personal link to see the move status and location live, without calling to ask.',
          },
          {
            icon: <Users className={iconClass} aria-hidden="true" />,
            title: 'Centralized customer & lead database',
            desc: 'Every inquiry is saved automatically - no lead gets lost even if staff changes.',
          },
          {
            icon: <BellRing className={iconClass} aria-hidden="true" />,
            title: 'Automatic SMS & email reminders',
            desc: 'Fewer cancellations and no-shows before the moving date, with zero manual effort.',
          },
          {
            icon: <BarChart3 className={iconClass} aria-hidden="true" />,
            title: 'Reports & AI pricing recommendations',
            desc: 'Analysis of busy days, popular items and pricing suggestions based on real data, not guesswork.',
          },
          {
            icon: <ShieldCheck className={iconClass} aria-hidden="true" />,
            title: 'Built-in legal protection',
            desc: 'Privacy policy, terms of use and an accessibility statement - ready in advance, without a separate lawyer bill.',
          },
        ],
      },
      hidden: {
        title: 'Things you probably haven’t thought about',
        intro: 'Looking only at "website + invoices" misses a few things that genuinely save money and risk:',
        items: [
          {
            title: 'Legal risk that disappears',
            desc: 'A business without a privacy policy and accessibility statement is exposed to legal claims in many places. Here it already exists and is ready.',
          },
          {
            title: 'A clean paper trail for your accountant',
            desc: 'Automatic sequential numbering of quotes and invoices helps with audits and tax reporting - no manual bookkeeping.',
          },
          {
            title: 'Business advice without paying a consultant',
            desc: 'The AI itself identifies busy days, popular items and pricing trends - insights that usually cost money.',
          },
          {
            title: 'Fewer "I forgot" moments',
            desc: 'Automatic reminders to the customer before the move reduce last-minute cancellations.',
          },
        ],
      },
      comparison: {
        title: 'How this compares to world-class platforms',
        text:
          'Live real-time tracking, automated customer communication and AI-based service are exactly the core building blocks that the world’s biggest logistics and delivery companies spent years and large budgets building. This system doesn’t copy any specific company - it brings the same principle, transparency, automation and real-time information for the customer, to a small moving business at an accessible price.',
      },
      cta: {
        title: 'Want to be one of the first?',
        text: 'The system is expanding to more moving companies. Leave your details and we’ll get back to you with full details and pricing.',
        button: 'I’m interested - talk to me',
      },
      footer: '© 2026 Smart Moving Management System. All rights reserved.',
    },
    fr: {
      dir: 'ltr',
      langLabel: 'Français',
      brand: 'Système de gestion intelligent pour déménageurs',
      nav: { backHome: 'Retour au site David Move' },
      hero: {
        eyebrow: 'Pour les entreprises de déménagement',
        title: 'Tout ce dont une entreprise de déménagement a besoin,',
        highlight: 'en un seul endroit, à un seul prix',
        subtitle:
          'Un site web, une base de clients, des devis et factures automatiques, un suivi GPS en temps réel, et une secrétaire intelligente basée sur l’IA qui répond à vos clients - le tout via un seul abonnement mensuel au lieu de payer plusieurs outils séparés.',
        ctaPrimary: 'Voir comment ça marche',
        ctaSecondary: 'Voir un exemple en direct',
      },
      savings: {
        title: 'Ce que cela coûte séparément aujourd’hui',
        intro: 'Si vous deviez construire tout cela vous-même, voici les prix courants du marché pour chaque outil :',
        rows: [
          { label: 'Création et maintenance de site web', cost: '150-300 €/mois' },
          { label: 'Logiciel de facturation', cost: '50-120 €/mois' },
          { label: 'Gestion des clients et des prospects (CRM)', cost: '90-250 €/mois' },
          { label: 'Suivi des livraisons en temps réel', cost: '90-250 €/mois (si disponible)' },
          { label: 'Un(e) assistant(e)/secrétaire', cost: 'Plusieurs centaines d’euros par mois' },
        ],
        aloneTotal: 'Total séparément : environ 380-920 €/mois, et toujours sans assistant humain ni IA',
        bundleTitle: 'Avec ce système',
        bundleText: 'Tout cela dans un seul abonnement mensuel simple - vous économisez de l’argent et le temps de gérer plusieurs fournisseurs.',
      },
      features: {
        title: 'Ce que vous obtenez réellement',
        subtitle: 'Pas des promesses - des fonctionnalités déjà construites et opérationnelles',
        items: [
          {
            icon: <Globe className={iconClass} aria-hidden="true" />,
            title: 'Votre propre site professionnel',
            desc: 'Un site client avec formulaire de devis automatique, adapté au mobile et accessible.',
          },
          {
            icon: <Bot className={iconClass} aria-hidden="true" />,
            title: 'Secrétaire intelligente basée sur l’IA',
            desc: 'Un assistant numérique qui répond aux questions, résume les données de l’entreprise et émet des devis - disponible 24h/24.',
          },
          {
            icon: <FileText className={iconClass} aria-hidden="true" />,
            title: 'Devis et factures automatiques',
            desc: 'Numérotation séquentielle automatique, émission intégrée gratuite, ou connexion à un fournisseur de facturation agréé pour les entreprises plus grandes.',
          },
          {
            icon: <MapPin className={iconClass} aria-hidden="true" />,
            title: 'Suivi du déménagement en temps réel',
            desc: 'Le client reçoit un lien personnel pour voir le statut et la position en direct, sans avoir à téléphoner.',
          },
          {
            icon: <Users className={iconClass} aria-hidden="true" />,
            title: 'Base centralisée de clients et prospects',
            desc: 'Chaque demande est enregistrée automatiquement - aucun prospect n’est perdu, même en cas de changement de personnel.',
          },
          {
            icon: <BellRing className={iconClass} aria-hidden="true" />,
            title: 'Rappels automatiques par SMS et e-mail',
            desc: 'Moins d’annulations et d’oublis avant la date du déménagement, sans effort manuel.',
          },
          {
            icon: <BarChart3 className={iconClass} aria-hidden="true" />,
            title: 'Rapports et recommandations de prix par IA',
            desc: 'Analyse des jours chargés, des articles populaires et suggestions de prix basées sur des données réelles, pas des suppositions.',
          },
          {
            icon: <ShieldCheck className={iconClass} aria-hidden="true" />,
            title: 'Protection juridique intégrée',
            desc: 'Politique de confidentialité, conditions d’utilisation et déclaration d’accessibilité - prêtes d’avance, sans facture d’avocat séparée.',
          },
        ],
      },
      hidden: {
        title: 'Des choses auxquelles vous n’avez probablement pas pensé',
        intro: 'Ne regarder que "site web + factures" fait manquer des éléments qui font vraiment économiser argent et risques :',
        items: [
          {
            title: 'Un risque juridique qui disparaît',
            desc: 'Une entreprise sans politique de confidentialité ni déclaration d’accessibilité est exposée à des plaintes. Ici, c’est déjà en place.',
          },
          {
            title: 'Une traçabilité propre pour votre comptable',
            desc: 'La numérotation séquentielle automatique des devis et factures facilite les audits et les déclarations fiscales - sans tenue manuelle.',
          },
          {
            title: 'Des conseils d’affaires sans payer de consultant',
            desc: 'L’IA identifie elle-même les jours chargés, les articles populaires et les tendances de prix - des informations qui coûtent normalement cher.',
          },
          {
            title: 'Moins de "j’ai oublié"',
            desc: 'Des rappels automatiques au client avant le déménagement réduisent les annulations de dernière minute.',
          },
        ],
      },
      comparison: {
        title: 'Comparaison avec les plateformes de classe mondiale',
        text:
          'Le suivi en direct, la communication automatisée avec le client et le service basé sur l’IA sont exactement les briques de base que les plus grandes entreprises de logistique et de livraison au monde ont mis des années et des budgets considérables à construire. Ce système ne copie aucune entreprise en particulier - il apporte le même principe, transparence, automatisation et information en temps réel pour le client, à une petite entreprise de déménagement, à un prix accessible.',
      },
      cta: {
        title: 'Vous voulez être parmi les premiers ?',
        text: 'Le système s’étend à d’autres entreprises de déménagement. Laissez vos coordonnées et nous vous recontacterons avec tous les détails et les prix.',
        button: 'Je suis intéressé(e) - contactez-moi',
      },
      footer: '© 2026 Système de gestion intelligent pour déménageurs. Tous droits réservés.',
    },
    ar: {
      dir: 'rtl',
      langLabel: 'العربية',
      brand: 'نظام إدارة ذكي لشركات النقل',
      nav: { backHome: 'العودة إلى موقع David Move' },
      hero: {
        eyebrow: 'لشركات النقل والانتقال',
        title: 'كل ما تحتاجه شركة نقل،',
        highlight: 'في مكان واحد وبسعر واحد',
        subtitle:
          'موقع إلكتروني، قاعدة بيانات عملاء، عروض أسعار وفواتير تلقائية، تتبع GPS لحظي، وسكرتيرة ذكية تعمل بالذكاء الاصطناعي تتحدث مع عملائك - كل ذلك ضمن اشتراك شهري واحد بدلاً من الدفع مقابل أدوات منفصلة.',
        ctaPrimary: 'شاهد كيف يعمل',
        ctaSecondary: 'مشاهدة مثال حي',
      },
      savings: {
        title: 'كم يكلّف هذا بشكل منفصل اليوم',
        intro: 'إذا أردت بناء هذا بنفسك، إليك الأسعار الشائعة في السوق لكل أداة على حدة:',
        rows: [
          { label: 'بناء موقع إلكتروني وصيانته', cost: '150-300 شيكل شهرياً' },
          { label: 'برنامج فواتير', cost: '50-150 شيكل شهرياً' },
          { label: 'إدارة العملاء والعملاء المحتملين', cost: '100-300 شيكل شهرياً' },
          { label: 'تتبع الشحنات لحظياً', cost: '100-300 شيكل شهرياً (إن وُجد أصلاً)' },
          { label: 'مساعد/سكرتيرة', cost: 'آلاف الشواكل شهرياً' },
        ],
        aloneTotal: 'المجموع منفصلاً: حوالي 400-1,050 شيكل شهرياً، وبدون مساعد بشري أو ذكاء اصطناعي أصلاً',
        bundleTitle: 'مع هذا النظام',
        bundleText: 'كل هذا ضمن اشتراك شهري واحد وبسيط - توفّر المال ووقت إدارة عدة موردين مختلفين.',
      },
      features: {
        title: 'ما الذي تحصل عليه فعلياً',
        subtitle: 'ليست وعوداً - ميزات مبنية وتعمل بالفعل',
        items: [
          {
            icon: <Globe className={iconClass} aria-hidden="true" />,
            title: 'موقعك الاحترافي الخاص',
            desc: 'موقع للعملاء مع نموذج تسعير تلقائي، متوافق مع الجوال ويمكن الوصول إليه.',
          },
          {
            icon: <Bot className={iconClass} aria-hidden="true" />,
            title: 'سكرتيرة ذكية تعمل بالذكاء الاصطناعي',
            desc: 'مساعد رقمي يجيب على الأسئلة، يلخّص بيانات العمل، ويصدر عروض الأسعار - متاح على مدار الساعة.',
          },
          {
            icon: <FileText className={iconClass} aria-hidden="true" />,
            title: 'عروض أسعار وفواتير تلقائية',
            desc: 'ترقيم تسلسلي تلقائي، إصدار مجاني مدمج، أو ربط بمزوّد فواتير مرخّص للأعمال الأكبر.',
          },
          {
            icon: <MapPin className={iconClass} aria-hidden="true" />,
            title: 'تتبع النقل لحظياً',
            desc: 'يحصل العميل على رابط شخصي لمشاهدة حالة النقل وموقعه لحظياً، دون الحاجة للاتصال والسؤال.',
          },
          {
            icon: <Users className={iconClass} aria-hidden="true" />,
            title: 'قاعدة بيانات مركزية للعملاء والعملاء المحتملين',
            desc: 'يُحفظ كل استفسار تلقائياً - لا يُفقد أي عميل محتمل حتى عند تغيير الموظفين.',
          },
          {
            icon: <BellRing className={iconClass} aria-hidden="true" />,
            title: 'تذكيرات تلقائية عبر الرسائل النصية والبريد الإلكتروني',
            desc: 'تقليل الإلغاءات والنسيان قبل موعد النقل، دون أي جهد يدوي.',
          },
          {
            icon: <BarChart3 className={iconClass} aria-hidden="true" />,
            title: 'تقارير وتوصيات تسعير بالذكاء الاصطناعي',
            desc: 'تحليل الأيام المزدحمة والعناصر الأكثر طلباً، وتوصيات تسعير مبنية على بيانات حقيقية وليس تخميناً.',
          },
          {
            icon: <ShieldCheck className={iconClass} aria-hidden="true" />,
            title: 'حماية قانونية مدمجة',
            desc: 'سياسة خصوصية، شروط استخدام، وبيان إتاحة - جاهزة مسبقاً، دون فاتورة محامٍ منفصلة.',
          },
        ],
      },
      hidden: {
        title: 'أشياء ربما لم تفكر بها',
        intro: 'النظر فقط إلى "موقع + فواتير" يفوّت أموراً توفّر فعلاً المال وتقلّل المخاطر:',
        items: [
          {
            title: 'مخاطرة قانونية تختفي',
            desc: 'أي عمل بدون سياسة خصوصية وبيان إتاحة معرّض لمطالبات قانونية. هنا هذا موجود وجاهز مسبقاً.',
          },
          {
            title: 'سجل موثّق واضح لمحاسبك',
            desc: 'الترقيم التسلسلي التلقائي لعروض الأسعار والفواتير يساعد في التدقيق والتقارير الضريبية - دون عمل يدوي.',
          },
          {
            title: 'استشارة أعمال دون دفع لمستشار',
            desc: 'يحدد الذكاء الاصطناعي بنفسه الأيام المزدحمة والعناصر الشائعة واتجاهات الأسعار - رؤى عادة ما تكلّف مالاً.',
          },
          {
            title: 'تقليل حالات "نسيت الموعد"',
            desc: 'تذكيرات تلقائية للعميل قبل النقل تقلل من الإلغاءات في اللحظة الأخيرة.',
          },
        ],
      },
      comparison: {
        title: 'كيف يقارن هذا بمنصات عالمية',
        text:
          'التتبع اللحظي، والتواصل الآلي مع العميل، والخدمة المعتمدة على الذكاء الاصطناعي - هي بالضبط اللبنات الأساسية نفسها التي أمضت أكبر شركات اللوجستيات والتوصيل في العالم سنوات وميزانيات ضخمة لبنائها. هذا النظام لا "ينسخ" شركة معينة، بل يجلب نفس المبدأ - الشفافية والأتمتة والمعلومات اللحظية للعميل - إلى شركة نقل صغيرة، بسعر ميسور.',
      },
      cta: {
        title: 'تريد أن تكون من الأوائل؟',
        text: 'النظام في مرحلة التوسع لشركات نقل إضافية. اترك بياناتك وسنعاود التواصل معك بكل التفاصيل والأسعار.',
        button: 'أنا مهتم - تواصلوا معي',
      },
      footer: '© 2026 نظام إدارة ذكي لشركات النقل. جميع الحقوق محفوظة.',
    },
    ru: {
      dir: 'ltr',
      langLabel: 'Русский',
      brand: 'Умная система управления для транспортных компаний',
      nav: { backHome: 'Вернуться на сайт David Move' },
      hero: {
        eyebrow: 'Для компаний по переезду и перевозкам',
        title: 'Всё, что нужно транспортной компании,',
        highlight: 'в одном месте и по одной цене',
        subtitle:
          'Сайт, база клиентов, автоматические предложения цены и счета, GPS-отслеживание в реальном времени и умный секретарь на основе ИИ, который общается с вашими клиентами - всё в рамках одной ежемесячной подписки вместо оплаты отдельных инструментов.',
        ctaPrimary: 'Посмотреть, как это работает',
        ctaSecondary: 'Посмотреть живой пример',
      },
      savings: {
        title: 'Сколько это стоит по отдельности сегодня',
        intro: 'Если бы вы собирали это самостоятельно, вот типичные рыночные цены на каждый инструмент:',
        rows: [
          { label: 'Создание и обслуживание сайта', cost: '150-300 ₪/мес' },
          { label: 'Программа для выставления счетов', cost: '50-150 ₪/мес' },
          { label: 'Управление клиентами и лидами (CRM)', cost: '100-300 ₪/мес' },
          { label: 'Отслеживание доставки в реальном времени', cost: '100-300 ₪/мес (если вообще есть)' },
          { label: 'Помощник/секретарь', cost: 'Тысячи шекелей в месяц' },
        ],
        aloneTotal: 'Итого по отдельности: около 400-1050 ₪/мес, и всё ещё без помощника-человека и без ИИ',
        bundleTitle: 'С этой системой',
        bundleText: 'Всё это в одной простой ежемесячной подписке - вы экономите деньги и время на управление несколькими поставщиками.',
      },
      features: {
        title: 'Что вы на самом деле получаете',
        subtitle: 'Не обещания - уже работающие функции',
        items: [
          {
            icon: <Globe className={iconClass} aria-hidden="true" />,
            title: 'Ваш собственный профессиональный сайт',
            desc: 'Клиентский сайт с автоматической формой расчёта стоимости, адаптированный под мобильные устройства и доступный.',
          },
          {
            icon: <Bot className={iconClass} aria-hidden="true" />,
            title: 'Умный секретарь на основе ИИ',
            desc: 'Цифровой помощник, который отвечает на вопросы, обобщает данные бизнеса и выставляет предложения цены - доступен 24/7.',
          },
          {
            icon: <FileText className={iconClass} aria-hidden="true" />,
            title: 'Автоматические предложения цены и счета',
            desc: 'Автоматическая последовательная нумерация, бесплатное встроенное оформление или подключение к лицензированному провайдеру для более крупного бизнеса.',
          },
          {
            icon: <MapPin className={iconClass} aria-hidden="true" />,
            title: 'Отслеживание переезда в реальном времени',
            desc: 'Клиент получает персональную ссылку, чтобы видеть статус и местоположение перевозки в реальном времени, не звоня с вопросами.',
          },
          {
            icon: <Users className={iconClass} aria-hidden="true" />,
            title: 'Централизованная база клиентов и лидов',
            desc: 'Каждый запрос сохраняется автоматически - ни один лид не теряется, даже при смене сотрудников.',
          },
          {
            icon: <BellRing className={iconClass} aria-hidden="true" />,
            title: 'Автоматические напоминания по SMS и email',
            desc: 'Меньше отмен и забытых визитов перед датой переезда, без ручных усилий.',
          },
          {
            icon: <BarChart3 className={iconClass} aria-hidden="true" />,
            title: 'Отчёты и рекомендации по ценам от ИИ',
            desc: 'Анализ загруженных дней, популярных товаров и рекомендации по ценам на основе реальных данных, а не догадок.',
          },
          {
            icon: <ShieldCheck className={iconClass} aria-hidden="true" />,
            title: 'Встроенная юридическая защита',
            desc: 'Политика конфиденциальности, условия использования и заявление о доступности - готовы заранее, без отдельного счёта от юриста.',
          },
        ],
      },
      hidden: {
        title: 'То, о чём вы, вероятно, не подумали',
        intro: 'Если смотреть только на "сайт + счета", можно упустить вещи, которые реально экономят деньги и снижают риски:',
        items: [
          {
            title: 'Юридический риск, который исчезает',
            desc: 'Бизнес без политики конфиденциальности и заявления о доступности подвержен искам. Здесь это уже готово.',
          },
          {
            title: 'Чёткий след документов для бухгалтера',
            desc: 'Автоматическая последовательная нумерация предложений и счетов помогает при аудите и налоговой отчётности - без ручного учёта.',
          },
          {
            title: 'Бизнес-советы без оплаты консультанта',
            desc: 'ИИ сам определяет загруженные дни, популярные товары и ценовые тренды - инсайты, которые обычно стоят денег.',
          },
          {
            title: 'Меньше ситуаций "я забыл"',
            desc: 'Автоматические напоминания клиенту перед переездом снижают количество отмен в последний момент.',
          },
        ],
      },
      comparison: {
        title: 'Как это соотносится с платформами мирового уровня',
        text:
          'Живое отслеживание в реальном времени, автоматизированное общение с клиентом и сервис на основе ИИ - это именно те базовые компоненты, на создание которых крупнейшие логистические и курьерские компании мира потратили годы и огромные бюджеты. Эта система не копирует конкретную компанию - она приносит тот же принцип: прозрачность, автоматизацию и информацию в реальном времени для клиента - небольшой транспортной компании по доступной цене.',
      },
      cta: {
        title: 'Хотите быть одним из первых?',
        text: 'Система расширяется на другие транспортные компании. Оставьте свои данные, и мы свяжемся с вами со всеми деталями и ценами.',
        button: 'Мне интересно - свяжитесь со мной',
      },
      footer: '© 2026 Умная система управления для транспортных компаний. Все права защищены.',
    },
  };
}

const LANG_ORDER: Lang[] = ['he', 'en', 'fr', 'ar', 'ru'];

const ForMovers = () => {
  const [lang, setLang] = useState<Lang>('he');
  const [showIntro, setShowIntro] = useState(!hasSeenIntro());
  const content = buildContent();
  const t = content[lang];

  return (
    <div className="min-h-screen bg-background" dir={t.dir} lang={lang}>
      {showIntro && <VideoIntro onDone={() => setShowIntro(false)} />}
      {/* Top bar: language switcher + link back to the customer-facing site */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 h-12 flex items-center justify-end text-sm">
          <div className="flex items-center gap-1" role="group" aria-label="Language / שפה">
            {LANG_ORDER.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  l === lang ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
                aria-pressed={l === lang}
              >
                {content[l].langLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative text-white overflow-hidden min-h-[480px] flex flex-col justify-center">
        {/* רקע וידאו */}
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dora8sxcb/video/upload/v1783457470/hailuo-2_3_English_Create_a_futuristic_high-tech_promotional_video_for_a_SaaS_platform_that-0_1_hf9pb8.mp4"
            type="video/mp4"
          />
        </video>
        {/* שכבת אפלה */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Truck className="h-7 w-7 text-blue-300" aria-hidden="true" />
            {/* שם המוצר/הפלטפורמה - נשאר קבוע בכל שפה (שם מותג), בניגוד לשם
                העסק של כל מוביל (זה שמופיע ב-Navbar/Footer של האתר שלו עצמו). */}
            <span dir="ltr" className="text-2xl font-bold tracking-tight text-white">Movalo</span>
          </div>
          <p className="text-blue-300/80 text-sm mb-6">{t.brand}</p>
          <p className="text-blue-300 font-semibold mb-2">{t.hero.eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2">{t.hero.title}</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-blue-300 mb-6">{t.hero.highlight}</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">{t.hero.subtitle}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-4 text-lg font-semibold w-full sm:w-auto">
                {t.hero.ctaPrimary}
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 text-lg font-semibold w-full sm:w-auto"
              >
                {t.hero.ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Savings comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{t.savings.title}</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{t.savings.intro}</p>

          <Card className="mb-6">
            <CardContent className="p-0">
              <ul className="divide-y">
                {t.savings.rows.map((row, i) => (
                  <li key={i} className="flex items-center justify-between px-6 py-4">
                    <span className="flex items-center gap-3 text-gray-800">
                      <XIcon className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
                      {row.label}
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">{row.cost}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-center text-gray-700 font-medium mb-10">{t.savings.aloneTotal}</p>

          <Card className="border-2 border-blue-600 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Check className="h-6 w-6" aria-hidden="true" />
                {t.savings.bundleTitle}
              </CardTitle>
              <CardDescription className="text-blue-900 text-base">{t.savings.bundleText}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.features.title}</h2>
            <p className="text-gray-600">{t.features.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.items.map((f, i) => (
              <Card key={i} className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-3">{f.icon}</div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden value / things they might not have identified */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{t.hidden.title}</h2>
          <p className="text-center text-gray-600 mb-10">{t.hidden.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.hidden.items.map((item, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison to world-class platforms */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.comparison.title}</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{t.comparison.text}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
          <p className="text-blue-100 mb-8">{t.cta.text}</p>
          <Link to="/register">
            <Button className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-4 text-lg font-semibold">
              {t.cta.button}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">{t.footer}</footer>
    </div>
  );
};

export default ForMovers;
