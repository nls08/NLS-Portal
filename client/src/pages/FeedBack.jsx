import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Shield,
  Star,
  AlertCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { useAuth } from '@clerk/clerk-react';
import axios from "axios";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext"
import Modal from "../components/ui/Modal";

export default function AnonymousFeedback() {

  const { getToken } = useAuth();
  const { fetchFeedbacks, feedbacks } = useApp();
  // const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    rating: 5,
    feedback: '',
    suggestions: '',
  });

  const categories = [
    'Work Environment',
    'Management',
    'Work-Life Balance',
    'Career Development',
    'Team Collaboration',
    'Company Culture',
    'Benefits & Compensation',
    'Other',
  ];

  // Create an Axios instance with interceptor for Clerk token
  const api = axios.create({ baseURL: '/api/feedbacks' });
  api.interceptors.request.use(async config => {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async () => {
    if (!formData.category || !formData.feedback.trim()) return;
    try {
      const response = await api.post('/', formData);
      // prepend new feedback
      // setFeedbacks(prev => [response.data, ...prev]);
      await fetchFeedbacks();
      setFormData({ category: '', rating: 5, feedback: '', suggestions: '' });
      setShowForm(false);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error creating feedback:', err);
    }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/${id}`);
      // remove deleted feedback
      // setFeedbacks(prev => prev.filter(f => f._id !== id));
      await fetchFeedbacks();
      toast.success('Feedback deleted successfully!');
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const response = await api.put(`/${id}`, updates);
      // update in place
      // setFeedbacks(prev => prev.map(f => (f._id === id ? response.data : f)));
      await fetchFeedbacks();
      toast.success('Feedback updated successfully!');
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

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



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Anonymous Feedback
          </h1>
          <p className="text-gray-400 mt-2">
            Share your thoughts safely and help improve our workplace
          </p>
        </div>
        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{feedbacks.length}</p>
                <p className="text-sm text-gray-400">Total Feedbacks</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    feedbacks.filter(
                      (f) =>
                        f.status === "Under Review" ||
                        f.status === "In Progress"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-400">Pending Review</p>
              </div>
            </div>
          </div>
        </div>
        {/* Add Feedback Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                     px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <MessageSquare size={20} />
            {showForm ? "Cancel" : "Submit New Feedback"}
          </button>
        </div>

        {/* Feedback Form */}
        {showForm && (
          <Modal
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            title={`Feedback`}
            size="lg">
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  100% Anonymous & Confidential
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-colors duration-200"
                      >
                        <Star
                          size={24}
                          className={
                            star <= formData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-600 hover:text-gray-400"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-400">
                      ({formData.rating}/5)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) =>
                      setFormData({ ...formData, feedback: e.target.value })
                    }
                    placeholder="Share your thoughts, concerns, or experiences..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Suggestions for Improvement (Optional)
                  </label>
                  <textarea
                    value={formData.suggestions}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestions: e.target.value })
                    }
                    placeholder="Any ideas or suggestions to make things better?"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                         px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Send size={20} />
                  Submit Feedback
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* All Feedbacks Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Feedbacks</h2>
            <span className="text-sm text-gray-400">
              {feedbacks.length} Total
            </span>
          </div>

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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      feedback.status
                    )} text-white`}
                  >
                    {feedback.status}
                  </span>
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
        </div>
      </div>
    </div>
  );
}
