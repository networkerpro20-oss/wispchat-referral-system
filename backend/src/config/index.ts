export const config = {
  port: parseInt(process.env.PORT || '4000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  wispchatApiUrl: process.env.WISPCHAT_API_URL || 'https://wispchat-backend.onrender.com',
  wispchatJwtSecret: process.env.WISPCHAT_JWT_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
