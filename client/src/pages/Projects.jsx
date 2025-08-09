import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, User, File, Loader, Loader2, LucideLoader } from 'lucide-react';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import ProgressCircle from '../components/ui/ProgressCircle';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Dropdown } from '../components/ui/Dropdown';
import { useApp } from '../context/AppContext';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';



const ProjectForm = ({
  project,
  selectedDataFromUser,
  milestoneOptions,
  onClose,          // this is handleModalClose
  selectedFiles,
  setSelectedFiles,
  attachments,
  setAttachments
}) => {
  const { getToken } = useAuth();
  const { fetchProjects } = useApp()
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Planning',
    assignee: project?.assignee?.map(a => a._id) || [],
    dueDate: project?.dueDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    priority: project?.priority || 'Medium',
    appProgress: project?.appProgress || 0,
    panelProgress: project?.panelProgress || 0,
    serverProgress: project?.serverProgress || 0,
    milestones: project?.milestones || [],
  });

  const [uploading, setUploading] = useState(false);
  const [projectSubmitLoading, setProjectSubmitLoading] = useState(false);


  const handleFilesUpload = async () => {
    setUploading(true);
    try {
      const results = await Promise.all(
        selectedFiles.map(file => {
          const form = new FormData();
          form.append('file', file);
          form.append('upload_preset', 'ml_default');
          return axios
            .post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
              form
            )
            .then(res => ({
              url: res.data.secure_url,
              public_id: res.data.public_id,
            }));
        })
      );
      setAttachments(prev => [...prev, ...results]);
      toast.success('Files uploaded!');
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

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




  const handleSubmit = async (e) => {
    e.preventDefault();
    const overallProgress = Math.round(
      (formData.appProgress + formData.panelProgress + formData.serverProgress) / 3
    );
    const payload = {
      ...formData, overallProgress,
      assignee: formData.assignee.map(val => {
        const u = selectedDataFromUser.find(u => u.value === val);
        return u.value; // <-- Only ID
      }),
      milestones: formData.milestones,
      attachments,
    };
    console.log(payload, "payload");
    const token = await getToken();
    try {
      setProjectSubmitLoading(true);
      let res;
      if (project) {
        res = await axios.put(
          `/api/projects/${project._id}`,
          // { ...formData, overallProgress },
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `/api/projects`,
          // { ...formData, overallProgress },
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // onSubmit(res.data);
      await fetchProjects();
      toast.success(`Project ${project ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project.');
    } finally {
      setProjectSubmitLoading(false);
    }
    onClose();
  };

  useEffect(() => {
    if (project?.attachments) {
      // if your backend returns [{ url, public_id }, …]
      setAttachments(project.attachments);
    }
  }, [project]);

  console.log(selectedFiles, "selectedFiles");


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-field"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="QA">QA</option>
            <option value="Revision">Revision</option>
            <option value="Done">Done</option>
          </select>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignees</label>
          <Dropdown
            items={selectedDataFromUser}
            value={formData.assignee}
            onChange={vals => setFormData({ ...formData, assignee: vals })}
            multiple
            placeholder="Select assignees"
          />
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            App Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.appProgress}
            onChange={(e) => setFormData({ ...formData, appProgress: parseInt(e.target.value) || 0 })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Panel Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.panelProgress}
            onChange={(e) => setFormData({ ...formData, panelProgress: parseInt(e.target.value) || 0 })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Server Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.serverProgress}
            onChange={(e) => setFormData({ ...formData, serverProgress: parseInt(e.target.value) || 0 })}
            className="input-field"
          />
        </div>
      </div>

      <div className="mb-3 w-full">
        <label htmlFor="fileInput" className="dark:text-gray-300 mb-1">Select Files</label>
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={e => {
            if (!e.target.files) return;

            // turn FileList into Array<File>
            const newFiles = Array.from(e.target.files);

            // merge with previous, filtering out duplicates by name+size
            setSelectedFiles(prev => {
              const all = [...prev];
              newFiles.forEach(f => {
                if (!all.some(existing => existing.name === f.name && existing.size === f.size)) {
                  all.push(f);
                }
              });
              return all;
            });

            // clear the input so you can pick the same file again if needed
            e.target.value = null;
          }}
          className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-100 dark:file:text-black dark:focus:border-primary"
        />
        <button
          type="button"
          onClick={handleFilesUpload}
          disabled={!selectedFiles.length || uploading}
          className="mt-2 btn-primary cursor-pointer disabled:opacity-[1px] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {uploading ? 'Uploading…' : 'Upload Files'}
        </button>

        {selectedFiles?.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm">
            {selectedFiles.map((f, i) => (
              <li key={i} className="flex justify-between">
                <span className='text-white my-1'>{i + 1} ) {f.name} ({f.size / 1024 / 1024 > 1 ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : `${(f.size / 1024).toFixed(2)} KB`})</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500"
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </li>
            ))}
          </ul>
        )}

        {attachments.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm">
            {attachments.map((att, i) => (
              <li key={i} className="flex justify-between">
                <a href={att.url} target="_blank" rel="noreferrer" className='text-white my-1'>
                  {i + 1} ) {att.public_id}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments(prev => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500"
                >
                  <Trash2 className='w-4 h-4' />
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
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary inline-flex justify-center items-center gap-2"
          disabled={projectSubmitLoading}
        >
          {projectSubmitLoading && <LucideLoader className='animate-spin w-4 h-4' />}
          {project ? 'Update' : 'Create'} Project
        </button>
      </div>
    </form>
  );
};


const Projects = () => {

  const { users, setUsers, fetchUsers, milestones, fetchMilestones, fetchProjects, projects, setProjects, profileRole, loadingProjects, setLoadingProjects } = useApp();

  // const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMilestones, setShowMilestones] = useState(false);
  const [projectMilestones, setProjectMilestones] = useState([]);

  const [clientMilestones, setClientMilestones] = useState([])
  const [showClientMilestones, setShowClientMilestones] = useState(false)

  const [selectedDataFromUser, setSelectedDataFromUser] = useState([])
  const { getToken } = useAuth();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [showDescription, setShowDescription] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);



  const setUsersData = () => {
    setSelectedDataFromUser(users?.map(u => ({
      value: u._id,
      label: `${u.firstName} ${u.lastName}`,
      left: (<img src={u.imageUrl} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />),
      meta: u
    })));
  }

  const loadData = async () => {
    // first fetch users so that `users` state is populated
    await fetchUsers();
    // then fire off the rest in parallel
    await Promise.all([fetchProjects(), fetchMilestones()]);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedDataFromUser(
      users.map(u => ({
        value: u._id,
        label: `${u.firstName} ${u.lastName}`,
        left: (<img src={u.imageUrl} alt={`${u.firstName} ${u.lastName}`} className="w-6 h-6 rounded-full object-cover" />),
        meta: u
      }))
    );
  }, [users]);

  const milestoneOptions = useMemo(() =>
    milestones?.map(m => ({
      value: m._id,
      label: m.name,
    })) || []
    , [milestones]);



  console.log(selectedDataFromUser, "this is project");


  const handleModalClose = async () => {
    // 1) If anything’s already uploaded, delete them from Cloudinary
    if (attachments.length) {
      const token = await getToken();
      await Promise.all(
        attachments.map(att =>
          axios.delete(`/api/cloudinary/uploads/${att.public_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    }

    // 2) Reset local file state
    setAttachments([]);
    setSelectedFiles([]);

    // 3) Close the modal & clear selection
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const statusColors = {
    'In Progress': '#3b82f6',
    'QA': '#f59e0b',
    'Done': '#10b981',
    'Revision': '#ef4444',
    'Planning': '#8b5cf6'
  };

  const priorityColors = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#ef4444',
    'Critical': '#dc2626'
  };


  const handleDeleteProject = async (id) => {
    const token = await getToken();
    // if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // setProjects(projects.filter(p => p.id !== id));
      await fetchProjects();
      toast.success('Project deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project.');
    }
  };

  const handleViewMilestones = async (project) => {
    const token = await getToken();
    setSelectedProject(project);
    try {
      const { data } = await axios.get(`/api/projects/${project._id}/milestones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // setMilestones(data);
      setProjectMilestones(data);
      setShowMilestones(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load milestones.');
    }
  };

  const handleViewClientMilestones = async (project) => {
    const token = await getToken();
    setSelectedProject(project);
    try {
      if (profileRole === "super-admin" || profileRole === "admin") {
        const { data } = await axios.get(`/api/projects/${project._id}/client-milestones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // setMilestones(data);
        setClientMilestones(data);
        setShowClientMilestones(true);
      } else {
        toast.error('You do not have permission to view client milestones.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load milestones.');
    }
  };

  console.log(projects, "projects");

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Loading Projects...
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        {(profileRole === "super-admin" || profileRole === "admin") &&
          <button
            onClick={() => {
              setSelectedProject(null);
              setSelectedFiles([]);
              setAttachments([]);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        }
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <div key={project._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <button
                  onClick={() => {
                    setShowDescription(true);
                    setSelectedProject(project)
                  }
                  }
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={project.status} color={statusColors[project.status]} />
              <StatusBadge status={project.priority} color={priorityColors[project.priority]} size="sm" />
            </div>

            <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <div className="flex -space-x-2 ml-auto">
                {project.assignee?.map(user => {
                  // const user = users.find(u => u._id === id);
                  return (
                    <img
                      key={user._id}
                      src={user?.imageUrl}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      title={`${user?.firstName} ${user?.lastName}`}
                      className="w-6 h-6 rounded-full border-2 border-white"
                    />
                  );
                })}
              </div>
              <Calendar className="w-4 h-4 ml-4" />
              <span>{new Date(project.dueDate).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              {project.attachments.length === 0 && <span>No attachments</span>}
              {project.attachments.length > 0 && project.attachments.map((attachment) => (
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

            {/* Progress Indicators */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <ProgressCircle percentage={project.appProgress} size={50} />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">App</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={project.panelProgress} size={50} color="#10b981" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Panel</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={project.serverProgress} size={50} color="#f59e0b" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Server</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={project.overallProgress} size={50} color="#8b5cf6" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleViewMilestones(project)}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Milestones</span>
              </button>
              {(profileRole === "super-admin" || profileRole === "admin") &&
                <button
                  onClick={() => handleViewClientMilestones(project)}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Client Milestones</span>
                </button>
              }
              {(profileRole === "super-admin" || profileRole === "admin") &&
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setSelectedFiles([]);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <AlertDialog className="dark:bg-gray-800">
                    <AlertDialogTrigger className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your Project
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project._id)}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        title={selectedProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <ProjectForm
          project={selectedProject}
          milestoneOptions={milestoneOptions}
          selectedDataFromUser={selectedDataFromUser /* previously: selectedDataFromUser */}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          attachments={attachments}
          setAttachments={setAttachments}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />
      </Modal>

      {/* Description Modal */}
      <Modal
        isOpen={showDescription}
        onClose={() => setShowDescription(false)}
        title={`Details - ${selectedProject?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {selectedProject?.description &&
            <div
              className="prose prose-sm max-w-none mb-4 border rounded-md p-4 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: selectedProject?.description }}
            />
          }

          <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedProject?.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={selectedProject?.status} color={statusColors[selectedProject?.status]} />
              <StatusBadge status={selectedProject?.priority} color={priorityColors[selectedProject?.priority]} size="sm" />
            </div>

            <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <div className="flex -space-x-2 ml-auto">
                {selectedProject?.assignee?.map(user => {
                  // const user = users.find(u => u._id === id);
                  return (
                    <img
                      key={user._id}
                      src={user?.imageUrl}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      title={`${user?.firstName} ${user?.lastName}`}
                      className="w-6 h-6 rounded-full border-2 border-white"
                    />
                  );
                })}
              </div>
              <Calendar className="w-4 h-4 ml-4" />
              <span>{new Date(selectedProject?.dueDate).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              {selectedProject?.attachments.length === 0 && <span>No attachments</span>}
              {selectedProject?.attachments.length > 0 && selectedProject?.attachments.map((attachment) => (
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

            {/* Progress Indicators */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <ProgressCircle percentage={selectedProject?.appProgress} size={50} />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">App</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={selectedProject?.panelProgress} size={50} color="#10b981" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Panel</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={selectedProject?.serverProgress} size={50} color="#f59e0b" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Server</p>
              </div>
              <div className="text-center">
                <ProgressCircle percentage={selectedProject?.overallProgress} size={50} color="#8b5cf6" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall</p>
              </div>
            </div>
          </div>

          <div >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Milestones
            </h4>
            {selectedProject?.milestones?.map((milestone) => (
              <div key={milestone._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-2">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.name}</h4>
                  <StatusBadge status={milestone.status} color={statusColors[milestone.status]} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: milestone?.description }} className="text-sm text-gray-600 dark:text-gray-400 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <ProgressCircle percentage={milestone.progress} size={40} />
                    <div className="text-sm text-gray-600 flex items-center dark:text-gray-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Modal>

      {/* Milestones Modal */}
      <Modal
        isOpen={showClientMilestones}
        onClose={() => setShowClientMilestones(false)}
        title={`Client Milestones - ${selectedProject?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {clientMilestones.map((milestone) => (
            <div key={milestone?._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{milestone?.name}</h4>
                <StatusBadge status={milestone?.status} color={statusColors[milestone.status]} />
              </div>
              <div dangerouslySetInnerHTML={{ __html: milestone?.description }} className="text-sm text-gray-600 dark:text-gray-400 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ProgressCircle percentage={milestone?.progress} size={40} />
                  <div className="text-sm text-gray-600 flex items-center dark:text-gray-400">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due: {new Date(milestone?.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>


      {/* Milestones Modal */}
      <Modal
        isOpen={showMilestones}
        onClose={() => setShowMilestones(false)}
        title={`Milestones - ${selectedProject?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {projectMilestones.map((milestone) => (
            <div key={milestone._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.name}</h4>
                <StatusBadge status={milestone.status} color={statusColors[milestone.status]} />
              </div>
              <div dangerouslySetInnerHTML={{ __html: milestone.description }} className="text-sm text-gray-600 dark:text-gray-400 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ProgressCircle percentage={milestone.progress} size={40} />
                  <div className="text-sm text-gray-600 flex items-center dark:text-gray-400">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Projects;