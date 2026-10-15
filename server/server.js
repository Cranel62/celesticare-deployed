require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const astroRoutes = require('./routes/astroRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const tarotRoutes = require('./routes/tarotRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

// Database & Security Config
connectDB();
app.use(helmet()); 
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));