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

// --- NEW: Import and Connect Authentication Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// -----------------------------------------------------

// Basic Test Route
app.get('/', (req, res) => {
    res.send('EduConnect Backend is running!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});