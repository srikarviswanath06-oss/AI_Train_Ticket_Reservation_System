require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const trainsRouter = require('./routes/trains');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 8000;
const DEBUG = process.env.NODE_ENV !== 'production';

// --- CORS -----------------------------------------------------------
// Equivalent of settings.py's CORS_ALLOW_ALL_ORIGINS / CORS_ALLOWED_ORIGINS:
// wide open in development, locked to explicit origins in production.
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: DEBUG ? true : allowedOrigins,
  })
);

app.use(express.json());

// --- Static files -----------------------------------------------------
// Equivalent of Django's STATIC_URL/whitenoise setup: serve the built
// frontend files directly. `index: false` because express.static would
// otherwise auto-serve public/index.html for '/', shadowing the explicit
// route below (the original Django Index view serves manual.html at '/',
// not index.html).
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// --- Page routes --------------------------------------------------------
// Equivalent of Train/urls.py: '' -> Index (manual.html), 'Ai' -> AI (Ai.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manual.html'));
});

app.get('/Ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Ai.html'));
});

// --- API routes -----------------------------------------------------
app.use(trainsRouter);
app.use(aiRouter);

// --- 404 fallback -----------------------------------------------------
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (DEBUG=${DEBUG})`);
});
