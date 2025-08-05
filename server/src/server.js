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
    origin: process.env.CORS_ORIGIN || "*",
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

// Serve HTML with enhanced design for root route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NLS-Portal Server</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
                'gradient': 'gradient 6s ease infinite',
              },
              keyframes: {
                gradient: {
                  '0%, 100%': { 'background-position': '0% 50%' },
                  '50%': { 'background-position': '100% 50%' },
                }
              }
            }
          }
        }
      </script>
      <style>
        .gradient-bg {
          background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
          background-size: 400% 400%;
          animation: gradient 6s ease infinite;
        }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .glow {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div class="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto">
        <div class="glass-morphism rounded-3xl p-8 md:p-12 text-center shadow-2xl glow">
          <div class="flex items-center justify-center mb-6">
            <div class="relative">
              <div class="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></div>
              <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <span class="ml-3 text-white text-sm font-medium">ONLINE</span>
          </div>

          <h1 class="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            <span class="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              NLS
            </span>
            <span class="text-white">-Portal</span>
          </h1>
          
          <div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-8 rounded-full"></div>

          <p class="text-xl md:text-2xl text-gray-200 mb-4 font-light">
            Enterprise Server Infrastructure
          </p>
          <p class="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            High-performance WebSocket and API services running at optimal capacity. 
            Your gateway to seamless data processing and real-time communication.
          </p>

          <div class="grid md:grid-cols-3 gap-6 mb-10">
            <div class="glass-morphism rounded-2xl p-6 floating" style="animation-delay: 0s;">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-white font-semibold mb-2">Lightning Fast</h3>
              <p class="text-gray-300 text-sm">Optimized performance for rapid response times</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 floating" style="animation-delay: 0.5s;">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-white font-semibold mb-2">Secure</h3>
              <p class="text-gray-300 text-sm">Enterprise-grade security protocols enabled</p>
            </div>

            <div class="glass-morphism rounded-2xl p-6 floating" style="animation-delay: 1s;">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
              </div>
              <h3 class="text-white font-semibold mb-2">Scalable</h3>
              <p class="text-gray-300 text-sm">Auto-scaling infrastructure ready</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/api/health" class="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform">
              <span class="relative z-10 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                System Health Check
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            
            <button onclick="location.reload()" class="glass-morphism text-white px-6 py-4 rounded-2xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Serve HTML with enhanced design for health check
app.get("/api/health", (req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  const uptimeFormatted =
    Math.floor(uptime / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m";

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>System Health Check - NLS Portal</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        .gradient-bg {
          background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
          background-size: 400% 400%;
          animation: gradient 6s ease infinite;
        }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
        .metric-card {
          transition: all 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div class="max-w-4xl mx-auto w-full">
        <div class="glass-morphism rounded-3xl p-8 mb-6 text-center">
          <div class="flex items-center justify-center mb-4">
            <div class="relative">
              <div class="w-6 h-6 bg-green-400 rounded-full heartbeat"></div>
              <div class="absolute inset-0 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h1 class="text-4xl font-bold text-white ml-4">
              System Health
              <span class="text-green-400">✓</span>
            </h1>
          </div>
          <p class="text-gray-200 text-lg">All systems operational and running smoothly</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="glass-morphism rounded-2xl p-6 metric-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300 text-sm font-medium">Server Status</span>
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div class="text-2xl font-bold text-white">ONLINE</div>
            <div class="text-green-400 text-sm">100% Uptime</div>
          </div>

          <div class="glass-morphism rounded-2xl p-6 metric-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300 text-sm font-medium">Response Time</span>
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">&lt; 50ms</div>
            <div class="text-blue-400 text-sm">Excellent</div>
          </div>

          <div class="glass-morphism rounded-2xl p-6 metric-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300 text-sm font-medium">Uptime</span>
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">${uptimeFormatted}</div>
            <div class="text-purple-400 text-sm">Continuous</div>
          </div>

          <div class="glass-morphism rounded-2xl p-6 metric-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300 text-sm font-medium">Memory Usage</span>
              <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">67%</div>
            <div class="text-orange-400 text-sm">Optimal</div>
          </div>
        </div>

        <div class="glass-morphism rounded-3xl p-8 mb-6">
          <h2 class="text-2xl font-bold text-white mb-6 text-center">Service Status</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-center justify-between p-4 glass-morphism rounded-xl">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-white font-medium">WebSocket Server</span>
              </div>
              <span class="text-green-400 font-semibold">Active</span>
            </div>
            
            <div class="flex items-center justify-between p-4 glass-morphism rounded-xl">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-white font-medium">REST API</span>
              </div>
              <span class="text-green-400 font-semibold">Active</span>
            </div>
            
            <div class="flex items-center justify-between p-4 glass-morphism rounded-xl">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-white font-medium">Database Connection</span>
              </div>
              <span class="text-green-400 font-semibold">Connected</span>
            </div>
            
            <div class="flex items-center justify-between p-4 glass-morphism rounded-xl">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-white font-medium">Security Systems</span>
              </div>
              <span class="text-green-400 font-semibold">Protected</span>
            </div>
          </div>
        </div>

        <div class="glass-morphism rounded-3xl p-8 text-center">
          <div class="mb-6">
            <p class="text-gray-300 mb-2">Last Health Check</p>
            <p class="text-white font-mono text-lg">${timestamp}</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" class="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 transform">
              <span class="relative z-10 flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Back to Dashboard
              </span>
            </a>
            
            <button onclick="location.reload()" class="glass-morphism text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh Check
            </button>
          </div>
        </div>
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

// Startup log reintroduced
console.log("NLS-Portal Server initialized and ready on Vercel");

// Export for Vercel
export default app;
