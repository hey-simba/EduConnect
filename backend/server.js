const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("? MongoDB connected successfully");
        require("./utils/seedAdmin")(); 
    })
    .catch((err) => console.error("? Database connection error:", err));

// Initialize Real-time Chat (Socket.io)
const { initializeSocket } = require("./utils/socketHandler");
initializeSocket(httpServer, app);

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tuitions", require("./routes/tuition"));
app.use("/api/applications", require("./routes/application"));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/instructors", require("./routes/instructors"));
app.use("/api/live-classes", require("./routes/liveClasses"));

app.get("/", (req, res) => res.send("EduConnect Backend is running!"));

httpServer.listen(PORT, () => {
    console.log(`?? Server running on port ${PORT}`);
});
