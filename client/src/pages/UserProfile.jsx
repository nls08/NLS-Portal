import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { Save, Palette, User as UserIcon, Mail, Phone, MapPin, Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user: clerkUser } = useUser();
  const { theme, setTheme, themes } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    location:  '',
    bio:       '',
    role:      ''
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const resp = await axios.get('/api/users/profile');
        const { profile } = resp.data;
        setProfileData({
          firstName: profile.firstName || '',
          lastName:  profile.lastName  || '',
          email:     clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          phone:     profile.phone     || '',
          location:  profile.location  || '',
          bio:       profile.bio       || '',
          role:      profile.role      || clerkUser?.publicMetadata?.role || ''
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [clerkUser]);

  // Save updates
  const handleSave = async () => {
    try {
      const payload = {
        firstName: profileData.firstName,
        lastName:  profileData.lastName,
        phone:     profileData.phone,
        location:  profileData.location,
        bio:       profileData.bio,
        role:      profileData.role
      };
      const resp = await axios.put('/api/users/update-profile', payload);
      setProfileData(prev => ({ ...prev, ...resp.data.profile }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="animate-spin text-white" size={50} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center space-x-4">
              <img
                src={clerkUser?.imageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clerkUser?.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profileData.role}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {/* First + Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['firstName','lastName'].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      {field === 'firstName' ? 'First Name' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      value={profileData[field]}
                      disabled={!isEditing}
                      onChange={e => setProfileData({
                        ...profileData,
                        [field]: e.target.value
                      })}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="input-field opacity-50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email is managed by your auth provider.
                </p>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled={!isEditing}
                    onChange={e => setProfileData({
                      ...profileData,
                      phone: e.target.value
                    })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    disabled={!isEditing}
                    onChange={e => setProfileData({
                      ...profileData,
                      location: e.target.value
                    })}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  disabled={!isEditing}
                  onChange={e => setProfileData({
                    ...profileData,
                    bio: e.target.value
                  })}
                  className="input-field"
                  placeholder="Tell us about yourself…"
                />
              </div>

              {/* Save / Cancel */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme Settings & Account Stats */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="card space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme Settings
              </h3>
            </div>
            <div className="space-y-3">
              {themes.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    toast.success(`Theme changed to ${opt.name}!`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                    theme === opt.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: opt.primary }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {opt.name}
                    </span>
                  </div>
                  {theme === opt.id && <div className="w-2 h-2 bg-primary-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Account Statistics */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {clerkUser?.createdAt
                    ? new Date(clerkUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last login</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {clerkUser?.lastSignInAt
                    ? new Date(clerkUser.lastSignInAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profileData.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
