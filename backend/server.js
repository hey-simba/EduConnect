const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads variables from .env

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON data

// Database Connection
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
    });

// --- Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ FIXED: Added tuition routes so /api/tuitions responds correctly
// Note: If your file is named differently (e.g. ./routes/tuitionRoutes), update the path inside require()
const tuitionRoutes = require('./routes/tuition'); 
app.use('/api/tuitions', tuitionRoutes);

// Application & Wallet Routes
const applicationRoutes = require('./routes/application');
const walletRoutes = require('./routes/wallet');
app.use('/api/applications', applicationRoutes);
app.use('/api/wallet', walletRoutes);

// Serve uploads folder for CV files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// -----------------------------------------------------

// Basic Test Route
app.get('/', (req, res) => {
    res.send('EduConnect Backend is running!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});