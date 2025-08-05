import React, { useState, useEffect, useRef } from 'react';
import { User, Plus, ArrowRight, X, Check, List, Trash2, Edit } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import Modal from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { v4 as uuid } from 'uuid';



const TaskForm = ({ onSubmit, onClose, task }) => {

  const { getToken } = useAuth()

  const { users, setUsers, fetchUsers, fetchProjects, projects, milestones, fetchMilestones } = useApp();
  const inputRefs = useRef([]);
  const [formData, setFormData] = useState(task ? {
    ...task,
    assignee: task.assignee._id,
    project: task.project._id,
    milestone: task.milestone._id,
    dueDate: task.dueDate || '',
    todos: task.todos.map(todo => ({ id: todo._id, text: todo.text, completed: todo.completed }))
  } : {
    title: '',
    description: '',
    project: '',
    milestone: '',
    assignee: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    todos: [{ id: uuid(), text: '', completed: false }]
  });

  useEffect(() => {
    if (inputRefs.current.length > 0) {
      const lastInput = inputRefs.current[inputRefs.current.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [formData?.todos?.length]);

  // ** New state for only this project’s milestones **
  const [projectMilestones, setProjectMilestones] = useState([]);

  // Whenever the project changes, reload that project's milestones and reset the milestone select
  useEffect(() => {
    if (!formData.project) {
      setProjectMilestones([]);
      setFormData(fd => ({ ...fd, milestone: '' }));
      return;
    }

    (async () => {
      const token = await getToken();
      try {
        const { data } = await axios.get(
          `/api/projects/${formData.project}/milestones`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjectMilestones(data);
        // reset in case they’d previously picked a milestone from another project
        setFormData(fd => ({ ...fd, milestone: '' }));
      } catch (err) {
        console.error('Error loading project milestones', err);
      }
    })();
  }, [formData.project, getToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTodoField = () => {
    setFormData({
      ...formData,
      // todos: [...formData.todos, { text: '', completed: false }]
      todos: [...formData.todos, { id: uuid(), text: '', completed: false }]
    });
  };



  const removeTodoField = (id) => {
    setFormData({
      ...formData,
      todos: formData.todos.filter(todo => todo.id !== id)
    });
  };

  const updateTodoText = (id, text) => {
    setFormData({
      ...formData,
      todos: formData.todos.map(todo =>
        todo.id === id ? { ...todo, text } : todo
      )
    });
  };

  console.log(users, "users");


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Task Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows={3}
        // required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project
          </label>
          {/* <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="input-field"
              required
            /> */}
          <select
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Select a Project</option>
            {projects?.map(project => (
              <option key={project?._id} value={project?._id}>
                {project?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Progress
          </label>
          <input
            type="number"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
            className="input-field"
            required
          />
        </div>

      </div>

      {/* <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Milestone
        </label>
        <select
          value={formData.milestone}
          onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
          className="input-field"
          required
        >
          <option value="">Select an Milestone</option>
          {milestones?.map(mile => (
            <option key={mile?._id} value={mile?._id}>
              {mile?.name}
            </option>
          ))}
        </select>
      </div> */}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Milestone</label>
        <select
          value={formData.milestone}
          onChange={e => setFormData({ ...formData, milestone: e.target.value })}
          className="input-field"
          required
          disabled={!formData.project}
        >
          <option value="">
            {formData.project ? 'Select a Milestone' : 'Choose a Project First'}
          </option>
          {projectMilestones.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <select
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Select an employee</option>
            {users?.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="input-field"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Todos
          </label>
          <button
            type="button"
            onClick={addTodoField}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + Add Todo
          </button>
        </div>

        <div className="space-y-2">
          {formData.todos.map((todo, index) => (
            <div key={todo.id} className="flex items-center space-x-2">
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                value={todo.text}
                onChange={(e) => updateTodoText(todo.id, e.target.value)}
                className="input-field flex-1"
                placeholder="Subtask description"
              />
              <button
                type="button"
                onClick={() => removeTodoField(todo.id)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full"
                disabled={formData.todos.length === 1}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

const Tasks = () => {

  const { users, setUsers, fetchUsers, fetchProjects, projects, milestones, fetchMilestones, profileRole, currentUser } = useApp();
  console.log(profileRole, "thisprofileRole");

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  // const [newTodoText, setNewTodoText] = useState('');
  // const [activeTaskId, setActiveTaskId] = useState(null);
  const { getToken } = useAuth();

  const [allTasks, setAllTasks] = useState([]);        // for admin/card-view
  const [myTasks, setMyTasks] = useState([]);

  const statusColors = {
    'Pending': '#f59e0b',
    'In Progress': '#3b82f6',
    'QA Ready': '#8b5cf6',
    'Completed': '#10b981',
    'QA': '#8b5cf6',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Fixing Required': '#f59e0b'
  };

  // Fetch tasks and group by assignee
  const fetchTasks = async () => {
    const token = await getToken();
    try {
      const { data: tasks } = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return tasks;
    } catch (err) {
      console.error("Failed to load tasks", err);
      toast.error('Failed to load tasks');
      return [];
    }
  };

  // Load all data
  // const loadData = async () => {
  //   setLoading(true);
  //   try {
  //     // const usersData = await fetchUsers();
  //     const tasksData = await fetchTasks();

  //     const grouped = tasksData.reduce((acc, task) => {
  //    const user = task.assignee;           // this is already { _id, firstName, … }
  //    if (!user) return acc;                // skip tasks with no assignee
  //    if (!acc[user._id]) acc[user._id] = { user, tasks: [] };
  //    acc[user._id].tasks.push(task);
  //    return acc;
  //  }, {});
  //  const employeeData = Object.values(grouped).map(({ user, tasks }) => ({
  //   id:  user._id,
  //         name: `${user.firstName} ${user.lastName}`,
  //         email: user ? user.email : '',
  //         imageUrl: user?.imageUrl,
  //         tasks: tasks.map(t => ({
  //           ...t,
  //           dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''
  //         }))
  //  }))


  //    console.log(employees);

  //     setEmployees(employeeData);
  //   } catch (err) {
  //     console.error("Data loading error", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadData = async () => {
    setLoading(true);
    try {
      const tasksData = await fetchTasks();

      if (profileRole === 'user') {
        // 1) Filter down to *only* the logged-in user’s tasks
        const mine = tasksData.filter(t => t.assignee._id === currentUser._id);
        setMyTasks(mine);
        console.log('mytasks', tasksData);
        // 2) Don’t bother grouping or setting employees
        return;
      }

      // ===== ADMIN / SUPER-ADMIN path =====
      // (exactly your existing grouping logic)
      const grouped = tasksData.reduce((acc, task) => {
        const user = task.assignee;
        if (!user) return acc;
        if (!acc[user._id]) acc[user._id] = { user, tasks: [] };
        acc[user._id].tasks.push(task);
        return acc;
      }, {});
      const employeeData = Object.values(grouped).map(({ user, tasks }) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        imageUrl: user.imageUrl,
        tasks: tasks.map(t => ({
          ...t,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().split('T')[0]
            : ''
        }))
      }));
      setEmployees(employeeData);
    } catch (err) {
      console.error("Data loading error", err);
    } finally {
      setLoading(false);
    }
  };


  // useEffect(() => {
  //   loadData();
  //   fetchProjects();
  //   fetchMilestones();
  // }, []);


  useEffect(() => {
    if (!profileRole || !currentUser) return;
    loadData();
    fetchProjects();
    fetchMilestones();
  }, [profileRole, currentUser]);

  // Synchronize selectedEmployee with employees when employees changes
  useEffect(() => {
    if (sidebarOpen && selectedEmployee) {
      const updatedEmployee = employees.find(emp => emp.id === selectedEmployee.id);
      if (updatedEmployee) {
        setSelectedEmployee(updatedEmployee);
      }
    }
  }, [employees, sidebarOpen]);

  // Toggle todo completion
  // const handleTodoToggle = async (taskId, todoId, completed) => {
  //   const token = await getToken();

  //   try {
  //     // Optimistic UI update
  //     setEmployees(prev => prev.map(emp => {
  //       return {
  //         ...emp,
  //         tasks: emp.tasks.map(task => {
  //           if (task._id === taskId) {
  //             return {
  //               ...task,
  //               todos: task.todos.map(todo =>
  //                 todo._id === todoId ? { ...todo, completed } : todo
  //               )
  //             };
  //           }
  //           return task;
  //         })
  //       };
  //     }));

  //     // Update in database
  //     const task = employees.flatMap(e => e.tasks).find(t => t._id === taskId);
  //     const updatedTodos = task.todos.map(t =>
  //       t._id === todoId ? { ...t, completed } : t
  //     );

  //     await axios.put(`/api/tasks/${taskId}/todos`,
  //       { todos: updatedTodos },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     await fetchTasks();
  //     toast.success('Task updated');
  //   } catch (err) {
  //     console.error("Failed to update todo", err);
  //     toast.error('Failed to update task');
  //     loadData();
  //   }
  // };


  const handleTodoToggle = async (taskId, todoId, completed) => {
    const token = await getToken();

    // 1) Pick the right source array & setter
    const isUser = profileRole === 'user';
    const tasksArray = isUser
      ? myTasks
      : employees.flatMap(e => e.tasks);
    const setTasks = isUser ? setMyTasks : newEmployees => setEmployees(newEmployees);

    // 2) Find the task
    const task = tasksArray.find(t => t._id === taskId);
    if (!task) {
      console.warn("Couldn't find task", taskId, "in", isUser ? 'myTasks' : 'employees');
      return;
    }

    // 3) Optimistically update UI
    if (isUser) {
      setMyTasks(prev => prev.map(t =>
        t._id === taskId
          ? {
            ...t,
            todos: t.todos.map(td =>
              td._id === todoId ? { ...td, completed } : td
            )
          }
          : t
      ));
      setSelectedEmployee(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t =>
            t._id === taskId
              ? {
                ...t,
                todos: t.todos.map(td =>
                  td._id === todoId ? { ...td, completed } : td
                )
              }
              : t
          )
        }
      });
    } else {
      setEmployees(prevEmp =>
        prevEmp.map(emp => ({
          ...emp,
          tasks: emp.tasks.map(t =>
            t._id === taskId
              ? {
                ...t,
                todos: t.todos.map(td =>
                  td._id === todoId ? { ...td, completed } : td
                )
              }
              : t
          )
        }))
      );
      setSelectedEmployee(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t =>
            t._id === taskId
              ? {
                ...t,
                todos: t.todos.map(td =>
                  td._id === todoId ? { ...td, completed } : td
                )
              }
              : t
          )
        }
      });
    }

    // 4) Send to server
    try {
      await axios.put(
        `/api/tasks/${taskId}/todos`,
        // take the *new* todos array from our optimistic update
        {
          todos: task.todos.map(td =>
            td._id === todoId ? { ...td, completed } : td
          )
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTasks();
      toast.success('Task updated');
    } catch (err) {
      console.error('Failed to update todo', err);
      toast.error('Failed to update task, reverting…');
      // on error, re-load or revert UI
      loadData();
    }
  };


  // Move task to QA
  const handleMoveToQA = async (taskId) => {
    const token = await getToken();
    try {
      // Optimistic UI update
      setEmployees(prev => prev.map(emp => {
        return {
          ...emp,
          tasks: emp.tasks.map(task =>
            task._id === taskId ? { ...task, status: 'QA Ready' } : task
          )
        };
      }));

      await axios.put(`/api/tasks/${taskId}/qa`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTasks();
      toast.success('Task moved to QA successfully!');
    } catch (err) {
      console.error("Failed to move task to QA", err);
      toast.error('Failed to move task to QA');
      loadData();
    }
  };

  // Create new task
  const handleCreateTask = async (formData) => {
    const token = await getToken();
    try {
      await axios.post('/api/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTasks();
      toast.success('Task created successfully!');
      setIsTaskModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to create task", err);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, formData) => {
    const token = await getToken();
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedTask = response.data;
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        tasks: emp.tasks.map(t => t._id === taskId ? { ...updatedTask, dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString().split('T')[0] : '' } : t)
      })));
      toast.success('Task updated successfully');
      setEditingTask(null);
    } catch (err) {
      console.error("Failed to update task", err);
      toast.error('Failed to update task');
      loadData();
    }
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const inputRefs = useRef([]);

  // ... existing functions (fetchUsers, fetchTasks, loadData, etc) ...

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const token = await getToken();
    try {
      // Optimistic update
      setEmployees(prev => prev.map(emp => {
        return {
          ...emp,
          tasks: emp.tasks.filter(task => task._id !== taskId)
        };
      }));

      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTasks();
      toast.success('Task deleted successfully');

      // If we're in the sidebar, close it if it was the last task
      if (selectedEmployee && selectedEmployee.tasks.length === 1) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to delete task", err);
      toast.error('Failed to delete task');
      loadData();
    }
  };

  // Confirm task deletion
  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteConfirmOpen(true);
  };

  const handleUserViewTasks = () => {
    if (!currentUser) return;

    const emp = {
      id: currentUser._id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
      tasks: myTasks
    };

    setSelectedEmployee(emp);
    setSidebarOpen(true);
  };

  // Focus new input fields when added


  const TaskSidebar = ({ employee, onClose }) => {
    if (!employee) return null;

    const [newTodoText, setNewTodoText] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const inputRef = useRef(null);
    const [activeAddTaskId, setActiveAddTaskId] = useState(null);

    // auto‑focus when the input appears
    useEffect(() => {
      if (showAdd && inputRef.current) {
        inputRef.current.focus();
      }
    }, [showAdd]);

    // const handleAddTodo = async () => {
    //   if (!newTodoText.trim()) return;
    //   // call parent’s handler via props, or duplicate your API logic here
    //   await addTodoApi(employee.id, newTodoText);
    //   setNewTodoText('');
    //   setShowAdd(false);
    //   refreshTasks();     // re‑fetch
    // };


    // const handleAddTodo = async (taskId) => {
    //   if (!newTodoText.trim()) return;

    //   const token = await getToken();
    //   try {
    //     // Optimistic UI update
    //     setEmployees(prev => prev.map(emp => {
    //       return {
    //         ...emp,
    //         tasks: emp.tasks.map(task => {
    //           if (task._id === taskId) {
    //             const newTodo = {
    //               _id: `temp-${Date.now()}`,
    //               text: newTodoText,
    //               completed: false
    //             };
    //             return {
    //               ...task,
    //               todos: [...task.todos, newTodo]
    //             };
    //           }
    //           return task;
    //         })
    //       };
    //     }));

    //     // Get the task
    //     const task = employees.flatMap(e => e.tasks).find(t => t._id === taskId);

    //     // Create new todo object for API
    //     const newTodo = {
    //       text: newTodoText,
    //       completed: false
    //     };

    //     const updatedTodos = [...task.todos, newTodo];

    //     // Update in database
    //     await axios.put(`/api/tasks/${taskId}/todos`,
    //       { todos: updatedTodos },
    //       { headers: { Authorization: `Bearer ${token}` } }
    //     );
    //     await fetchTasks();
    //     toast.success('Todo added');
    //     setNewTodoText('');
    //     setActiveAddTaskId(null);
    //     loadData();
    //   } catch (err) {
    //     console.error("Failed to add todo", err);
    //     toast.error('Failed to add todo');
    //     loadData();
    //   }
    // };


    const handleAddTodo = async (taskId) => {
      if (!newTodoText.trim()) return;
      const token = await getToken();
      const isUser = profileRole === 'user';

      // pick the correct source array
      const list = isUser
        ? myTasks
        : employees.flatMap(e => e.tasks);

      // find the task
      const task = list.find(t => t._id === taskId);
      if (!task) {
        console.warn("Task not found for addTodo:", taskId);
        return;
      }

      // build both temporary and API todos
      const tempTodo = { _id: `temp-${Date.now()}`, text: newTodoText, completed: false };
      const apiTodo = { text: newTodoText, completed: false };

      // 1) Optimistic UI update
      if (isUser) {
        setMyTasks(prev =>
          prev.map(t =>
            t._id === taskId
              ? { ...t, todos: [...t.todos, tempTodo] }
              : t
          )
        );
        setSelectedEmployee(prev => {
          if (!prev) return prev;
          const updated = prev.tasks.map(t =>
            t._id === taskId ? { ...t, todos: [...t.todos, tempTodo] } : t
          );
          return { ...prev, tasks: updated };
        });
      } else {
        setEmployees(prevEmp =>
          prevEmp.map(emp => ({
            ...emp,
            tasks: emp.tasks.map(t =>
              t._id === taskId
                ? { ...t, todos: [...t.todos, tempTodo] }
                : t
            )
          }))
        );
        setSelectedEmployee(prev => {
          if (!prev) return prev;
          const updated = prev.tasks.map(t =>
            t._id === taskId ? { ...t, todos: [...t.todos, tempTodo] } : t
          );
          return { ...prev, tasks: updated };
        });
      }

      // 2) Persist to server
      try {
        const updatedTodos = [...task.todos, apiTodo];
        await axios.put(
          `/api/tasks/${taskId}/todos`,
          { todos: updatedTodos },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchTasks();
        toast.success('Todo added');
        setActiveAddTaskId(null);
        loadData();
      } catch (err) {
        console.error("Failed to add todo", err);
        toast.error("Failed to add todo, reverting…");
        loadData();   // fallback to server state
      } finally {
        setNewTodoText("");
      }
    };


    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {employee.name}'s Tasks
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {employee.tasks.map((task) => (
            <div key={task._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                {/* <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3> */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                  {(profileRole === "super-admin" || profileRole === "admin") && <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="Edit task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(task._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  }
                </div>
                <StatusBadge status={task.status} color={statusColors[task.status]} />
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><strong>Project:</strong> {task.project?.name}</p>
                <p><strong>Milestone:</strong> {task.milestone?.name}</p>
                <p><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Todos:</h4>
                  <button
                    // onClick={() => setActiveTaskId(task._id)}
                    onClick={() =>
                      setActiveAddTaskId(activeAddTaskId === task._id ? null : task._id)
                    }
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Todo
                  </button>
                </div>

                <div className="space-y-2">
                  {task.todos.map((todo) => (
                    <label key={todo._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        // onChange={(e) => handleTodoToggle(task._id, todo._id, e.target.checked)}
                        onChange={(e) => handleTodoToggle(task._id, todo._id, e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm ${todo.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {todo.text}
                      </span>
                    </label>
                  ))}

                  {activeAddTaskId === task._id && (
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="New Todo..."
                        className="input-field flex-1 py-1 px-2 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTodo(task._id);
                        }}
                      />
                      <button
                        onClick={() => handleAddTodo(task._id)}
                        className="p-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {task.remarks && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Remarks:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.remarks}</p>
                </div>
              )}

              {task.qaRemarks && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">QA Remarks:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.qaRemarks}</p>
                </div>
              )}

              {!['QA Ready', 'QA', 'Approved', 'Completed'].includes(task.status) && (
                <button
                  onClick={() => handleMoveToQA(task._id)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Move to QA</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Loading Tasks...
        </div>
      </div>
    );
  }


  if (profileRole === 'user') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        </div>
        {/* — Profile Header — */}
        <div className="flex items-center justify-between space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <img
              src={currentUser.imageUrl}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            </div>
          </div>
          <div className="">
            <td className="px-4 py-2 text-sm">
              <button
                onClick={handleUserViewTasks}
                className="btn-primary cursor-pointer"
              >
                View Tasks
              </button>
            </td>
          </div>
        </div>

        {/* — Tasks Table — */}
        <div className="overflow-x-auto bg-white dark:text-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Project</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Milestone</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Due Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                {/* <th className="px-4 py-2 text-left text-sm font-medium">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {myTasks.map(task => (
                <tr key={task._id}>
                  <td className="px-4 py-2 text-sm">{task.title}</td>
                  <td className="px-4 py-2 text-sm">{task.project?.name}</td>
                  <td className="px-4 py-2 text-sm">{task.milestone?.name}</td>
                  <td className="px-4 py-2 text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <StatusBadge status={task.status} color={statusColors[task.status]} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* — here! duplicate the sidebar markup: */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <TaskSidebar
              employee={selectedEmployee}
              onClose={() => setSidebarOpen(false)}
            />
          </>
        )}
      </div>
    );
  } else {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.length > 0 ? employees.map((employee) => {
            const totalTasks = employee.tasks.length;
            const completedTasks = employee.tasks.filter(task =>
              ['Completed', 'Approved'].includes(task.status)
            ).length;
            const inProgressTasks = employee.tasks.filter(task =>
              task.status === 'In Progress'
            ).length;
            const pendingTasks = employee.tasks.filter(task =>
              ['Pending', 'Fixing Required'].includes(task.status)
            ).length;
            const qaTasks = employee.tasks.filter(task =>
              ['QA Ready', 'QA'].includes(task.status)
            ).length;

            return (
              <div
                key={employee.id}
                className="card hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={employee.imageUrl}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalTasks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    <StatusBadge status={inProgressTasks.toString()} color="#3b82f6" size="sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                    <StatusBadge status={pendingTasks.toString()} color="#f59e0b" size="sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">QA</span>
                    <StatusBadge status={qaTasks.toString()} color="#8b5cf6" size="sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <StatusBadge status={completedTasks.toString()} color="#10b981" size="sm" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setSidebarOpen(true);
                  }}
                  className="mt-4 w-full btn-outline dark:text-gray-300 flex items-center justify-center space-x-2"
                >
                  <List className="w-4 h-4" />
                  <span>View Tasks</span>
                </button>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center py-12">
              <User className="w-16 h-16 mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No tasks assigned</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Create your first task to get started
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-4 btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Task Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <TaskSidebar
              employee={selectedEmployee}
              onClose={() => setSidebarOpen(false)}
            />
          </>
        )}

        {/* Create Task Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Create New Task"
          size="lg"
        >
          <TaskForm
            onSubmit={handleCreateTask}
            onClose={() => setIsTaskModalOpen(false)}
          />
        </Modal>
        <Modal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
          size="lg"
        >
          <TaskForm
            onSubmit={(formData) => handleUpdateTask(editingTask._id, formData)}
            onClose={() => setEditingTask(null)}
            task={editingTask}
          />
        </Modal>
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteTask(taskToDelete);
                  setIsDeleteConfirmOpen(false);
                }}
                className="btn-danger"
              >
                Delete Task
              </button>
            </div>
          </div>
        </Modal>
      </div>
    )
  };
};

export default Tasks;
