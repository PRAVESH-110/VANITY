const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

/* ===============================
   IMPORT ROUTES
================================= */
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const flowRoutes = require("./routes/flowRoutes");
const progressRoutes = require("./routes/progressRoutes");
const userRoutes = require("./routes/userRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

/* ===============================
   CREATE APP + SERVER
================================= */
const app = express();
const server = http.createServer(app);

/* ===============================
   SOCKET.IO SETUP
================================= */
const io = new Server(server, {
   cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "DELETE"],
   },
});

io.on("connection", (socket) => {
   console.log("🔌 Client connected:", socket.id);
});

app.set("io", io);

/* ===============================
   MIDDLEWARE (CORRECT ORDER)
================================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   BASIC TEST ROUTE (IMPORTANT)
================================= */
app.get("/", (req, res) => {
   res.send("Server is running ✅");
});

/* ===============================
   ROUTES
================================= */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/flow", flowRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/user", userRoutes);
app.use("/api/api-keys", apiKeyRoutes);

/* ===============================
   ERROR HANDLER (MUST BE LAST)
================================= */
app.use(errorMiddleware);

/* ===============================
   DATABASE CONNECTION
================================= */
mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log("✅ MongoDB Connected"))
   .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
   });

/* ===============================
   START SERVER (IMPORTANT)
================================= */
const PORT = 5000; // force fixed port

server.listen(5000, "0.0.0.0", () => {
   console.log("🚀 Server running on port 5000");
});
