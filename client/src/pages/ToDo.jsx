import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  CheckCircle,
  Clock,
  Bell,
  Plus,
  Calendar,
  Trash2,
  Edit3,
  Save,
  X,
  AlertCircle,
  Target,
  BellRing,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

export default function PersonalTodoReminder() {
  const { getToken } = useAuth();
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [items, setItems] = useState({ todos: [], reminders: [] });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    dueDate: '',
    datetime: '',
  });

  const categories = ['work', 'personal', 'health', 'finance', 'other'];
  const priorities = ['low', 'medium', 'high'];

  // Axios instance with Clerk token
  const api = axios.create();
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch tasks & reminders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, remRes] = await Promise.all([
          api.get('/api/personal-tasks'),
          api.get('/api/reminders'),
        ]);
        setItems({ todos: todosRes.data, reminders: remRes.data });
      } catch (err) {
        console.error('Fetch error', err);
      }
    };
    fetchData();
  }, []);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setNotificationPermission);
      }
    }
  }, []);

  // Reminder notifications
  useEffect(() => {

    const checkReminders = () => {
      const nowMs = Date.now();
      items.reminders.forEach(rem => {
        const dtMs = new Date(rem.datetime).getTime();
        // fire if between now and one minute from now
        if (!rem.notified && dtMs > nowMs && dtMs - nowMs <= 60000) {
          if (notificationPermission === 'granted') {
            new Notification(`Reminder: ${rem.title}`, {
              body: rem.description,
              icon: '/api/placeholder/64/64',
            });
          }
          handleUpdate(rem._id, { notified: true });
        }
      });
    };
    const iv = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(iv);
  }, [items.reminders, notificationPermission]);

  function getLocalDateTimeString() {
    const now = new Date()
    // convert to local‐ISO by removing the offset
    const msOffset = now.getTimezoneOffset() * 60000
    const local = new Date(now.getTime() - msOffset)
    // YYYY-MM-DDTHH:mm
    return local.toISOString().slice(0, 16)
  }

  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority || 'medium',
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
        datetime: item.datetime ? item.datetime.slice(0, 16) : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'work',
        priority: 'medium',
        dueDate: new Date().toISOString().slice(0, 10),
        datetime: getLocalDateTimeString(),
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ title: '', description: '', category: 'work', priority: 'medium', dueDate: '', datetime: '' });
  };
  console.log(editingItem, "editingItem");

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.datetime || !formData.dueDate) return toast.error('All fields are required.');
    try {
      if (editingItem) {
        const res = await api.put(
          `${activeTab === 'todos' ? '/api/personal-tasks' : '/api/reminders'}/${editingItem._id}`,
          formData
        );
        setItems((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].map((it) => (it._id === editingItem._id ? res.data : it)),
        }));
        toast.success(activeTab === 'todos' ? 'Task updated successfully!' : 'Reminder updated successfully!');
      } else {
        const res = await api.post(
          activeTab === 'todos' ? '/api/personal-tasks' : '/api/reminders',
          formData
        );
        setItems((prev) => ({ ...prev, [activeTab]: [res.data, ...prev[activeTab]] }));
        toast.success(activeTab === 'todos' ? 'Task created successfully!' : 'Reminder created successfully!');
      }
      closeForm();
    } catch (err) {
      console.error('Submit error', err);
      toast.error(activeTab === 'todos' ? 'Failed to create task!' : 'Failed to create reminder!');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await api.put(
        `${activeTab === 'todos' ? '/api/personal-tasks' : '/api/reminders'}/${id}`,
        updates
      );
      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((it) => (it._id === id ? res.data : it)),
      }));
      toast.success(activeTab === 'todos' ? 'Task updated successfully!' : 'Reminder updated successfully!');
    } catch (err) {
      console.error('Update error', err);
      toast.error(activeTab === 'todos' ? 'Failed to update task!' : 'Failed to update reminder!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(
        `${activeTab === 'todos' ? '/api/personal-tasks' : '/api/reminders'}/${id}`
      );
      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((it) => it._id !== id),
      }));
      toast.success(activeTab === 'todos' ? 'Task deleted successfully!' : 'Reminder deleted successfully!');
    } catch (err) {
      console.error('Delete error', err);
      toast.error(activeTab === 'todos' ? 'Failed to delete task!' : 'Failed to delete reminder!');
    }
  };

  const toggleTodoStatus = (todo) => {
    console.log(todo, "perstodo");

    handleUpdate(todo._id, { status: todo.status === 'completed' ? 'pending' : 'completed' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-700';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'work': return 'text-blue-400 bg-blue-900/20';
      case 'personal': return 'text-purple-400 bg-purple-900/20';
      case 'health': return 'text-green-400 bg-green-900/20';
      case 'finance': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const isOverdue = (date) => new Date(date) < new Date().setHours(0, 0, 0, 0);

  const pendingTodos = items.todos.filter((t) => t.status === 'pending');
  const completedTodos = items.todos.filter((t) => t.status === 'completed');
  // const upcomingReminders = items.reminders.filter((r) => new Date(r.datetime) > new Date());
  const upcomingReminders = items.reminders.filter((r) => new Date(r.datetime).getTime() > Date.now());

  console.log(items, "todo items");


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Hi {user.firstName} {user.lastName}
          </h1>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Personal Todo & Reminders
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your tasks and never miss important reminders
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Pending Tasks */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{pendingTodos.length}</p>
                <p className="text-sm text-gray-400">Pending Tasks</p>
              </div>
            </div>
          </div>
          {/* Completed */}
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{completedTodos.length}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          {/* Upcoming */}
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{upcomingReminders.length}</p>
                <p className="text-sm text-gray-400">Upcoming Reminders</p>
              </div>
            </div>
          </div>
          {/* Overdue */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold">{pendingTodos.filter((t) => t.dueDate && isOverdue(t.dueDate)).length}</p>
                <p className="text-sm text-gray-400">Overdue Tasks</p>
              </div>
            </div>
          </div>
        </div>
        {/* Notification */}
        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <BellRing className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Enable Notifications</p>
              <p className="text-sm text-gray-400">Allow notifications to receive reminder alerts</p>
            </div>
            <button onClick={() => Notification.requestPermission().then(setNotificationPermission)} className="ml-auto bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Enable
            </button>
          </div>
        )}
        {/* Tabs + Add */}
        <div className="flex gap-2 mb-6">
          {['todos', 'reminders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 capitalize ${activeTab === tab ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>{tab === 'todos' ? 'Tasks' : 'Reminders'}</button>
          ))}
          <button onClick={() => openForm(null)} className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
            <Plus size={20} /> Add New
          </button>
        </div>
        {/* Form */}
        {showForm && (
          <Modal
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            title={`${activeTab === 'todos' ? 'Task' : 'Reminder'}`}
            size="lg">
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add New'} {activeTab === 'todos' ? 'Task' : 'Reminder'}</h3>
              <div className="space-y-4">
                {/* Title */}
                <div><label className="block text-sm font-medium mb-2">Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
                {/* Description */}
                <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div><label className="block text-sm font-medium mb-2">Category</label><select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">{categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}</select></div>
                  {activeTab === 'todos' ? <>
                    {/* Priority */}
                    <div><label className="block text-sm font-medium mb-2">Priority</label><select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">{priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></div>
                    {/* Due Date */}
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Due Date</label><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
                  </> : <div><label className="block text-sm font-medium mb-2">Date & Time</label><input type="datetime-local" value={formData.datetime} onChange={e => setFormData({ ...formData, datetime: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>}
                </div>
                {/* Actions */}
                <div className="flex gap-3"><button onClick={handleSubmit} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"><Save size={20} />{editingItem ? 'Update' : 'Add'}</button><button onClick={closeForm} className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"><X size={20} />Cancel</button></div>
              </div>
            </div>
          </Modal>
        )}
        {/* List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700"><h2 className="text-xl font-semibold capitalize">{activeTab === 'todos' ? 'Tasks' : 'Reminders'}</h2></div>
          <div className="divide-y divide-gray-700">
            {items[activeTab].length === 0 ?
              <div className="p-12 text-center text-gray-400"><Target className="w-16 h-16 mx-auto mb-4 opacity-50" /><p className="text-lg">No {activeTab === 'todos' ? 'tasks' : 'reminders'} yet</p><p className="text-sm mt-2">Add one using the button above</p></div>
              : items[activeTab].map(item => (
                <div key={item._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {activeTab === 'todos' && <button onClick={() => toggleTodoStatus(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-500'}`}>{item.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}</button>}
                        <h3 className={`font-semibold text-lg ${activeTab === 'todos' && item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{item.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>{item.category}</span>
                        {activeTab === 'todos' && <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>{item.priority}</span>}
                      </div>
                      <p className="text-gray-400 mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {activeTab === 'todos' ? item.dueDate ? (<span className={isOverdue(item.dueDate) && item.status !== 'completed' ? 'text-red-400' : ''}>Due: {new Date(item.dueDate).toLocaleDateString()}{isOverdue(item.dueDate) && item.status !== 'completed' ? ' (Overdue)' : ''}</span>) : 'No due date' : new Date(item.datetime).toLocaleString()}</span>
                        {activeTab === 'reminders' && item.notified && <span className="flex items-center gap-1 text-green-400"><BellRing className="w-4 h-4" />Notified</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => openForm(item)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                      {/* <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"> */}

                      <AlertDialog className="dark:bg-gray-800">
                        <AlertDialogTrigger className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 focus:ring-red-600" onClick={() => handleDelete(item._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* </button> */}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
