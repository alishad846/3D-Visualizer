const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/env');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const productRoutes = require('./routes/products');
const viewerRoutes = require('./routes/viewer');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const recommendationRoutes = require('./routes/recommendations');

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Register background jobs
require('./services/purgeService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

// Render / reverse-proxy: needed for secure cookies and rate-limit IP
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  xssFilter: false,
  noSniff: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'ScanVista Backend Node API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/products', productRoutes);
app.use('/api/viewer', viewerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ScanVista API Server running on port ${PORT}`);
});
