import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Menu, Bell, Settings, Clock } from "lucide-react";
import { useWebSocket } from "../../context/WebSocketContext";
import { useApp } from "../../context/AppContext";

const Header = ({ onMenuClick }) => {
  const { user } = useUser();
  const { stats, setStats, fetchStats } = useApp();
  const { isConnected } = useWebSocket();

  const [toggle, setToggle] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {/* {isConnected ? "Connected" : "Disconnected"} */}
              {isConnected ? (
                <span className="text-green-500"></span>
              ) : (
                <span className="text-red-500"> (WebSocket)</span>
              )}
            </span>
          </div>

          {/* Notifications */}
          <button onClick={() => setToggle(prev => !prev)} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>
          {toggle && (
            <div className="absolute top-16 right-6 bg-gray-800 dark:bg-gray-700 p-4 rounded-md space-y-4">
              {stats.recentActivities.map((act, i) => (
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
          )}

          {/* Settings */}
          <Link
            to="/profile"
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* User Menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
