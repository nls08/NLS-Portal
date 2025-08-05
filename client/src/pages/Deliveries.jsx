import React, { useState, useEffect } from 'react';
import { Package, Calendar, User, CheckCircle, Download, ExternalLink, RefreshCw, UserIcon, MessageSquare, ExternalLinkIcon, Clock, Target, Badge, FileText, Briefcase, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '@clerk/clerk-react';
import Modal from '../components/ui/Modal';


const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
      <AlertCircle className="w-3 h-3 mr-1" />
      {priority}
    </span>
  );
};

const Deliveries = () => {
  const { getToken } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    projects: 0,
    milestones: 0,
    tasks: 0,
    total: 0
  });

  const [selectedDelivery, setSelectedDelivery] = useState({})
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch deliveries from API
  const fetchDeliveries = async (type = 'all') => {
    const token = await getToken();
    try {
      setLoading(true);
      setError(null);

      const endpoint = type === 'all'
        ? '/api/deliveries'
        : `/api/deliveries/type/${type}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      console.log(endpoint);


      if (!response.ok) {
        throw new Error(`Failed to fetch deliveries: ${response.statusText}`);
      }

      const data = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery stats
  const fetchStats = async () => {
    const token = await getToken();
    try {
      const response = await fetch('/api/deliveries/stats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, []);

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchDeliveries(newFilter);
  };

  // Refresh deliveries
  const refreshDeliveries = () => {
    fetchDeliveries(filter);
    fetchStats();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Project':
        return '#3b82f6';
      case 'Milestone':
        return '#10b981';
      case 'Task':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Project':
        return <Package className="w-5 h-5" />;
      case 'Milestone':
        return <CheckCircle className="w-5 h-5" />;
      case 'Task':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery)
    setShowDetailModal(true)
  }

  const isMeaningfulDescription = (desc) => {
  if (!desc || typeof desc !== 'string') return false; 
  const stripped = desc.replace(/<[^>]*>/g, '').trim();
  return stripped.length > 0;
};



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Loading Deliveries...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
          <button
            onClick={refreshDeliveries}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-500">⚠️</div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Deliveries</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Deliveries</option>
            <option value="project">Projects</option>
            <option value="milestone">Milestones</option>
            <option value="task">Tasks</option>
          </select>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {deliveries.length} deliveries
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.projects}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Projects Delivered</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.milestones}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Milestones Completed</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.tasks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Delivered</div>
        </div>
      </div>

      {/* Deliveries Grid */}
      {deliveries.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Deliveries Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No completed projects, milestones, or tasks to display as deliveries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map((delivery) => (
            <div key={`${delivery.type}-${delivery.id}`} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${getTypeColor(delivery.type)}20` }}
                  >
                    <div style={{ color: getTypeColor(delivery.type) }}>
                      {getTypeIcon(delivery.type)}
                    </div>
                  </div>
                  <div>
                    <StatusBadge
                      status={delivery.type}
                      color={getTypeColor(delivery.type)}
                      size="sm"
                    />
                  </div>
                </div>
                <StatusBadge status={delivery.status} color="#10b981" size="sm" />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {delivery.name}
                </h3>
                {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {delivery.description}
                </p> */}
                {isMeaningfulDescription(delivery.description) && (
                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                    dangerouslySetInnerHTML={{ __html: delivery.description }}
                  />
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  {/* <span>{delivery.deliveredBy}</span> */}
                  <div className="flex items-center -space-x-2">
                    {Array.isArray(delivery.deliveredBy) ? (
                      delivery.deliveredBy.length > 0 ? (
                        delivery.deliveredBy.map((user) => (
                          user.imageUrl ? (
                            <img
                              key={user.id}
                              src={user.imageUrl}
                              alt={user.name || 'Assignee'}
                              title={user.name}
                              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            />
                          ) : (
                            <UserIcon
                              key={user.id}
                              className="w-6 h-6 text-gray-400 bg-gray-100 rounded-full p-1 border-2 border-white dark:border-gray-800"
                              title={user.name || 'Assignee'}
                            />
                          )
                        ))
                      ) : (
                        <span className="text-gray-500">No assignees</span>
                      )
                    ) : typeof delivery.deliveredBy === 'string' ? (
                      <img
                        src={delivery.deliveredBy}
                        alt="Assignee"
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                      />
                    ) : (
                      <span className="text-gray-500">No assignees</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(delivery.completedDate)}</span>
                </div>
              </div>

              {/* Deliverables */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Deliverables:
                </h4>
                <div className="space-y-1">
                  {/* {delivery.deliverables?.map((deliverable, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{deliverable}</span>
                    </div>
                  ))} */}
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{delivery.deliverables}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleViewDetails(delivery)}
                  type="button"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Delivery Details`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedDelivery?.originalData?.title || selectedDelivery?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {selectedDelivery?.originalData?.project?.name || 'No Project'}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <StatusBadge status={selectedDelivery?.status} />
                <PriorityBadge priority={selectedDelivery?.originalData?.priority || 'Low'} />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Task Information */}
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {selectedDelivery?.type} Information
                </h3>
                <div className="space-y-4">
                  {isMeaningfulDescription(selectedDelivery?.originalData?.description || selectedDelivery?.description) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <div
                        className="text-gray-900 dark:text-white mt-1"
                        dangerouslySetInnerHTML={{
                          __html: selectedDelivery?.originalData?.description || selectedDelivery?.description || 'No description provided'
                        }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                      <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {selectedDelivery?.type}
                      </p>
                    </div>
                    {/* <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</label>
                      <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <Badge className="w-4 h-4" />
                        {selectedDelivery?.version}
                      </p>
                    </div> */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Deliverables</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedDelivery?.deliverables}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignee Information */}
              {selectedDelivery?.originalData?.assignee && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Assignee{Array.isArray(selectedDelivery?.originalData.assignee) ? 's' : ''}
                  </h3>
                  <div className="space-y-4">
                    {Array.isArray(selectedDelivery?.originalData.assignee) ? (
                      selectedDelivery?.originalData.assignee.map((assignee, index) => (
                        <div key={index} className="flex items-center gap-4">
                          {assignee.imageUrl && (
                            <img
                              src={assignee.imageUrl}
                              alt={`${assignee.firstName || ''} ${assignee.lastName || ''}`}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {assignee.firstName || ''} {assignee.lastName || ''}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assignee.email || ''}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-4">
                        {selectedDelivery?.originalData.assignee.imageUrl && (
                          <img
                            src={selectedDelivery?.originalData.assignee.imageUrl}
                            alt={`${selectedDelivery?.originalData.assignee.firstName || ''} ${selectedDelivery?.originalData.assignee.lastName || ''}`}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedDelivery?.originalData.assignee.firstName || ''} {selectedDelivery?.originalData.assignee.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedDelivery?.originalData.assignee.email || ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  {selectedDelivery?.originalData?.createdAt && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(selectedDelivery?.originalData.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery?.originalData?.dueDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <Target className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Due Date</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(selectedDelivery?.originalData.dueDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery?.completedDate && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(selectedDelivery?.completedDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDelivery?.originalData?.updatedAt && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(selectedDelivery?.originalData.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Todo List */}
              {selectedDelivery?.originalData?.todos && selectedDelivery?.originalData.todos.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    Tasks ({selectedDelivery?.originalData.todos.filter(t => t.completed).length}/{selectedDelivery?.originalData.todos.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedDelivery?.originalData.todos.map((todo) => (
                      <div key={todo._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${todo.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'}`}>
                          {todo.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${todo.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {todo.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remarks Section */}
          {(selectedDelivery?.originalData?.remarks || selectedDelivery?.originalData?.qaRemarks) && (
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Remarks & Comments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">General Remarks</label>
                  <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg min-h-[60px]">
                    {selectedDelivery?.originalData?.remarks || 'No remarks provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">QA Remarks</label>
                  <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg min-h-[60px]">
                    {selectedDelivery?.originalData?.qaRemarks || 'No QA remarks provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Deliveries;