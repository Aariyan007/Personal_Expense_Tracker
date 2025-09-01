const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const db = require('./Db/db');
const cors = require('cors');
const connectToDatabase = require('./Db/mdb');
const cookie = require('cookie-parser');
const userRoutes = require('./routes/user.routes');

// Connect to database
connectToDatabase();

// Middleware setup
app.use(cookie());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for large text processing
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  console.log("Server is running");
  res.send("Hello World");
});

// API routes - FIXED: Changed from '/user' to '/api/users' to match your React component
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;