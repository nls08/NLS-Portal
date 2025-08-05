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
import adminRoutes from "./routes/admin.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Update with deployed domain or use env variable
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

// WebSocket handling (note: WebSockets are tricky on Vercel; consider alternatives like Server-Sent Events)
const clients = new Map();

// This is a placeholder; Vercel doesn't support WebSocket servers natively
// You might need to use a different approach (e.g., polling or external WebSocket service)
const wss = {}; // Disabled for now

// Broadcast function (placeholder)
export const broadcast = (message) => {
  clients.forEach((client, ws) => {
    if (ws?.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  });
};

// Serve HTML with Tailwind CSS for root route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NLS-Portal Server</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 class="text-3xl font-bold text-green-600 mb-4">NLS-Portal Server</h1>
        <p class="text-gray-700 mb-4">The server is up and running successfully!</p>
        <p class="text-gray-500">WebSocket and API services are active. Check the API endpoints for more details.</p>
        <a href="/api/health" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Check Health</a>
      </div>
    </body>
    </html>
  `);
});

// Serve HTML with Tailwind CSS for health check
app.get("/api/health", (req, res) => {
  const timestamp = new Date().toISOString();
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Health Check</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-bold text-green-600 mb-2">Health Check</h1>
        <p class="text-gray-700 mb-4">Status: <span class="font-semibold">OK</span></p>
        <p class="text-gray-500">Timestamp: ${timestamp}</p>
        <a href="/" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

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
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/personal-tasks", personalTasksRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/finance", expenseRoutes);
app.use("/api/earnings", earningRoutes);
app.use("/api/advance", advanceRoutes);
app.use("/api/cloudinary", uploadRoutes);
app.use("/api/client-milestones", clientMilestoneRoutes);
app.use("/api/admin", adminRoutes);

// Export for Vercel
export default app;
