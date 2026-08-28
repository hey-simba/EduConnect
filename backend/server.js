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

// Map userId (string) -> Set of socketIds (supports Header + Messages / multiple tabs)
const userSocketMap = {};

const emitToUser = (userId, event, payload) => {
    const sockets = userSocketMap[String(userId)];
    if (!sockets) return;
    sockets.forEach((sid) => io.to(sid).emit(event, payload));
};

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        if (!userId) return;
        const uid = userId.toString();
        if (!userSocketMap[uid]) userSocketMap[uid] = new Set();
        userSocketMap[uid].add(socket.id);
        socket.data.userId = uid;
        console.log(`🔌 Socket registered: userId=${uid} socketId=${socket.id}`);
    });

    socket.on('sendMessage', async (data) => {
        try {
            const { senderId, receiverId, content, type, relatedPostId } = data;
            if (!senderId || !receiverId || !content) return;

            const Message = require('./models/Message');
            const message = new Message({
                senderId,
                receiverId,
                content,
                type: type || 'text',
                relatedPostId: relatedPostId || null
            });
            await message.save();

            const populated = await Message.findById(message._id)
                .populate('senderId', 'name email')
                .populate('receiverId', 'name email');

            emitToUser(receiverId, 'newMessage', populated);
            emitToUser(senderId, 'messageSent', populated);
        } catch (error) {
            console.error('Socket sendMessage error:', error);
        }
    });

    socket.on('markRead', async (data) => {
        try {
            const { readerId, senderId } = data;
            if (!readerId || !senderId) return;

            const Message = require('./models/Message');
            await Message.updateMany(
                { senderId, receiverId: readerId, read: false },
                { read: true }
            );

            emitToUser(senderId, 'messagesRead', { readerId, senderId });
        } catch (error) {
            console.error('Socket markRead error:', error);
        }
    });

    socket.on('disconnect', () => {
        const uid = socket.data.userId;
        if (uid && userSocketMap[uid]) {
            userSocketMap[uid].delete(socket.id);
            if (userSocketMap[uid].size === 0) delete userSocketMap[uid];
            console.log(`🔌 Socket disconnected: userId=${uid}`);
        }
    });
});

app.set('io', io);
app.set('userSocketMap', userSocketMap);
app.set('emitToUser', emitToUser);

// Middleware
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON data

// Database Connection
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
        
        // Auto-create default admin if none exists
        const seedAdmin = require('./utils/seedAdmin');
        seedAdmin();
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
    });

// --- Routes ---
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

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

// Assignment Routes (Evaluation Module)
const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

// Message Routes (Real-Time In-App Messaging — FR-9)
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// Instructor Routes (Featured Instructor Algorithm — FR-10)
const instructorRoutes = require('./routes/instructors');
app.use('/api/instructors', instructorRoutes);

// Live Class Routes (Agora integration placeholder)
const liveClassRoutes = require('./routes/liveClasses');
app.use('/api/live-classes', liveClassRoutes);

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