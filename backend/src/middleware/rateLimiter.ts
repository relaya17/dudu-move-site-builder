import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export const createRateLimiter = (options: {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
}) => {
    const {
        windowMs,
        max,
        message = 'Too many requests, please try again later.',
        skipSuccessfulRequests = false,
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = req.ip || 'unknown';
        const now = Date.now();

        // Clean up expired entries
        Object.keys(store).forEach(k => {
            if (store[k].resetTime < now) {
                delete store[k];
            }
        });

        // Initialize or get current count
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 0,
                resetTime: now + windowMs,
            };
        }

        // Check if limit exceeded
        if (store[key].count >= max) {
            res.status(429).json({
                success: false,
                error: {
                    message,
                    retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
                },
            });
            return;
        }

        // Track the request
        const originalSend = res.json;
        res.json = function (data: any) {
            // Only count failed requests if skipSuccessfulRequests is true
            if (!skipSuccessfulRequests || res.statusCode >= 400) {
                store[key].count++;
            }
            return originalSend.call(this, data);
        };

        next();
    };
};

// Predefined rate limiters
export const generalRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

export const estimateRateLimit = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 estimate submissions per hour
    message: 'Too many estimate requests. Please wait before submitting another request.',
    skipSuccessfulRequests: true,
});

export const adminRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // higher limit for admin operations
    message: 'Too many admin requests, please try again later.',
}); 