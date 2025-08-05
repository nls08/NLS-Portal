import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';

const QAReviewModal = ({ task, onClose, onSubmit }) => {
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status) {
      toast.error('Please select a status');
      return;
    }
    if ((status === 'Rejected' || status === 'Fixing Required') && !remarks.trim()) {
      toast.error('Please provide remarks for rejection/fixing required');
      return;
    }
    onSubmit(task._id, status, remarks);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Project:</strong> {task.project?.name}</p>
          <p className='flex gap-1 items-center'>
            <strong>Assignee:</strong>{' '}
            <img src={task.assignee?.imageUrl} className='w-6 h-6 rounded-full' />
            {task.assignee
              ? `${task.assignee.firstName} ${task.assignee.lastName}`
              : '—'
            }
          </p>
          <p><strong>Submitted:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Cases
        </label>
        <div className="space-y-2">
          {task.testCases && task.testCases.map((testCase, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{testCase}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          QA Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Fixing Required">Fixing Required</option>
        </select>
      </div>

      {(status === 'Rejected' || status === 'Fixing Required') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            QA Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="input-field"
            rows={4}
            placeholder="Provide detailed feedback for the developer..."
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Submit Review
        </button>
      </div>
    </form>
  );
};

const QAPage = () => {
  const { getToken } = useAuth();
  const { profileRole, currentUser } = useApp();
  const [qaTasks, setQaTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch QA tasks from API
  useEffect(() => {
    fetchQATasks();
  }, []);

  const fetchQATasks = async () => {
    const token = await getToken();
    try {
      setLoading(true);
      const response = await axios.get('/api/qa/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQaTasks(response.data);
    } catch (error) {
      console.error('Error fetching QA tasks:', error);
      toast.error('Failed to fetch QA tasks');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on user role
  const filteredTasks = profileRole === 'user'
    ? qaTasks.filter(task => task.assignee?._id === currentUser._id)
    : qaTasks;

    console.log(filteredTasks, "filteredTasks");
    

  const statusColors = {
    'QA Ready': '#6b7280',
    'QA': '#f59e0b',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Fixing Required': '#f97316',
  };

  const priorityColors = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#ef4444',
    'Critical': '#dc2626',
  };

  const handleStatusUpdate = async (taskId, newStatus, remarks = '') => {
    const token = await getToken(); // Ensure token is awaited
    try {
      const response = await axios.put(
        `/api/qa/tasks/${taskId}`,
        {
          status: newStatus,
          qaRemarks: remarks,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with the updated task
      setQaTasks(qaTasks.map(task =>
        task._id === taskId ? response.data : task
      ));

      const statusMessages = {
        'Approved': 'Task approved successfully!',
        'Rejected': 'Task rejected and moved to revision.',
        'Fixing Required': 'Task marked for fixing and moved to revision.',
      };

      toast.success(statusMessages[newStatus] || 'Status updated successfully!');
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Fixing Required':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Loading QA...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quality Assurance</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredTasks.filter(task => task.status === 'QA' || task.status === 'QA Ready').length} tasks pending review
        </div>
      </div>

      {/* QA Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                <span className="font-medium">Milestone:</span>
                <span>{task.milestone?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Assignee:</span>
                <div className="flex justify-center gap-1 items-center">
                  <img src={task.assignee?.imageUrl} className='w-6 h-6 rounded-full' />
                  <span>
                    {task.assignee
                      ? `${task.assignee.firstName} ${task.assignee.lastName}`
                      : '—'
                    }
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Submitted:</span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {task.qaRemarks && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  QA Feedback
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                  {task.qaRemarks}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {task.status === 'QA' || task.status === 'QA Ready' ? (
                <>
                  {(profileRole === "super-admin" || profileRole === "admin") ? (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                      className="w-full btn-primary"
                    >
                      Review Task
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  {getStatusIcon(task.status)}
                  <span>Review Completed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No QA Tasks</h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no tasks available for QA review at the moment.
          </p>
        </div>
      )}

      {/* QA Review Modal */}
      {(profileRole === "super-admin" || profileRole === "admin") ? (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          title="QA Review"
          size="lg"
        >
          {selectedTask && (
            <QAReviewModal
              task={selectedTask}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedTask(null);
              }}
              onSubmit={handleStatusUpdate}
            />
          )}
        </Modal>
      ) : null}
    </div>
  );
};

export default QAPage;