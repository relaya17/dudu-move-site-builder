import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import moveRequestRouter from './routes/moveRequestRoutes';
import aiRouter from './routes/aiRoutes';
import mongoRoutes from './routes/mongoRoutes';
import pricingRoutes from './routes/pricingRoutes';
import trackingRoutes from './routes/trackingRoutes';
import publicRoutes from './routes/publicRoutes';
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimit, clearRateLimitStore } from './middleware/rateLimiter';
import { connectMongoDB } from './database/mongoConnection';
import { startReminderCron } from './services/ReminderCronService';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectMongoDB();

// Security middleware
// Content-Security-Policy מושבת כי אותו שרת מגיש גם את קבצי ה-frontend הסטטיים
// (Google Fonts, vite bundles) שה-CSP הדיפולטיבי של helmet היה חוסם.
app.use(helmet({ contentSecurityPolicy: false }));

// דחיסת gzip/brotli לכל התגובות (JS/CSS/JSON) - חינמי לגמרי, מקטין תעבורה
// ומאיץ טעינה משמעותית, במיוחד עבור ה-bundle של ה-frontend שאותו שרת מגיש.
app.use(compression());

// רשימת מקורות מותרים ל-CORS: כתובות ה-frontend הידועות (Netlify + אותו שרת Render
// שמגיש גם את קבצי ה-build הסטטיים) בתוספת כל מה שמוגדר ב-FRONTEND_URL/CORS_ORIGIN
// (אפשר כמה כתובות מופרדות בפסיק). זה מונע מצב שבו הגדרה שגויה/חסרה באחד ממשתני
// הסביבה ב-Render "נועלת" את טופס יצירת הקשר הציבורי (כפי שקרה בפועל - 5.7.2026).
const DEFAULT_ALLOWED_ORIGINS = [
  'https://david-move.netlify.app',
  'http://localhost:5173',
  'http://localhost:3001'
];

// FRONTEND_URL הוא ערך יחיד (משמש גם לבניית קישורים בהתראות SMS/מייל - ר' SmsService/EmailService),
// לכן הוא נוסף כמו שהוא. CORS_ORIGIN מיועד במיוחד לרשימת מקורות מרובים ל-CORS, מופרדים בפסיק.
const corsOriginList = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const envOrigins = [process.env.FRONTEND_URL, ...corsOriginList]
  .filter((value): value is string => Boolean(value));

const allowedOrigins = Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // בקשות ללא origin (curl, שרת-לשרת, אפליקציות מובייל) - תמיד מותר.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    console.warn(`⚠️  CORS: בקשה ממקור שאינו ברשימת ההיתרים נחסמה: ${origin}`);
    callback(null, false);
  },
  credentials: true
}));

// Rate limiting - רק על נתיבי API, כדי לא להאט/להגביל בטעות טעינת קבצים סטטיים (JS/CSS/תמונות)
// של ה-frontend שאותו שרת מגיש (ר' express.static למטה).
app.use('/api', generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Development endpoint to clear rate limit store
if (process.env.NODE_ENV === 'development') {
  app.post('/clear-rate-limit', (req, res) => {
    clearRateLimitStore();
    res.status(200).json({
      success: true,
      message: 'Rate limit store cleared'
    });
  });
}

// API routes
app.use('/api/move-requests', moveRequestRouter);
app.use('/api/ai', aiRouter);
app.use('/api/mongo', mongoRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);

// הגשת קבצי ה-frontend הבנויים (שרת Render אחד מגיש גם את ה-API וגם את האתר).
// maxAge ארוך זול/מהיר לגמרי: Vite מוסיף hash לשם כל קובץ JS/CSS, כך שקובץ עם
// hash מסוים לעולם לא משתנה בתוכן - דפדפן שמור אותו במטמון לשנה זה בטוח ומאיץ טעינות חוזרות.
// index.html עצמו לא נכלל ב-maxAge הזה כי הוא מוגש בנפרד ב-SPA fallback למטה.
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath, { maxAge: '1y', index: false }));

// SPA fallback - כל בקשת GET שאינה API ולא תואמת קובץ סטטי קיים מקבלת את index.html
// (כדי ש-React Router יוכל לטפל בניתוב בצד הלקוח, כולל /tracking/:token)
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Handle 404 for unknown routes (בעיקר עבור /api/* שלא נתפסו)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ MongoDB API available at http://localhost:${PORT}/api/mongo`);
  console.log(`📍 Tracking API available at http://localhost:${PORT}/api/tracking`);
  console.log(`🖥️  Serving frontend build from ${frontendDistPath}`);
  startReminderCron();
});

export default app;
