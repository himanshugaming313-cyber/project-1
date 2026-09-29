const app = require('./app');
const config = require('./config/env');

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 Teenager Expense Tracker API running on port ${config.port}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
