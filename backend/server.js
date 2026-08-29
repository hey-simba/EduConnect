require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);

// basic middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to database
mongoose.connect(process.env.MONGO_URI).then(function() {
    console.log("Database connected successfully!");
}).catch(function(err) {
    console.log("Database connection error: ", err);
});

// setup chat system
const chatSystem = require("./utils/socketHandler");
chatSystem.initializeSocket(server, app);

// import all my routes here
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const tuitionRoutes = require("./routes/tuition");
const applicationRoutes = require("./routes/application");
const walletRoutes = require("./routes/wallet");
const notificationRoutes = require("./routes/notifications");
const courseRoutes = require("./routes/courses");
const assignmentRoutes = require("./routes/assignments");
const messageRoutes = require("./routes/messages");
const instructorRoutes = require("./routes/instructors");
const liveClassRoutes = require("./routes/liveClasses");
const userRoutes = require("./routes/users");

// use the routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tuitions", tuitionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/live-classes", liveClassRoutes);
app.use("/api/users", userRoutes);

// testing if server works
app.get("/", function(req, res) {
    res.send("Backend is running fine");
});

// start the server
const port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log("Server started on port " + port);
});
