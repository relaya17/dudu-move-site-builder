import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moveRequestRouter from './routes/moveRequestRoutes';
import aiRouter from './routes/aiRoutes';
import estimateRoutes from './routes/estimateRoutes';
import customerRoutes from './routes/customerRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import searchRoutes from './routes/searchRoutes';
import pricingRoutes from './routes/pricingRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimit, clearRateLimitStore } from './middleware/rateLimiter';
import { connectMongoDB } from './database/mongoConnection';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectMongoDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow frontend URL from environment variable or all origins in development
  credentials: true
}));

// Rate limiting
app.use(generalRateLimit);

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

// Basic root route for health check / general access
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working' });
});

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
app.use('/api/estimates', estimateRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/pricing', pricingRoutes);

// Handle 404 for unknown routes
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
  console.log(`🗄️ Estimates API: http://localhost:${PORT}/api/estimates`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics`);
});

export default app;
