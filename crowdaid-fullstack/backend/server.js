const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const fs        = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Ensure uploads directory exists on startup
const uploadsDir = path.join(__dirname, 'uploads/campaigns');
fs.mkdirSync(uploadsDir, { recursive: true });

// ── CORS — allows both local dev and production Netlify URL ──────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // set this in Render env vars to your Netlify URL
].filter(Boolean); // removes undefined if FRONTEND_URL not set

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://crowdaids.netlify.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/admin',     require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CrowdAid API running 🚀', time: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ── Connect to MongoDB then start server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅  MongoDB connected');
    const server = app.listen(PORT, () => {
      console.log(`🚀  Server → http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => { server.close(() => mongoose.connection.close()); });
    process.on('SIGINT',  () => { server.close(() => { mongoose.connection.close(); process.exit(0); }); });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.error('    Check your MONGO_URI in the .env file.');
    process.exit(1);
  });