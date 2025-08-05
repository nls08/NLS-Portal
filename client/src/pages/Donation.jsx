import React, { useEffect, useState } from "react";
import { Heart, Users, Calendar, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import Modal from "../components/ui/Modal";
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
import donate1 from "../Assets/img/donate1.jpg";
import donate2 from "../Assets/img/donate2.jpg";
import donate3 from "../Assets/img/donate3.jpg";
import donate4 from "../Assets/img/donate4.jpg";
import donate5 from "../Assets/img/donate5.jpg";

const donateImages = [donate1, donate2, donate3, donate4, donate5];

export default function SimpleDonationSystem() {
  const { getToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    isAnonymous: false,
  });
  const [causes, setCauses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const getAllDonations = async () => {
    const token = await getToken();
    try {
      const response = await axios.get('/api/donations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCauses(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const token = await getToken();
    try {
      if (editingId) {
        await axios.put(
          `/api/donations/${editingId}`,
          { amount: Number(formData.amount), isAnonymous: formData.isAnonymous },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Donation updated");
      } else {
        await axios.post(
          '/api/donations',
          { amount: Number(formData.amount), isAnonymous: formData.isAnonymous },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Donated successfully");
      }
      await getAllDonations();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleEdit = (cause) => {
    setEditingId(cause._id);
    setFormData({ amount: cause.amount, isAnonymous: cause.isAnonymous });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this donation?")) return;
    const token = await getToken();
    try {
      await axios.delete(`/api/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Donation deleted");
      setCauses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setFormData({ amount: "", isAnonymous: false });
    setEditingId(null);
    setShowForm(false);
  };

  useEffect(() => {
    getAllDonations();
  }, [getToken]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Charity Donation</h1>
          <p className="text-white">Help make a difference today</p>
        </div>

        {/* Donation Form Modal */}
        {showForm && (
          <Modal
            isOpen={showForm}
            onClose={resetForm}
            title={editingId ? "Edit Donation" : "Make a Donation"}
            size="lg"
          >
            <div className="bg-white dark:bg-gray-800 card rounded-lg shadow p-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full border-gray-300 dark:bg-gray-700 dark:text-white rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData({ ...formData, isAnonymous: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm dark:text-white text-gray-700">
                    Donate Anonymously
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.amount || Number(formData.amount) <= 0}
                    className={`px-4 py-2 rounded-lg text-white ${formData.amount && Number(formData.amount) > 0
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {editingId ? 'Update' : 'Donate'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Donations List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Donations</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              {editingId ? 'Edit Donation' : 'Donate'}
            </button>
          </div>
          {causes.map((cause, index) => (
            <div
              key={cause._id}
              className="dark:bg-gray-800 bg-white rounded-lg shadow-lg border border-gray-600 p-6 flex flex-col md:flex-row gap-4"
            >
              <div className="md:w-1/3">
                <img src={donateImages[index % 5]} alt="" />
              </div>
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Donated Amount</p>
                    <span className="text-lg font-bold dark:text-white">
                      Thanks {cause?.user.firstName} {cause?.user.lastName} for donating
                    </span>
                    <p className="text-lg font-bold text-blue-600">
                      PKR {cause.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cause)}
                    className="text-blue-400 hover:text-blue-300 text-sm mr-2"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(cause._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button> */}
                  <AlertDialog className="dark:bg-gray-800">
                    <AlertDialogTrigger className="text-red-500 hover:bg-red-300/20 px-2 py-2 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your Donation
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          onClick={() => handleDelete(cause._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
