const { Server } = require("socket.io");

const initializeSocket = (httpServer, app) => {
    const io = new Server(httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    const userSocketMap = {};

    const emitToUser = (userId, event, payload) => {
        const sockets = userSocketMap[String(userId)];
        if (!sockets) return;
        sockets.forEach((sid) => io.to(sid).emit(event, payload));
    };

    io.on("connection", (socket) => {
        socket.on("register", (userId) => {
            if (!userId) return;
            const uid = userId.toString();
            if (!userSocketMap[uid]) userSocketMap[uid] = new Set();
            userSocketMap[uid].add(socket.id);
            socket.data.userId = uid;
            console.log(`?? Socket registered: userId=${uid} socketId=${socket.id}`);
        });

        socket.on("sendMessage", async (data) => {
            try {
                const { senderId, receiverId, content, type, relatedPostId } = data;
                if (!senderId || !receiverId || !content) return;

                const Message = require("../models/Message");
                const message = new Message({ senderId, receiverId, content, type: type || "text", relatedPostId: relatedPostId || null });
                await message.save();

                const populated = await Message.findById(message._id).populate("senderId", "name email").populate("receiverId", "name email");
                emitToUser(receiverId, "newMessage", populated);
                emitToUser(senderId, "messageSent", populated);
            } catch (error) {
                console.error("Socket sendMessage error:", error);
            }
        });

        socket.on("markRead", async (data) => {
            try {
                const { readerId, senderId } = data;
                if (!readerId || !senderId) return;

                const Message = require("../models/Message");
                await Message.updateMany({ senderId, receiverId: readerId, read: false }, { read: true });
                emitToUser(senderId, "messagesRead", { readerId, senderId });
            } catch (error) {
                console.error("Socket markRead error:", error);
            }
        });

        socket.on("disconnect", () => {
            const uid = socket.data.userId;
            if (uid && userSocketMap[uid]) {
                userSocketMap[uid].delete(socket.id);
                if (userSocketMap[uid].size === 0) delete userSocketMap[uid];
            }
        });
    });

    app.set("io", io);
    app.set("userSocketMap", userSocketMap);
    app.set("emitToUser", emitToUser);
};

module.exports = { initializeSocket };
