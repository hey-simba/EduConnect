const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads variables from .env

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// FR-4 / NFR-3: Wrap Express with http.createServer so Socket.io can share the port
const httpServer = http.createServer(app);

// Initialize Socket.io with CORS so the Vite dev server can connect
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Map userId (string) -> socketId so we can send targeted events
// e.g. { "650000000000000000000001": "abc123" }
const userSocketMap = {};

io.on('connection', (socket) => {
    // Client should emit 'register' with their userId immediately after connecting
    socket.on('register', (userId) => {
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`🔌 Socket registered: userId=${userId} socketId=${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        // Clean up the mapping on disconnect
        for (const [uid, sid] of Object.entries(userSocketMap)) {
            if (sid === socket.id) {
                delete userSocketMap[uid];
                console.log(`🔌 Socket disconnected: userId=${uid}`);
                break;
            }
        }
    });
});

// Expose io + userSocketMap so controllers can emit targeted events
app.set('io', io);
app.set('userSocketMap', userSocketMap);

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
const notificationRoutes = require('./routes/notifications');
app.use('/api/applications', applicationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);

// Course Routes (Phase 3 — FR-5)
const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

// Serve uploads folder for CV files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// -----------------------------------------------------

// Basic Test Route
app.get('/', (req, res) => {
    res.send('EduConnect Backend is running!');
});

// Start the Server using httpServer (not app.listen) so Socket.io works
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});