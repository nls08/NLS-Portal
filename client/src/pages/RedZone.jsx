import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  User,
  Target,
  Calendar,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import { useWebSocket } from '../context/WebSocketContext';
import { useApp } from '../context/AppContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const RedZone = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const { sendMessage, isConnected } = useWebSocket();
  const { user } = useUser();
  const { fetchUsers, fetchProjects, users, projects, profileRole } = useApp();

  const [redZoneEntries, setRedZoneEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntensity, setFilterIntensity] = useState('all');

  const [formData, setFormData] = useState({
    employee: '',
    affectedProject: '',
    reason: '',
    affectedProgress: 0,
    intensity: 'Medium',
    remarks: '',
    notesForImprovement: '',
  });

  const intensityLevels = ['Low', 'Medium', 'High', 'Critical'];

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchProjects(), fetchEntries()]);
    } catch (err) {
      console.error(err);
      toast.error('Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    const token = await getToken();
    const { data } = await axios.get('/api/red-zone', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setRedZoneEntries(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    try {
      const payload = editingEntry
        ? {
          // exclude createdBy
          employee: formData.employee,
          affectedProject: formData.affectedProject,
          reason: formData.reason,
          affectedProgress: formData.affectedProgress,
          intensity: formData.intensity,
          remarks: formData.remarks,
          notesForImprovement: formData.notesForImprovement,
        }
        : {
          // include createdBy only on create
          ...formData,
          createdBy: user.id,
        };

      let res;
      if (editingEntry) {
        res = await axios.put(`/api/red-zone/${editingEntry._id}`, payload,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        setRedZoneEntries((prev) => prev.map(ent => ent._id === res.data._id ? res.data : ent));
        toast.success('Entry updated');
      } else {
        res = await axios.post('/api/red-zone', payload,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        setRedZoneEntries((prev) => [res.data, ...prev]);
        toast.success('Entry created');
      }
      await fetchEntries();

      // Notifications
      if (isConnected) {
        // Only send alert if notifying someone else
        if (formData.employee && formData.employee !== user.id) {
          sendMessage({
            type: 'notification',
            notificationType: 'red_zone_alert',
            recipientId: formData.employee,
            title: 'Red Zone Alert',
            message: `You have been added to the Red Zone for project: ${projects.find((p) => p._id === formData.affectedProject)?.name
              }`,
            data: { entryId: res.data._id },
          });
        }
        sendMessage({
          type: 'notification',
          notificationType: 'red_zone_entry',
          recipientId: 'super-admin',
          title: 'New Red Zone Entry',
          message: `${users.find((u) => u._id === formData.employee)?.name
            } added to Red Zone`,
          data: { entryId: res.data._id },
        });
      }

      resetForm();
      setShowCreateModal(false);
      setEditingEntry(null);
    } catch (error) {
      console.error(error);
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id) => {
    // if (!window.confirm('Are you sure?')) return;
    const token = await getToken();
    try {
      await axios.delete(`/api/red-zone/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      setRedZoneEntries(prev => prev.filter(e => e._id !== id));
      toast.success('Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const resetForm = () => setFormData({ employee: '', affectedProject: '', reason: '', affectedProgress: 0, intensity: 'Medium', remarks: '', notesForImprovement: '' });

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({ employee: entry.employee, affectedProject: entry.affectedProject, reason: entry.reason, affectedProgress: entry.affectedProgress, intensity: entry.intensity, remarks: entry.remarks, notesForImprovement: entry.notesForImprovement });
    setShowCreateModal(true);
  };

  const openDetailsModal = (entry) => { setSelectedEntry(entry); setShowDetailsModal(true); };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityIcon = (intensity) => {
    switch (intensity) {
      case 'Critical': return '🚨';
      case 'High': return '⚠️';
      case 'Medium': return '⚡';
      case 'Low': return '⚪';
      default: return '⚪';
    }
  };

  const filteredEntries = redZoneEntries.filter(entry => {
    const emp = entry.employee?.firstName + ' ' + entry.employee?.lastName || '';
    const proj = entry.affectedProject?.name || '';
    const matchesSearch = [emp, proj, entry.reason].some(text => text.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterIntensity === 'all' || entry.intensity === filterIntensity;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log(filteredEntries, "filteredEntries");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold dark:text-gray-300">Red Zone Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage underperforming employees and projects</p>
        </div>
        {(profileRole === "super-admin" || profileRole === "admin") && <button
          onClick={() => setShowCreateModal(true)}
          className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
        >
          <Plus className="h-4 w-4" />
          <span>Add to Red Zone</span>
        </button>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${theme.surface} p-6 rounded-xl ${theme.border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Entries</p>
              <p className="text-2xl font-bold text-red-600">{redZoneEntries.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className={`${theme.surface} p-6 rounded-xl ${theme.border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Critical Issues</p>
              <p className="text-2xl font-bold text-red-700">
                {redZoneEntries.filter(entry => entry.intensity === 'Critical').length}
              </p>
            </div>
            <div className="text-2xl">🚨</div>
          </div>
        </div>

        <div className={`${theme.surface} p-6 rounded-xl ${theme.border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {redZoneEntries.filter(entry => entry.intensity === 'High').length}
              </p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>

        <div className={`${theme.surface} p-6 rounded-xl ${theme.border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Avg. Impact</p>
              <p className="text-2xl font-bold text-purple-600">
                {redZoneEntries.length > 0
                  ? Math.round(redZoneEntries.reduce((sum, entry) => sum + entry.affectedProgress, 0) / redZoneEntries.length)
                  : 0}%
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees, projects, or reasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${theme.bg} ${theme.border} border bg-gray-50 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <select
          value={filterIntensity}
          onChange={(e) => setFilterIntensity(e.target.value)}
          className={`px-4 py-2 ${theme.bg} ${theme.border} border bg-gray-50 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="all">All Intensities</option>
          {intensityLevels.map(intensity => (
            <option key={intensity} value={intensity}>{intensity}</option>
          ))}
        </select>
      </div>

      {/* Red Zone Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className={` dark:bg-gray-800 p-6 rounded-xl border-2 border-red-200 hover:shadow-lg transition-all duration-300 bg-red-50`}
          >
            {/* Entry Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600">Red Zone Alert</h3>
                </div>
                <p className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  {/* {users.find(u => u._id === entry.employee)?.firstName || 'Unknown Employee'} */}
                  {/* {entry.employee.firstName} {entry.employee.lastName} */}
                  <img src={entry.employee.imageUrl} className='w-6 h-6 rounded-full' alt="" />
                  {entry.employee.firstName} {entry.employee.lastName}
                </p>
              </div>
              <div className="text-2xl">
                {getIntensityIcon(entry.intensity)}
              </div>
            </div>

            {/* Intensity and Progress Impact */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getIntensityColor(entry.intensity)}`}>
                {entry.intensity}
              </span>
              <span className="text-sm text-red-600 font-medium">
                -{entry.affectedProgress}% Progress Impact
              </span>
            </div>

            {/* Entry Info */}
            <div className="space-y-2 text-sm dark:text-gray-300 text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{entry.affectedProject?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Creator {entry.createdBy?.firstName} {entry.createdBy?.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Added {new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Reason:</h4>
              <div className={`p-3 ${theme.bg} rounded-lg`}>
                <p className="text-sm line-clamp-2 dark:text-gray-300">{entry.reason}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openDetailsModal(entry)}
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-1`}
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              {(profileRole === "super-admin" || profileRole === "admin") &&
                <>
                  <button
                    onClick={() => startEdit(entry)}
                    className={`p-2 ${theme.hover} rounded-lg transition-colors`}
                  >
                    <Edit className="h-4 w-4 dark:text-gray-300" />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(entry._id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button> */}
                  <AlertDialog className="dark:bg-gray-800">
                    <AlertDialogTrigger className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your Red Zone
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(entry._id)}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              }
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Red Zone Entries</h3>
          <p className="text-gray-500">No performance issues have been reported yet.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-xl bg-gray-50 dark:bg-gray-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-6 text-red-600">
              {editingEntry ? 'Edit Red Zone Entry' : 'Add Employee to Red Zone'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <select
                    required
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Employee</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user?.firstName} {user?.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Affected Project</label>
                  <select
                    required
                    value={formData.affectedProject}
                    onChange={(e) => setFormData({ ...formData, affectedProject: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Intensity Level</label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {intensityLevels.map(intensity => (
                      <option key={intensity} value={intensity}>{intensity}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Affected Progress: {formData.affectedProgress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.affectedProgress}
                    onChange={(e) => setFormData({ ...formData, affectedProgress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the performance issue or reason for red zone entry..."
                  className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remarks</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional remarks or context..."
                  className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes for Improvement</label>
                <textarea
                  rows={3}
                  value={formData.notesForImprovement}
                  onChange={(e) => setFormData({ ...formData, notesForImprovement: e.target.value })}
                  placeholder="Suggestions and action items for improvement..."
                  className={`w-full px-3 py-2 ${theme.bg} ${theme.border} border dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors`}
                >
                  {editingEntry ? 'Update Red Zone Entry' : 'Add to Red Zone'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                  className={`flex-1 ${theme.hover} py-2 border rounded-lg transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-xl dark:bg-gray-800 bg-red-50 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-bold text-red-600">Red Zone Details</h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 ${theme.hover} rounded-lg dark:text-gray-300 transition-colors`}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold dark:text-gray-300 mb-3">Entry Information</h3>
                <div className={`p-4 ${theme.bg} rounded-lg space-y-3`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Employee</label>
                      <p className="font-medium flex gap-2 items-center dark:text-gray-300">
                        <img src={selectedEntry.employee?.imageUrl} className='w-6 h-6 rounded-full' alt="noimage" />
                        {selectedEntry.employee?.firstName} {selectedEntry.employee?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Affected Project</label>
                      <p className="font-medium dark:text-gray-300">{selectedEntry.affectedProject?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Intensity Level</label>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getIntensityColor(selectedEntry.intensity)}`}>
                        {getIntensityIcon(selectedEntry.intensity)} {selectedEntry.intensity}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Progress Impact</label>
                      <p className="font-medium text-red-600">-{selectedEntry.affectedProgress}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Created Date</label>
                      <p className='dark:text-gray-300'>{new Date(selectedEntry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Created By</label>
                      <p className='flex gap-2'>
                        <img src={selectedEntry.createdBy?.imageUrl} className='w-6 h-6 rounded-full' alt="noimage" />
                        <span className='dark:text-gray-300'>{selectedEntry.createdBy?.firstName} {selectedEntry.createdBy?.lastName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-gray-300">Reason</h3>
                <div className={`p-4 ${theme.bg} rounded-lg`}>
                  <p className='dark:text-gray-300'>{selectedEntry.reason}</p>
                </div>
              </div>

              {/* Remarks */}
              {selectedEntry.remarks && (
                <div className='dark:text-gray-300'>
                  <h3 className="text-lg font-semibold mb-3">Remarks</h3>
                  <div className={`p-4 ${theme.bg} rounded-lg`}>
                    <p>{selectedEntry.remarks}</p>
                  </div>
                </div>
              )}

              {/* Notes for Improvement */}
              {selectedEntry.notesForImprovement && (
                <div className='dark:text-gray-300'>
                  <h3 className="text-lg font-semibold mb-3">Notes for Improvement</h3>
                  <div className={`p-4 ${theme.bg} rounded-lg`}>
                    <p>{selectedEntry.notesForImprovement}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedZone;