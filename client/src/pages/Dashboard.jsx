import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FolderOpen,
  CheckSquare,
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
  Loader,
} from "lucide-react";
import { useApp } from "../context/AppContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
  trend,
}) => (
  <div className="card hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-sm text-green-600 font-medium">{trend}</span>
      </div>
    )}
  </div>
);

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "completed task",
      item: "User Authentication",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "updated project",
      item: "Mobile App",
      time: "4 hours ago",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "moved to QA",
      item: "Payment Integration",
      time: "6 hours ago",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "created milestone",
      item: "Beta Release",
      time: "1 day ago",
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}{" "}
                <span className="font-medium">{activity.item}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [error, setError] = useState(null);
  const { stats, setStats, fetchStats, fetchEntries, redZoneEntries } =
    useApp();

  useEffect(() => {
    fetchStats();
    fetchEntries();
  }, []);

  if (error) {
    return (
      <div className="text-red-500">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-white" size={50} />
      </div>
    );
  }

  const projectProgressData = {
    labels: stats.projectProgress?.map((p) => p.name) || [
      "Web App",
      "Mobile App",
      "API Dev",
      "UI/UX",
      "Testing",
    ],
    datasets: [
      {
        label: "Progress %",
        data: stats.projectProgress?.map((p) => p.progress) || [
          85, 72, 90, 65, 45,
        ],
        backgroundColor: stats.projectProgress?.map((p) =>
          p.progress > 0 ? "rgba(59,130,246,0.8)" : "rgba(107,114,128,0.5)"
        ) || [
          "rgba(59,130,246,0.8)",
          "rgba(16,185,129,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(139,92,246,0.8)",
          "rgba(239,68,68,0.8)",
        ],
        borderColor: stats.projectProgress?.map((p) =>
          p.progress > 0 ? "rgba(59,130,246,1)" : "rgba(107,114,128,1)"
        ) || [
          "rgba(59,130,246,1)",
          "rgba(16,185,129,1)",
          "rgba(245,158,11,1)",
          "rgba(139,92,246,1)",
          "rgba(239,68,68,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const taskStatusData = {
    labels: ["Completed", "In Progress", "Pending", "QA"],
    datasets: [
      {
        data: [
          stats.tasks?.completed || 0,
          stats.tasks?.inProgress || 0,
          stats.tasks?.pending || 0,
          (stats.tasks?.total || 0) -
            ((stats.tasks?.completed || 0) +
              (stats.tasks?.inProgress || 0) +
              (stats.tasks?.pending || 0)),
        ],
        backgroundColor: [
          "rgba(16,185,129,0.8)",
          "rgba(59,130,246,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(139,92,246,0.8)",
        ],
        borderColor: [
          "rgba(16,185,129,1)",
          "rgba(59,130,246,1)",
          "rgba(245,158,11,1)",
          "rgba(139,92,246,1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FolderOpen}
          title="Active Projects"
          value={stats?.projects?.active || 0}
          subtitle={`${stats?.projects?.total || 0} total`}
          color="blue"
          trend="+12% from last month"
        />
        <StatCard
          icon={CheckSquare}
          title="Pending Tasks"
          value={stats?.tasks?.pending || 0}
          subtitle={`${stats?.tasks?.total || 0} total`}
          color="green"
          trend="-5% from last week"
        />
        <StatCard
          icon={Target}
          title="Upcoming Milestones"
          value={stats?.milestones?.upcoming || 0}
          subtitle={`${stats?.milestones?.overdue || 0} overdue`}
          color="yellow"
        />
        <StatCard
          icon={AlertTriangle}
          title="Red Zone Alerts"
          value={Array.isArray(redZoneEntries) ? redZoneEntries.length : 0}
          subtitle={`${
            Array.isArray(redZoneEntries) ? redZoneEntries.length : 0
          } Projects affected`}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Progress
          </h3>
          <Bar data={projectProgressData} options={chartOptions} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Distribution
          </h3>
          <Doughnut data={taskStatusData} options={doughnutOptions} />
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats?.recentActivities?.map((act, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-600 p-2 rounded-md transition-colors duration-300"
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{act.user}</span> {act.action}{" "}
                  <span className="font-medium">{act.item}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(act.time).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Red Zone Alerts
            </h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          {Array.isArray(redZoneEntries) && redZoneEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2 text-xl">🎉 No one is in the red zone!</p>
              <p className="text-sm">All team members are on track.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(redZoneEntries) ? redZoneEntries : []).map(
                (al) => (
                  <div
                    key={al.id} // Assumes al.id is unique
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {al.employee.firstName} {al.employee.lastName}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {al.reason}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 justify-center items-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          al.intensity === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {al.intensity}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          al.intensity === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {al.isResolved ? "Resolved" : "Pending"}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
