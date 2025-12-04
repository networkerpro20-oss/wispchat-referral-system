require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const referralRoutes = require('./routes/referral.routes');
const userRoutes = require('./routes/user.routes');
const rewardRoutes = require('./routes/reward.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'WispChat Referral System API - Easy Access Newtelecom',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      referrals: '/api/referrals',
      rewards: '/api/rewards'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/rewards', rewardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏢 Company: ${process.env.COMPANY_NAME || 'Easy Access Newtelecom'}`);
  });
}

module.exports = app;
