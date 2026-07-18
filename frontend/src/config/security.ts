export const securityConfig = {
    // הגדרות אבטחה
    security: {
        // הגדרות סיסמה
        password: {
            minLength: 8,
            requireNumbers: true,
            requireSpecialChars: true,
            requireUppercase: true,
            requireLowercase: true,
            maxAttempts: 5,
            lockoutDuration: 15, // דקות
        },

        // הגדרות הצפנה
        encryption: {
            algorithm: 'AES-256-GCM',
            keyLength: 256,
            saltRounds: 10,
        },

        // הגדרות אימות
        authentication: {
            sessionTimeout: 30, // דקות
            requireTwoFactor: true,
            jwtExpiration: '1h',
            refreshTokenExpiration: '7d',
        },

        // הגדרות הגנה מפני התקפות
        protection: {
            rateLimiting: {
                windowMs: 15 * 60 * 1000, // 15 דקות
                maxRequests: 100, // מספר בקשות מקסימלי
            },
            xss: {
                enabled: true,
                mode: 'block',
            },
            csrf: {
                enabled: true,
                tokenLength: 32,
            },
        },

        // הגדרות Firebase
        firebase: {
            auth: {
                persistence: 'LOCAL',
                emulatorPort: 9099,
            },
            firestore: {
                cacheSizeBytes: 50000000, // 50MB
                experimentalForceLongPolling: true,
            },
        },

        // הגדרות CORS
        cors: {
            origin: ['https://david-move.co.il'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Range', 'X-Total-Count'],
            credentials: true,
            maxAge: 3600,
        },

        // הגדרות Helmet (אבטחת HTTP)
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'", 'https://api.david-move.co.il'],
                },
            },
            referrerPolicy: { policy: 'same-origin' },
            frameguard: { action: 'deny' },
        },
    },

    // הגדרות לוגים ומעקב
    logging: {
        level: 'info',
        format: 'json',
        saveToFile: true,
        maxFiles: 5,
        maxSize: '10m',
        sensitiveFields: [
            'password',
            'token',
            'credit_card',
            'ssn',
        ],
    },

    // הגדרות גיבוי
    backup: {
        frequency: 'daily',
        retention: 30, // ימים
        encryption: true,
        location: 'gs://david-move-backups',
    },
};