import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";
import "dotenv/config.js";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";

// Import routes
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import milestoneRoutes from "./routes/milestones.js";
import qaRoutes from "./routes/qa.js";
import deliveryRoutes from "./routes/deliveries.js";
import userRoutes from "./routes/users.js";
import dashboardRoutes from "./routes/dashboard.js";
import attendanceRoutes from "./routes/attendance.js";
import redZoneRoutes from "./routes/redZone.js";
import kpiRoutes from "./routes/kpi.js";
import performanceRoutes from "./routes/performance.js";
import feedbackRoutes from "./routes/feedback.js";
import personalTasksRoutes from "./routes/personalTasks.js";
import reminderRoutes from "./routes/reminder.js";
import donationRoutes from "./routes/donation.js";
import expenseRoutes from "./routes/expense.js";
import earningRoutes from "./routes/earning.js";
import advanceRoutes from "./routes/advance.js";
import uploadRoutes from "./routes/uploads.js";
import clientMilestoneRoutes from "./routes/clientMilestone.js";
import adminRoutes from './routes/admin.js';

// dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// WebSocket connection handling
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "auth") {
        clients.set(ws, {
          userId: data.userId,
          userName: data.userName,
        });
        console.log(`User ${data.userName} connected`);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket connection closed");
  });
});

// Broadcast function for real-time notifications
export const broadcast = (message) => {
  clients.forEach((client, ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
};

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/red-zone", redZoneRoutes);
app.use("/api/kpi", kpiRoutes);
app.use("/api/performance", performanceRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/personal-tasks', personalTasksRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/finance', expenseRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/advance', advanceRoutes);
app.use('/api/cloudinary', uploadRoutes);
app.use('/api/client-milestones', clientMilestoneRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
