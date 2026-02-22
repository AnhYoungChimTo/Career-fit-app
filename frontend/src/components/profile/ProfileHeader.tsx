import { useState } from 'react';
import { api } from '../../services/api';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileHeader({ profile, isOwnProfile, isEditing, onEdit, onSave, onCancel }: ProfileHeaderProps) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    headline: profile?.headline || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    linkedIn: profile?.linkedIn || '',
    github: profile?.github || '',
    portfolioUrl: profile?.portfolioUrl || '',
    twitter: profile?.twitter || '',
    visibility: profile?.visibility || 'public',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      const response = await api.post('/profile', formData);
      if (response.success) {
        onSave();
      }
    } catch (err: any) {
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{profile ? 'Edit Profile' : 'Create Your Profile'}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input type="text" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="e.g., Marketing Professional | MBA Candidate"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Ho Chi Minh City, Vietnam"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
          <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4} placeholder="Tell us about yourself, your passions, and career goals..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Social Links</h3>
          <div className="space-y-3">
            <input type="url" value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              placeholder="LinkedIn URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="GitHub URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="url" value={formData.portfolioUrl} onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="Portfolio Website" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
          <select value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="public">Public</option>
            <option value="employers_only">Employers Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} disabled={isSaving}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 text-sm">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
          <button onClick={onCancel}
            className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />

      <div className="px-6 pb-6">
        <div className="flex items-start -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shadow-lg">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={`${profile.firstName} ${profile.lastName}`} className="w-full h-full object-cover rounded-full" />
            ) : (
              `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
            )}
          </div>

          {isOwnProfile && (
            <button onClick={onEdit}
              className="ml-auto mt-12 bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-sm">
              Edit Profile
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
        {profile.headline && <p className="text-gray-600 mt-1">{profile.headline}</p>}
        {profile.location && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {profile.location}
          </p>
        )}

        {profile.bio && <p className="text-gray-700 mt-4 leading-relaxed">{profile.bio}</p>}

        {(profile.linkedIn || profile.github || profile.portfolioUrl) && (
          <div className="flex gap-4 mt-4">
            {profile.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">LinkedIn</a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 text-sm font-medium">GitHub</a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Portfolio</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
