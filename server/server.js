const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const astroRoutes = require('./routes/astroRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const tarotRoutes = require('./routes/tarotRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://celesticare-deployed-client.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview deployments for this frontend only.
  return /^https:\/\/celesticare-deployed-client(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
    || /^https:\/\/celesticare-deployed-client-[a-z0-9-]+-cranel62s-projects\.vercel\.app$/i.test(origin);
};

app.set('trust proxy', 1);

// Database & Security Config
app.use(helmet()); 
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); 
app.use('/api', apiLimiter);

// Routing (Cleaned up duplicate outfitRoutes declaration)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/astro', astroRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/tarot', tarotRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error(`[Startup Error] ${error.message}`);
  process.exit(1);
});
