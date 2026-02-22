import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProfileHeader from '../components/profile/ProfileHeader';
import SkillsSection from '../components/profile/SkillsSection';
import ExperienceSection from '../components/profile/ExperienceSection';
import EducationSection from '../components/profile/EducationSection';
import PortfolioSection from '../components/profile/PortfolioSection';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/profile/me');
      if (response.success && response.data) {
        setProfile(response.data);
        setNoProfile(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNoProfile(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No profile yet - show create form
  if (noProfile && !isEditing) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Profile</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Build your professional profile to showcase your skills, experience, and career goals.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Editing mode (create or edit)
  if (isEditing || (noProfile && isEditing)) {
    return (
      <div className="max-w-3xl mx-auto">
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          isEditing={true}
          onEdit={() => {}}
          onSave={() => {
            setIsEditing(false);
            setNoProfile(false);
            loadProfile();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Display profile
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={true}
        isEditing={false}
        onEdit={() => setIsEditing(true)}
        onSave={() => {}}
        onCancel={() => {}}
      />

      <SkillsSection
        skills={profile?.skills || []}
        isOwnProfile={true}
        onUpdate={loadProfile}
      />

      <ExperienceSection
        experiences={profile?.experiences || []}
        isOwnProfile={true}
        onUpdate={loadProfile}
      />

      <EducationSection
        educationRecords={profile?.educationRecords || []}
        isOwnProfile={true}
        onUpdate={loadProfile}
      />

      <PortfolioSection
        portfolioItems={profile?.portfolioItems || []}
        isOwnProfile={true}
        onUpdate={loadProfile}
      />
    </div>
  );
}
