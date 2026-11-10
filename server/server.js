require('dotenv').config()


const express = require("express");
const simplifyRoutes = require('./routes/simplifyRoutes');
const app = express();
const cors = require("cors");
const errorHandler = require('./middleware/errorHandler');

const allowedOrigin = process.env.CLIENT_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json()); 
const PORT = 5000;
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

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
})