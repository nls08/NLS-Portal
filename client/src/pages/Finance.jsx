import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
  CreditCard,
  Clock,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Trash,
  MessageSquare,
  Lightbulb,
  Star,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
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
import Modal from "../components/ui/Modal";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FinanceManagement() {

  const { fetchFeedbacks, feedbacks } = useApp();

  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // State for data
  const [expenses, setExpenses] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [advances, setAdvances] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    date: "",
    category: "",
    client: "",
    employeeName: "",
    installmentAmount: "",
  });

  const expenseCategories = ["salary", "overhead", "other"];
  const expenseTypes = {
    salary: ["Salaries", "Bonuses", "Benefits", "Overtime"],
    overhead: [
      "Office Rent",
      "Utilities",
      "Insurance",
      "Equipment",
      "Software Licenses",
    ],
    other: ["Marketing", "Travel", "Training", "Miscellaneous"],
  };

  // API Base URL
  const API_BASE = "/api";

  // API Helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API Call Error:", err);
      throw err;
    }
  };

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
    fetchFeedbacks();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [expensesData, earningsData, advancesData] = await Promise.all([
        apiCall("/finance/expenses"),
        apiCall("/earnings/earnings"),
        apiCall("/advance/advances"),
      ]);

      setExpenses(expensesData);
      setEarnings(earningsData);
      setAdvances(advancesData);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Populate formData when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        type: editingItem.type || "",
        amount: editingItem.amount || editingItem.totalAmount || "",
        description: editingItem.description || "",
        date: editingItem.date
          ? new Date(editingItem.date).toISOString().split("T")[0]
          : editingItem.dateGiven
            ? new Date(editingItem.dateGiven).toISOString().split("T")[0]
            : "",
        category: editingItem.category || "",
        client: editingItem.client || "",
        employeeName: editingItem.employeeName || "",
        installmentAmount: editingItem.installmentAmount || "",
      });
    } else {
      setFormData({
        type: "",
        amount: "",
        description: "",
        date: "",
        category: "",
        client: "",
        employeeName: "",
        installmentAmount: "",
      });
    }
  }, [editingItem]);

  const handleSubmit = async () => {
    if (!formData.amount) {
      setError("Amount is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let endpoint;
      let method;
      let payload;

      if (formType === "expense") {
        if (!formData.type || !formData.category) {
          setError("Type and category are required for expenses");
          return;
        }

        payload = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date || new Date().toISOString().split("T")[0],
          category: formData.category,
        };

        if (editingItem) {
          endpoint = `/finance/expenses/${editingItem._id}`;
          method = "PUT";
        } else {
          endpoint = "/finance/expenses";
          method = "POST";
        }
      } else if (formType === "earning") {
        if (!formData.type) {
          setError("Type is required for earnings");
          return;
        }

        payload = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date || new Date().toISOString().split("T")[0],
          client: formData.client,
        };

        if (editingItem) {
          endpoint = `/earnings/earnings/${editingItem._id}`;
          method = "PUT";
        } else {
          endpoint = "/earnings/earnings";
          method = "POST";
        }
      } else if (formType === "advance") {
        if (!formData.employeeName || !formData.installmentAmount) {
          setError("Employee name and installment amount are required for advances");
          return;
        }

        payload = {
          employeeName: formData.employeeName,
          totalAmount: parseFloat(formData.amount),
          amountPaid: editingItem ? editingItem.amountPaid : 0,
          dateGiven: formData.date || new Date().toISOString().split("T")[0],
          installmentAmount: parseFloat(formData.installmentAmount),
          nextDueDate: editingItem
            ? editingItem.nextDueDate
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          status: editingItem ? editingItem.status : "Active",
          payments: editingItem ? editingItem.payments : [],
        };

        if (editingItem) {
          endpoint = `/advance/advances/${editingItem._id}`;
          method = "PUT";
        } else {
          endpoint = "/advance/advances";
          method = "POST";
        }
      }

      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (editingItem) {
        if (formType === "expense") {
          setExpenses(
            expenses.map((item) =>
              item._id === editingItem._id ? response : item
            )
          );
          toast.success("Expense updated successfully");
        } else if (formType === "earning") {
          setEarnings(
            earnings.map((item) =>
              item._id === editingItem._id ? response : item
            )
          );
          toast.success("Earning updated successfully");
        } else if (formType === "advance") {
          setAdvances(
            advances.map((item) =>
              item._id === editingItem._id ? response : item
            )
          );
          toast.success("Advance updated successfully");
        }
        setEditingItem(null);
      } else {
        if (formType === "expense") {
          setExpenses([response, ...expenses]);
          toast.success("Expense saved successfully");
        } else if (formType === "earning") {
          setEarnings([response, ...earnings]);
          toast.success("Earning saved successfully");
        } else if (formType === "advance") {
          setAdvances([response, ...advances]);
          toast.success("Advance saved successfully");
        }
      }

      setFormData({
        type: "",
        amount: "",
        description: "",
        date: "",
        category: "",
        client: "",
        employeeName: "",
        installmentAmount: "",
      });
      setShowForm(false);
      toast.success(response.data?.message);
    } catch (err) {
      setError(editingItem ? "Failed to update data" : "Failed to save data");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    setLoading(true);
    try {
      let endpoint;
      if (type === "expense") {
        endpoint = `/finance/expenses/${id}`;
        await apiCall(endpoint, { method: "DELETE" });
        setExpenses(expenses.filter((item) => item._id !== id));
        toast.success("Expense deleted successfully");
      } else if (type === "earning") {
        endpoint = `/earnings/earnings/${id}`;
        await apiCall(endpoint, { method: "DELETE" });
        setEarnings(earnings.filter((item) => item._id !== id));
        toast.success("Earning deleted successfully");
      } else if (type === "advance") {
        endpoint = `/advance/advances/${id}`;
        await apiCall(endpoint, { method: "DELETE" });
        setAdvances(advances.filter((item) => item._id !== id));
        toast.success("Advance deleted successfully");
      }
      setError("");
    } catch (err) {
      setError("Failed to delete item");
      console.error("Delete error:", err);
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEarnings = earnings.reduce((sum, earn) => sum + earn.amount, 0);
  const totalAdvances = advances.reduce(
    (sum, adv) => sum + (adv.totalAmount - adv.amountPaid),
    0
  );
  const netProfit = totalEarnings - totalExpenses;

  const ExpensesByCategory = () => {
    const salaryExpenses = expenses
      .filter((e) => e.category === "salary")
      .reduce((sum, e) => sum + e.amount, 0);
    const overheadExpenses = expenses
      .filter((e) => e.category === "overhead")
      .reduce((sum, e) => sum + e.amount, 0);
    const otherExpenses = expenses
      .filter((e) => e.category === "other")
      .reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <h4 className="text-red-400 font-medium mb-2">Salary Expenses</h4>
          <p className="text-2xl font-bold text-white">
            PKR {salaryExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <h4 className="text-orange-400 font-medium mb-2">
            Overhead Expenses
          </h4>
          <p className="text-2xl font-bold text-white">
            PKR {overheadExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium mb-2">Other Expenses</h4>
          <p className="text-2xl font-bold text-white">
            PKR {otherExpenses.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`Finance ${editingItem ? "Update" : "Add"}`}
      >
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 capitalize">
            {editingItem ? "Edit" : "Add New"} {formType}
          </h3>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {formType === "expense" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        type: "",
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expense Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">Select Type</option>
                      {expenseTypes[formData.category]?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {formType === "earning" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Earning Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select Type</option>
                    <option value="Project Milestone">Project Milestone</option>
                    <option value="Monthly Retainer">Monthly Retainer</option>
                    <option value="Consultation Fee">Consultation Fee</option>
                    <option value="Product Sale">Product Sale</option>
                    <option value="Other Income">Other Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter client name"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {formType === "advance" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeName: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter employee name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monthly Installment Amount
                  </label>
                  <input
                    type="number"
                    value={formData.installmentAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        installmentAmount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter installment amount"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (PKR)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>

            {formType !== "advance" && <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter description"
                disabled={loading}
              />
            </div>}

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingItem
                    ? "Update"
                    : `Add ${formType}`}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setError("");
                }}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  if (loading && (!expenses.length && !earnings.length && !advances.length)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-lg">Loading finance data...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = status => {
    switch (status) {
      case 'Submitted': return 'bg-blue-600';
      case 'Under Review': return 'bg-yellow-600';
      case 'In Progress': return 'bg-purple-600';
      case 'Acknowledged': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };


  const getRatingStars = rating =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
        }
      />
    ));

  const handleFeedbackDelete = async id => {
    try {
      await axios.delete(`/api/feedbacks/${id}`);
      // remove deleted feedback
      // setFeedbacks(prev => prev.filter(f => f._id !== id));
      await fetchFeedbacks();
      toast.success('Feedback deleted successfully!');
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  const handleFeedbackUpdate = async (id, updates) => {
    try {
      const response = await axios.put(`/api/feedbacks/${id}`, updates);
      // update in place
      // setFeedbacks(prev => prev.map(f => (f._id === id ? response.data : f)));
      await fetchFeedbacks();
      toast.success('Feedback updated successfully!');
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Finance Management
          </h1>
          <p className="text-gray-400 mt-2">
            Track expenses, earnings, and employee advances
          </p>
        </div>

        {/* Global Error */}
        {error && activeTab === "overview" && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadAllData}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">
                  PKR {totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Earnings</p>
              </div>
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold">
                  PKR {totalExpenses.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Expenses</p>
              </div>
            </div>
          </div>
          <div
            className={`${netProfit >= 0
              ? "bg-green-900/20 border-green-700"
              : "bg-red-900/20 border-red-700"
              } border rounded-lg p-6`}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">
                  PKR {netProfit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Net Profit</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">
                  PKR {totalAdvances.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Outstanding Advances</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["overview", "expenses", "earnings", "advances", "feedbacks"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 capitalize ${activeTab === tab
                ? "bg-gradient-to-r from-purple-500 to-blue-500"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add New Button */}
        {activeTab !== "overview" && activeTab !== "feedbacks" && (
          <div className="mb-6">
            <button
              onClick={() => {
                setFormType(activeTab.slice(0, -1));
                setEditingItem(null);
                setShowForm(true);
                setError("");
              }}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={20} />
              Add New {activeTab.slice(0, -1)}
            </button>
          </div>
        )}

        {/* Forms */}
        {renderForm()}

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div>
            <ExpensesByCategory />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div
                      key={expense._id}
                      className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{expense.type}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-red-400 font-bold">
                        -PKR {expense.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      No expenses yet
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Earnings</h3>
                <div className="space-y-3">
                  {earnings.slice(0, 5).map((earning) => (
                    <div
                      key={earning._id}
                      className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{earning.type}</p>
                        <p className="text-sm text-gray-400">
                          {earning.client} •{" "}
                          {new Date(earning.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-green-400 font-bold">
                        +PKR {earning.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {earnings.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      No earnings yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">All Expenses</h2>
              <ExpensesByCategory />
            </div>
            <div className="divide-y divide-gray-700">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="p-6 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{expense.type}</h3>
                    <p className="text-gray-400 mt-1">{expense.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(expense.date).toLocaleDateString()} •{" "}
                      {expense.category}
                    </p>
                  </div>
                  <div className="text-right flex items-center justify-center gap-4">
                    <p className="text-2xl font-bold text-red-400">
                      PKR {expense.amount.toLocaleString()}
                    </p>
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem({ ...expense, type: "expense" });
                          setFormType("expense");
                          setShowForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ id: expense._id, type: "expense" });
                          setShowConfirmModal(true);
                        }}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-6 text-center text-gray-400">
                  No expenses found. Add your first expense to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">All Earnings</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {earnings.map((earning) => (
                <div
                  key={earning._id}
                  className="p-6 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{earning.type}</h3>
                    <p className="text-gray-400 mt-1">{earning.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {earning.client} •{" "}
                      {new Date(earning.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-2xl font-bold text-green-400">
                      PKR {earning.amount.toLocaleString()}
                    </p>
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem({ ...earning, type: "earning" });
                          setFormType("earning");
                          setShowForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ id: earning._id, type: "earning" });
                          setShowConfirmModal(true);
                        }}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {earnings.length === 0 && (
                <div className="p-6 text-center text-gray-400">
                  No earnings found. Add your first earning to get started.
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === "advances" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Employee Advances</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {advances.map((advance) => (
                <div key={advance._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {advance.employeeName}
                      </h3>
                      <p className="text-gray-400 mt-1">
                        Advance given on {new Date(advance.dateGiven).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${advance.status === "Active"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                            }`}
                        >
                          {advance.status}
                        </span>
                        {advance.nextDueDate && (
                          <span className="text-sm text-gray-400 flex justify-center items-center">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Next due: {advance.nextDueDate
                              ? new Date(advance.nextDueDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="">
                        <p className="text-2xl font-bold">
                          PKR {advance.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">Total Amount</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem({ ...advance, type: "advance" });
                            setFormType("advance");
                            setShowForm(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete({ id: advance._id, type: "advance" });
                            setShowConfirmModal(true);
                          }}
                          disabled={loading}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Amount Paid</p>
                      <p className="text-lg font-bold text-green-400">
                        PKR {advance.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Remaining</p>
                      <p className="text-lg font-bold text-red-400">
                        PKR{" "}
                        {(
                          advance.totalAmount - advance.amountPaid
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">
                        Monthly Installment
                      </p>
                      <p className="text-lg font-bold">
                        PKR {advance.installmentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(advance.amountPaid / advance.totalAmount) * 100
                                }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {Math.round(
                            (advance.amountPaid / advance.totalAmount) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {advance.payments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Payment History</h4>
                      <div className="space-y-2">
                        {advance.payments.map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-700 rounded-lg p-3"
                          >
                            <span className="text-sm text-gray-400">
                              {payment.date}
                            </span>
                            <span className="font-medium text-green-400">
                              PKR {payment.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}



        {activeTab === "feedbacks" && (
          <div className="divide-y divide-gray-700">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200">
                        {feedback.category}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {getRatingStars(feedback.rating)}
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {feedback.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      {/* <Lightbulb size={16} className="text-yellow-400" /> */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          feedback.status
                        )} text-white`}
                      >
                        {feedback.status}
                      </span>
                      <select className="dark:bg-gray-800 bg-gray-300 text-gray-600 dark:text-gray-300 border border-gray-600 rounded-md py-1 px-2"
                        name="status" onChange={(e) => handleFeedbackUpdate(feedback._id, { status: e.target.value })}>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Acknowledged">Acknowledged</option>
                      </select>
                    </div>
                    {/* <button onClick={() => handleFeedbackDelete(feedback._id)}>
                      <Trash size={16} className="text-red-500" />
                    </button> */}
                    <AlertDialog className="dark:bg-gray-800">
                      <AlertDialogTrigger className="text-red-500 hover:bg-red-300/20 px-2 py-2 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 focus:ring-red-600" onClick={() => handleFeedbackDelete(feedback._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="ml-13">
                  <p className="text-gray-300 mb-3 leading-relaxed">
                    {feedback.feedback}
                  </p>
                  {feedback.suggestions && (
                    <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">
                          Suggestion
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {feedback.suggestions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={() => {
          handleDelete(itemToDelete.id, itemToDelete.type);
          setShowConfirmModal(false);
        }}
        onCancel={() => setShowConfirmModal(false)}
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
}