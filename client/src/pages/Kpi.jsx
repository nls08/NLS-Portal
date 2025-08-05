
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import { useState, useEffect } from "react";
import { Plus, Calendar, Edit2, Trash2, Save, X, File } from "lucide-react";
import 'react-quill/dist/quill.snow.css';
import { useApp } from "../context/AppContext";

const Kpi = () => {
    const { getToken } = useAuth();

    const { users, profileRole } = useApp();

    const [showKpi, setShowKpi] = useState(false)

    const [kpis, setKpis] = useState([]);
    const [value, setValue] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    // const [profileRole, setProfileRole] = useState("")

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

    // Fetch all KPIs
    const fetchKpis = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await axios.get("/api/kpi", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            setKpis(data);
        } catch (error) {
            console.error("Error fetching KPIs", error);
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Create new KPI
    const handleSubmit = async () => {
        if (!value.trim()) return toast.error("Content is required");

        try {
            setCreateLoading(true);
            const token = await getToken();
            await axios.post(`/api/kpi/create-kpi`, { content: value }, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            setValue("");
            await fetchKpis();
            toast.success("KPI created successfully");
        } catch (error) {
            console.error("Error creating KPI", error);
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setCreateLoading(false);
        }
    };

    // Update KPI
    const handleUpdate = async (id) => {
        if (!editingContent.trim()) return toast.error("Content is required");

        try {
            const token = await getToken();
            await axios.put(`/api/kpi/${id}`, { content: editingContent }, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            setEditingId(null);
            setEditingContent("");
            await fetchKpis();
            toast.success("KPI updated successfully");
        } catch (error) {
            console.error("Error updating KPI", error);
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    // Delete KPI
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this KPI?")) return;

        try {
            const token = await getToken();
            await axios.delete(`/api/kpi/${id}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            await fetchKpis();
            toast.success("KPI deleted successfully");
        } catch (error) {
            console.error("Error deleting KPI", error);
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    // Start editing
    const startEdit = (kpi) => {
        setEditingId(kpi._id);
        setEditingContent(kpi.content);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null);
        setEditingContent("");
    };

    useEffect(() => {
        fetchKpis();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                {(profileRole === "super-admin" || profileRole === "admin") && (
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-600 dark:text-gray-100 mb-2">
                            KPI Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-100 text-lg">Create, manage, and track your key performance indicators</p>
                        <button
                            onClick={() => setShowKpi(prev => !prev)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform mt-5"
                        >
                            Add New KPI
                        </button>
                    </div>
                )}

                {/* Create New KPI Form */}
                {(profileRole === "super-admin" || profileRole === "admin") && showKpi && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                Add New KPI
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <ReactQuill
                                    theme="snow"
                                    value={value}
                                    onChange={setValue}
                                    modules={modules}
                                    placeholder="Write your KPI content..."
                                    className="input-field border-none p-0"
                                // style={{ minHeight: '200px' }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={createLoading}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform"
                                >
                                    {createLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Create KPI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPIs List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All KPIs</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-100">
                            {kpis.length} {kpis.length === 1 ? 'KPI' : 'KPIs'} found
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-100">Loading KPIs...</span>
                        </div>
                    ) : kpis.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <File className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No KPIs found</h4>
                            {(profileRole === "super-admin" || profileRole === "admin") && (<p className="text-gray-500 dark:text-gray-100">Create your first KPI to get started.</p>)}
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {kpis.map((kpi) => (
                                <div
                                    key={kpi._id}
                                    className="bg-white dark:text-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform"
                                >
                                    <div className="p-6">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center text-sm dark:text-white text-gray-500">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {kpi.createdAt && new Date(kpi.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            {kpi.createdAt !== kpi.updatedAt && (
                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                    Updated
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        {editingId === kpi._id ? (
                                            (profileRole === "super-admin" || profileRole === "admin") && (
                                                <div className="space-y-4">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={editingContent}
                                                        onChange={setEditingContent}
                                                        modules={modules}
                                                        className="input-field border-none p-0"
                                                    // style={{ minHeight: '150px' }}
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleUpdate(kpi._id)}
                                                            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                        >
                                                            <Save className="w-4 h-4 mr-1" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <>
                                                <div
                                                    className="prose prose-sm max-w-none mb-4"
                                                    dangerouslySetInnerHTML={{ __html: kpi.content }}
                                                />

                                                {/* Action Buttons */}
                                                {(profileRole === "super-admin" || profileRole === "admin") && (
                                                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                                                        <button
                                                            onClick={() => startEdit(kpi)}
                                                            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                        >
                                                            <Edit2 className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(kpi._id)}
                                                            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Kpi;