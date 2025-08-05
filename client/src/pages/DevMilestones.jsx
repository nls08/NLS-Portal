import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Code,
  X,
  ChevronDown,
  Eye,
  File,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import Modal from "../components/ui/Modal";
import { useAuth } from "@clerk/clerk-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const UserAvatar = ({ user, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex -space-x-2 items-center justify-center`}
    >
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${!user.imageUrl ? "flex" : "hidden"
          } items-center justify-center w-full h-full text-xs font-medium text-gray-600 dark:text-gray-300`}
      >
        {user.firstName?.[0]}
        {user.lastName?.[0]}
      </div>
    </div>
  );
};


const MultiSelectDropdown = ({
  options,
  selected,
  onChange,
  placeholder,
}) => {
  const { users } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const selectedUsers = users.filter((user) => selected.includes(user._id));

  const handleSelect = (userId) => {
    if (selected.includes(userId)) {
      onChange(selected.filter((id) => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  const removeUser = (userId) => {
    onChange(selected.filter((id) => id !== userId));
  };


  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer flex items-center justify-between min-h-[42px]"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedUsers.length > 0 ? (
            selectedUsers.map((user) => (
              <span
                key={user._id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-gray-800 dark:text-blue-300 gap-1"
              >
                <UserAvatar user={user} size="sm" />
                {/* {user.firstName} {user.lastName} */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user._id);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelect(user._id)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selected.includes(user._id)
                ? "bg-blue-50 dark:bg-gray-700"
                : ""
                }`}
            >
              <div className="flex items-center">
                {/* <input
                    type="checkbox"
                    checked={selected.includes(user._id)}
                    onChange={() => { }}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  /> */}
                <UserAvatar user={user} size="md" />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const MilestoneForm = ({ milestone, onSubmit, onClose, selectedFiles, setSelectedFiles, attachments, setAttachments }) => {
  const {
    users,
    fetchUsers,
    projects,
    fetchProjects,
    milestones,
    setMilestones,
    fetchMilestones,
    milestoneLoading,
    setMilestoneLoading,
  } = useApp();

  const [formData, setFormData] = useState({
    name: milestone?.name || "",
    description: milestone?.description || "",
    status: milestone?.status || "Planning",
    project: milestone?.project?._id || "",
    assignee: milestone?.assignee?.map(u => u._id) || [],
    // dueDate: milestone?.dueDate?.slice(0, 10) || "",
    dueDate: milestone?.dueDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    progress: milestone?.progress || 0,
    priority: milestone?.priority || "Medium",
    techStack: milestone?.techStack || "",
    type: "dev",
  });


  const [uploading, setUploading] = useState(false);



  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleFilesChange = e => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setSelectedFiles(prev => {
      const merged = [...prev];
      incoming.forEach(f => {
        if (!merged.some(g => g.name === f.name && g.size === f.size)) merged.push(f);
      });
      return merged;
    });
    e.target.value = null;
  };

  const handleFilesUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        selectedFiles.map(file => {
          const form = new FormData();
          form.append('file', file);
          form.append('upload_preset', 'ml_default');
          return axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
            form
          ).then(r => ({ url: r.data.secure_url, public_id: r.data.public_id }));
        })
      );
      setAttachments(prev => [...prev, ...results]);
      setSelectedFiles([]);
      toast.success('Files uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = idx => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveSelected = idx => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.project ||
      !formData.dueDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    // onSubmit(formData);
    onSubmit({ ...formData, attachments });
    onClose();
  };

  useEffect(() => {
    if (milestone?.attachments) {
      // if your backend returns [{ url, public_id }, …]
      setAttachments(milestone.attachments);
    }
  }, [milestone]);


  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Milestone Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          modules={modules}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="description..."
          className="input-field border-none p-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Testing">Testing</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project
        </label>
        <select
          value={formData.project}
          onChange={(e) =>
            setFormData({ ...formData, project: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assignees
        </label>
        <MultiSelectDropdown
          options={users}
          selected={formData.assignee}
          onChange={(selected) =>
            setFormData({ ...formData, assignee: selected })
          }
          placeholder="Select assignees..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) =>
              setFormData({
                ...formData,
                progress: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tech Stack
        </label>
        <input
          type="text"
          value={formData.techStack}
          onChange={(e) =>
            setFormData({ ...formData, techStack: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., React, Node.js, MongoDB"
        />
      </div>

      <div>
        <label className="block mb-1 dark:text-white">Select Files</label>
        <input type="file"
          multiple
          onChange={handleFilesChange}
          className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-100 dark:file:text-black dark:focus:border-primary"
        />
        <button type="button" onClick={handleFilesUpload}
          disabled={!selectedFiles.length || uploading}
          className="btn-secondary mt-2">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {selectedFiles?.length > 0 && (
          <ul className="list-disc list-inside mt-2 text-sm">
            {selectedFiles.map((f, i) => (
              <li key={i} className="flex justify-between">
                <span className="dark:text-white my-1">{i + 1} ) {f.name} ({f.size / 1024 / 1024 > 1 ? `(${(f.size / 1024 / 1024).toFixed(2)} MB)` : `(${(f.size / 1024).toFixed(2)} KB)`})</span>
                <button type="button" onClick={() => handleRemoveSelected(i)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {attachments?.length > 0 && (
          <ul className="list-disc list-inside mt-2 text-sm">
            {attachments.map((att, i) => (
              <li key={i} className="flex justify-between">
                <a href={att.url} target="_blank" rel="noreferrer" className="dark:text-white my-1">{att.public_id}</a>
                <button type="button" onClick={() => handleRemoveAttachment(i)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {milestone ? "Update" : "Create"} Milestone
        </button>
      </div>
    </div >
  );
};

const DevMilestones = () => {
  const { getToken } = useAuth();
  // const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [showDescription, setShowDescription] = useState(false)

  const {
    users,
    fetchUsers,
    projects,
    fetchProjects,
    milestones,
    setMilestones,
    fetchMilestones,
    milestoneLoading,
    setMilestoneLoading,
    profileRole
  } = useApp();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log("component mounted");
  }, [])

  useEffect(() => {
    fetchMilestones();
    fetchProjects();
  }, []);

  console.log(projects, "mile projects");

  const statusColors = {
    Planning: "#8b5cf6",
    "In Progress": "#3b82f6",
    Review: "#f59e0b",
    Testing: "#06b6d4",
    Completed: "#10b981",
    "On Hold": "#6b7280",
    Blocked: "#ef4444",
  };

  const priorityColors = {
    Low: "#10b981",
    Medium: "#f59e0b",
    High: "#ef4444",
    Critical: "#dc2626",
  };

  const StatusBadge = ({ status, color, size = "md" }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${size === "sm" ? "px-2 py-0.5" : "px-2.5 py-0.5"
        }`}
      style={{ backgroundColor: color + "20", color: color }}
    >
      {status}
    </span>
  );

  const ProgressCircle = ({ percentage, size = 60 }) => {
    const radius = size / 2 - 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
          {percentage}%
        </span>
      </div>
    );
  };



  const handleCreateMilestone = async (milestoneData) => {
    const token = await getToken();
    try {
      const response = await axios.post("/api/milestones", milestoneData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMilestones();
      setMilestones([response.data, ...milestones]);
      toast.success("Dev milestone created successfully!");
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error(
        "Error creating milestone: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  const handleUpdateMilestone = async (milestoneData) => {
    const token = await getToken();
    try {
      const response = await axios.put(
        `/api/milestones/${selectedMilestone._id}`,
        milestoneData, {
        headers: { Authorization: `Bearer ${token}` }
      }
      );
      await fetchMilestones();
      setMilestones(
        milestones?.map((m) =>
          m._id === selectedMilestone._id ? response.data : m
        )
      );
      toast.success("Dev milestone updated successfully!");
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error(
        "Error updating milestone: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    const token = await getToken();
    // if (window.confirm("Are you sure you want to delete this milestone?")) {
    try {
      await axios.delete(`/api/milestones/${milestoneId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMilestones();
      setMilestones(milestones.filter((m) => m._id !== milestoneId));
      toast.success("Dev milestone deleted successfully!");
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error(
        "Error deleting milestone: " +
        (error.response?.data?.error || error.message)
      );
    }
    // }
  };

  const getAssigneeDisplay = (assignees) => {
    if (!assignees || assignees.length === 0) return "No assignees";
    console.log(assignees, "assignees");

    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {assignees.slice(0, 3).map((user) => (
            <UserAvatar key={user._id} user={user} size="sm" />
          ))}
          {assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
              +{assignees.length - 3}
            </div>
          )}
        </div>
        <span className="text-sm">
          {assignees.length === 1
            ? `${assignees[0].firstName} ${assignees[0].lastName}`
            : `${assignees.length} assignees`}
        </span>
      </div>
    );
  };

  if (milestoneLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Loading milestones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error Loading Data</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchMilestones();
              fetchUsers();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <div className="flex items-center justify-between my-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dev Milestones
          </h1>
          {(profileRole === "super-admin" || profileRole === "admin") &&
            <button
              onClick={() => {
                setSelectedMilestone(null);
                setSelectedFiles([]);
                setAttachments([]);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Milestone</span>
            </button>
          }
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone) => (
            <div
              key={milestone._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {milestone.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDescription(true);
                      setSelectedMilestone(milestone)
                    }
                    }
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
                <ProgressCircle percentage={milestone.progress} size={60} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <StatusBadge
                  status={milestone.status}
                  color={statusColors[milestone.status]}
                />
                <StatusBadge
                  status={milestone.priority}
                  color={priorityColors[milestone.priority]}
                  size="sm"
                />
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="font-medium w-16">Project:</span>
                  <span>{milestone.project?.name || "No project"}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <div className="flex-1">
                    {getAssigneeDisplay(milestone.assignee)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {milestone.techStack && (
                  <div className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    <span className="text-xs">{milestone.techStack}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {milestone.attachments.length === 0 && <span>No attachments</span>}
                  {milestone.attachments.length > 0 && milestone.attachments.map((attachment) => (
                    <a
                      key={attachment._id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <File className="w-4 h-4" />
                      <span>{attachment.public_id}, </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {(profileRole === "super-admin" || profileRole === "admin") &&
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedMilestone(milestone);
                      setSelectedFiles([]);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* <button
                  onClick={() => handleDeleteMilestone(milestone._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button> */}
                  <AlertDialog className="dark:bg-gray-800">
                    <AlertDialogTrigger className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your Milestone
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMilestone(milestone._id)}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              }

            </div>
          ))}
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No milestones found. Create your first milestone to get started!
            </div>
          </div>
        )}

        {/* Create/Edit Milestone Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMilestone(null);
          }}
          title={
            selectedMilestone
              ? "Edit Dev Milestone"
              : "Create New Dev Milestone"
          }
          size="lg"
        >
          <MilestoneForm
            milestone={selectedMilestone}
            onSubmit={
              selectedMilestone ? handleUpdateMilestone : handleCreateMilestone
            }
            onClose={() => {
              setIsModalOpen(false);
              setSelectedMilestone(null);
            }}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            attachments={attachments}
            setAttachments={setAttachments}
          />
        </Modal>

        {/* Description Modal */}
        <Modal
          isOpen={showDescription}
          onClose={() => setShowDescription(false)}
          title={`Details - ${selectedMilestone?.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none mb-4 dark:text-gray-300 border rounded-md p-4"
              dangerouslySetInnerHTML={{ __html: selectedMilestone?.description }}
            />

            <div
              key={selectedMilestone?._id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedMilestone?.name}
                  </h3>

                  <StatusBadge
                    status={selectedMilestone?.priority}
                    color={priorityColors[selectedMilestone?.priority]}
                    size="sm"
                  />
                  {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {milestone.description}
                              </p> */}
                </div>
                <ProgressCircle percentage={selectedMilestone?.progress} size={60} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <StatusBadge
                  status={selectedMilestone?.status}
                  color={statusColors[selectedMilestone?.status]}
                />
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="font-medium w-16">Project:</span>
                  <span>{selectedMilestone?.project?.name || "No project"}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <div className="flex-1">
                    {getAssigneeDisplay(selectedMilestone?.assignee)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(selectedMilestone?.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedMilestone?.techStack && (
                  <div className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    <span className="text-xs">{selectedMilestone?.techStack}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedMilestone?.attachments?.length === 0 && <span>No attachments</span>}
                  {selectedMilestone?.attachments?.length > 0 && selectedMilestone?.attachments?.map((attachment) => (
                    <a
                      key={attachment?._id}
                      href={attachment?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <File className="w-4 h-4" />
                      <span>{attachment?.public_id}, </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DevMilestones;
