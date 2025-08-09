import React, { useState, useEffect } from 'react';
import { AlertTriangle, XCircle, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';

const TaskDetailsModal = ({ task, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    onStatusUpdate(task._id, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {task.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {task.description}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p><strong>Project:</strong> {task.project?.name}</p>
            <p><strong>Milestone:</strong> {task.milestone?.name}</p>
            <p className="flex gap-1 items-center">
              <strong>Assignee:</strong>
              <img
                src={task.assignee?.imageUrl}
                className="w-6 h-6 rounded-full"
                alt=""
              />
              {task.assignee
                ? `${task.assignee.firstName} ${task.assignee.lastName}`
                : '—'}
            </p>
          </div>
          <div>
            <p><strong>Submitted:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(task.updatedAt).toLocaleDateString()}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
          </div>
        </div>
      </div>

      {task.qaRemarks && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            QA Feedback
          </h4>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
              {task.qaRemarks}
            </p>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Original Issues</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          {task.originalIssues || task.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Update Status
          </label>
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select Status</option>
            <option value="Back to QA">Back to QA</option>
            <option value="Completed">Mark as Fixed</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button type="submit" className="btn-primary">
            Update Status
          </button>
        </div>
      </form>
    </div>
  );
};

const QARevision = () => {
  const { profileRole, currentUser } = useApp();
  const { getToken } = useAuth();

  const [revisionTasks, setRevisionTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load tasks
  useEffect(() => {
    (async () => {
      const token = await getToken();
      try {
        setLoading(true);
        const { data } = await axios.get('/api/qa/revision', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRevisionTasks(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch revision tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  // Only show a user's own tasks if they're a normal user
  const tasksToShow = profileRole === 'user'
    ? revisionTasks.filter(t => t.assignee._id === currentUser._id)
    : revisionTasks;

  const statusColors = {
    Rejected: '#ef4444',
    'Fixing Required': '#f97316',
    'Back to QA': '#f59e0b',
    Fixed: '#10b981'
  };
  const priorityColors = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#dc2626'
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Fixing Required':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Back to QA': return <ArrowRight className="w-5 h-5 text-yellow-500" />;
      case 'Fixed': return <Clock className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    const token = await getToken();
    try {
      const { data } = await axios.put(
        `/api/qa/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRevisionTasks(prev =>
        prev.map(t => (t._id === taskId ? data : t))
      );
      toast.success('Status updated!');
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <div className="ml-4 text-lg">Loading QA Revisions…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QA Revision</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {tasksToShow.length} task{tasksToShow.length !== 1 && 's'} need attention
        </div>
      </div>

      {tasksToShow.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Tasks in Revision</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profileRole === 'user'
              ? 'You have no tasks requiring revision.'
              : 'No tasks require revision at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasksToShow.map(task => (
            <div
              key={task._id}
              className="card hover:shadow-lg transition-shadow duration-200 border-l-4 border-red-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-white mb-3">
                    {task.description}
                  </p>
                </div>
                {getStatusIcon(task.status)}
              </div>

              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={task.status} color={statusColors[task.status]} />
                <StatusBadge status={task.priority} color={priorityColors[task.priority]} size="sm" />
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span className="font-medium">Project:</span>
                  <span>{task.project?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Assignee:</span>
                  <span>
                    {task.assignee
                      ? `${task.assignee.firstName} ${task.assignee.lastName}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Updated:</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {task.qaRemarks && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Issues Found
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{task.qaRemarks}</p>
                </div>
              )}

              {(profileRole === 'super-admin' || profileRole === 'admin') && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {(profileRole === 'super-admin' || profileRole === 'admin') && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          title="Task Revision Details"
          size="lg"
        >
          {selectedTask && (
            <TaskDetailsModal
              task={selectedTask}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedTask(null);
              }}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default QARevision;
