"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const results_routes_1 = __importDefault(require("./routes/results.routes"));
const careers_routes_1 = __importDefault(require("./routes/careers.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
// Validate configuration
try {
    (0, config_1.validateConfig)();
}
catch (error) {
    console.error('❌ Configuration error:', error);
    process.exit(1);
}
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware (development only)
if (config_1.config.isDevelopment) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Career Fit API is running',
        environment: config_1.config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/interviews', interview_routes_1.default);
app.use('/api/results', results_routes_1.default);
app.use('/api/careers', careers_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: config_1.config.isDevelopment ? err.message : 'An unexpected error occurred',
            ...(config_1.config.isDevelopment && { stack: err.stack }),
        },
    });
});
// Start server
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log('\n🚀 Career Fit API Server');
    console.log(`📍 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 CORS enabled for: ${config_1.config.corsOrigin}`);
    console.log('\n✨ Ready to accept requests!\n');
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\n👋 SIGINT signal received: closing HTTP server');
    process.exit(0);
});
