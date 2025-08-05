import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      const websocket = new WebSocket("ws://localhost:5000");

      websocket.onopen = () => {
        setIsConnected(true);
        websocket.send(
          JSON.stringify({
            type: "auth",
            userId: user.id,
            userName: user.fullName || user.firstName,
          })
        );
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "notification":
            toast.success(data.message);
            // Show browser notification
            if (Notification.permission === "granted") {
              new Notification("NLS Portal", {
                body: data.message,
                icon: "/favicon.svg",
              });
            }
            break;
          case "task_assigned":
            toast.info(`New task assigned: ${data.taskName}`);
            break;
          case "status_update":
            toast.info(`Status updated: ${data.message}`);
            break;
          default:
            break;
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      setWs(websocket);
    };

    connectWebSocket();

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  const sendMessage = (message) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
