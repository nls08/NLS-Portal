import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
};

export const AppContextProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken(); // get a Clerk JWT
        await axios.post(
          "/api/users/sync",
          {}, // no body needed
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ User synced");
      } catch (err) {
        console.error("❌ Sync failed", err);
      }
    };

    syncUser();
  }, [isSignedIn, getToken]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/dashboard/stats");
      setStats(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    const token = await getToken();
    try {
      const { data } = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data?.users);
      console.log(data);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
    }
  };
  const [loadingProjects, setLoadingProjects] = useState(true);
  const fetchProjects = async ({ showSpinner = true } = {}) => {
    const token = await getToken();
    try {
      showSpinner && setLoadingProjects(true);
      const { data } = await axios.get(`/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects.");
    } finally {
      showSpinner && setLoadingProjects(false);
    }
  };

  const fetchTasks = async () => {
    const token = await getToken();
    try {
      const { data: tasks } = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks);
    } catch (err) {
      console.error("Failed to load tasks", err);
      toast.error("Failed to load tasks");
    }
  };

  const [milestoneLoading, setMilestoneLoading] = useState(true);
  const fetchMilestones = async () => {
    const token = await getToken();
    try {
      setMilestoneLoading(true);
      const response = await axios.get(
        "/api/milestones",
        {
          params: { type: "dev" },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response, "milestone");

      setMilestones(response.data);
    } catch (err) {
      console.error("Error fetching milestones:", err);
      // setError('Failed to load milestones');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const [redZoneEntries, setRedZoneEntries] = useState([]);
  // redzone entries
  const fetchEntries = async () => {
    const token = await getToken();
    const { data } = await axios.get("/api/red-zone", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRedZoneEntries(data);
  };

  const [feedbacks, setFeedbacks] = useState([]);
  const fetchFeedbacks = async () => {
    const token = await getToken();
    try {
      const response = await axios.get("/api/feedbacks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const [clientMilestoneLoading, setClientMilestoneLoading] = useState(true);
  const [clientMilestones, setClientMilestones] = useState([]);
  const fetchClientMilestones = async () => {
    const token = await getToken();
    try {
      setClientMilestoneLoading(true);
      const response = await axios.get(
        "/api/client-milestones",
        {
          params: { type: "client" },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response, "mdsfdsilestone");

      setClientMilestones(response.data);
    } catch (err) {
      console.error("Error fetching milestones:", err);
      toast.error("Failed to load milestones");
    } finally {
      setClientMilestoneLoading(false);
    }
  };

  const [currentUser, setCurrentUser] = useState({});

  // useEffect(() => {
  //     const fetchProfile = async () => {
  //         try {
  //             const resp = await axios.get('/api/users/profile');
  //             const { profile } = resp.data;
  //             setCurrentUser(profile)
  //         } catch (err) {
  //             console.error(err);
  //             toast.error('Failed to load profile');
  //         }
  //     };
  //     fetchProfile();
  // }, [isSignedIn, getToken]);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTasks();
    fetchMilestones();
    fetchStats();
    fetchEntries();
    fetchFeedbacks();
    fetchClientMilestones();
  }, [isSignedIn, getToken]);

  const [profileRole, setProfileRole] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(data, "data");

        setProfileRole(data.profile?.role);
        setCurrentUser(data.profile);
      } catch (err) {
        console.error("Could not fetch profile", err);
      }
    })();
  }, [getToken]);
  console.log(profileRole, "profileRole");

  const value = {
    users,
    setUsers,
    fetchUsers,
    projects,
    setProjects,
    fetchProjects,
    loadingProjects,
    setLoadingProjects,
    tasks,
    setTasks,
    fetchTasks,
    milestones,
    setMilestones,
    fetchMilestones,
    milestoneLoading,
    setMilestoneLoading,
    stats,
    setStats,
    fetchStats,
    fetchEntries,
    redZoneEntries,
    setRedZoneEntries,
    profileRole,
    fetchFeedbacks,
    feedbacks,
    setFeedbacks,
    clientMilestoneLoading,
    setClientMilestoneLoading,
    clientMilestones,
    setClientMilestones,
    fetchClientMilestones,
    currentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
