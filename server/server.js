require('dotenv').config()


const express = require("express");
const simplifyRoutes = require('./routes/simplifyRoutes');
const app = express();
const cors = require("cors");
const errorHandler = require('./middleware/errorHandler');

const allowedOrigin = process.env.CLIENT_URL;
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = (allowedOrigin || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const localOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

if (isProduction && configuredOrigins.length === 0) {
  console.warn('CLIENT_URL is not configured; production CORS will reject browser origins.');
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin) || (!isProduction && localOrigins.has(origin))) {
      return callback(null, true);
    }
    const error = new Error('Origin is not allowed by the server CORS policy.');
    error.statusCode = 403;
    error.code = 'CORS_ORIGIN_DENIED';
    return callback(error);
  }
}));
app.use(express.json()); 
const PORT = Number(process.env.PORT) || 5000;
const requestTimestamps = new Map();

app.use((req, res, next) => {
  if (req.method !== 'POST' || req.path !== '/api/simplify') return next();
  const now = Date.now();
  const recent = (requestTimestamps.get(req.ip) || []).filter(timestamp => now - timestamp < 60000);
  if (recent.length >= 20) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please wait a minute and try again.' });
  }
  recent.push(now);
  requestTimestamps.set(req.ip, recent);
  return next();
});

app.use('/api', simplifyRoutes);

app.get("/", (req, res) => {
  res.json({ status: 'ok' });

})

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
  });
}

module.exports = app;