const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Security HTTP headers - configured to allow cross-origin API access in dev/prod
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-side)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Request logger for clear visibility in terminal
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    message: 'Too many login or registration attempts from this IP, please try again in 15 minutes.',
    error: 'RateLimitExceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Root endpoint handler for GET / and GET /api
const rootHandler = (req, res) => {
  const acceptsHtml = req.accepts(['html', 'json']) === 'html';
  const clientUrl = config.clientUrl || 'http://localhost:5173';

  if (acceptsHtml) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TeenTrack API Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; max-width: 640px; width: 100%; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
    h1 { font-size: 26px; font-weight: 800; margin-bottom: 12px; color: #fff; letter-spacing: -0.5px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5); }
    .btn:hover { background: #4f46e5; transform: translateY(-2px); }
    .meta { margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155; text-align: left; }
    .meta-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; }
    .endpoints { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .ep-item { background: #0f172a; padding: 8px 12px; border-radius: 8px; border: 1px solid #1e293b; font-family: monospace; font-size: 12px; color: #38bdf8; text-decoration: none; }
    .cred { margin-top: 16px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 12px; font-size: 13px; color: #c7d2fe; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Backend API Server is Active</div>
    <h1>TeenTrack API (Port 5000)</h1>
    <p>You have accessed the Express REST API backend. To view the user interface and track expenses, open the frontend web app.</p>
    <a href="${clientUrl}" class="btn">🚀 Open Frontend Application (${clientUrl})</a>
    <div class="cred">
      <strong>Demo Account:</strong> alex.demo@teentracker.com &bull; <strong>Password:</strong> Password123!
    </div>
    <div class="meta">
      <div class="meta-title">Available API Endpoints</div>
      <div class="endpoints">
        <a href="/api/health" class="ep-item">GET /api/health</a>
        <span class="ep-item">POST /api/auth/login</span>
        <span class="ep-item">GET /api/expenses</span>
        <span class="ep-item">GET /api/budgets/status</span>
        <span class="ep-item">GET /api/analytics/summary</span>
        <span class="ep-item">GET /api/recommendations</span>
      </div>
    </div>
  </div>
</body>
</html>`);
  }

  return res.status(200).json({
    success: true,
    name: 'Teenager Expense Tracker API',
    status: 'online',
    version: '1.0.0',
    frontendUrl: clientUrl,
    healthCheck: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      expenses: '/api/expenses',
      income: '/api/income',
      budgets: '/api/budgets',
      analytics: '/api/analytics',
      recommendations: '/api/recommendations',
    },
  });
};

app.get('/', rootHandler);
app.get('/api', rootHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teenager Expense Tracker API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
