export const databaseConfig = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/david-move',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    }
};

export const serverConfig = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
}; 