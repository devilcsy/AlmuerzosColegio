// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import purchaseRoutes from './routes/purchases.js';
import adminRoutes from './routes/admin.js';
import lunchRoutes from './routes/lunches.js'; 
import parentRoutes from './routes/parents.js';

dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();

// CORS simplificado - permite todo en desarrollo
app.use(cors({
  origin: true, 
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lunches', lunchRoutes); 
app.use('/api/parents', parentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;  

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 External URL: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}`);
  console.log(`📡 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});