import { useState } from 'react';
import { api } from '../../services/api';

interface EducationSectionProps {
  educationRecords: any[];
  isOwnProfile: boolean;
  onUpdate: () => void;
}

const emptyForm = { degree: '', institution: '', major: '', graduationYear: '', description: '' };

export default function EducationSection({ educationRecords, isOwnProfile, onUpdate }: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.degree || !formData.institution || !formData.graduationYear) {
      setError('Degree, institution, and graduation year are required');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      await api.post('/profile/education', formData);
      setFormData(emptyForm);
      setIsAdding(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add education');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (eduId: string) => {
    try {
      await api.delete(`/profile/education/${eduId}`);
      onUpdate();
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Education</h2>
        {isOwnProfile && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">+ Add Education</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="Degree (e.g., Bachelor of Arts) *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Institution *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="Major / Field of Study" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" value={formData.graduationYear} onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              placeholder="Graduation Year (e.g., 2024) *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details (honors, activities, etc.)" rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={isSaving} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button onClick={() => { setIsAdding(false); setFormData(emptyForm); setError(''); }} className="text-gray-600 hover:text-gray-800 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {educationRecords.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">{isOwnProfile ? 'Add your education' : 'No education listed'}</p>
      ) : (
        <div className="space-y-4">
          {educationRecords.map((edu) => (
            <div key={edu.id} className="group relative flex gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex-1">
                {isOwnProfile && (
                  <button onClick={() => handleDelete(edu.id)}
                    className="absolute top-0 right-0 hidden group-hover:block text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <h3 className="font-semibold text-gray-900">{edu.degree}{edu.major ? ` in ${edu.major}` : ''}</h3>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-400">{edu.graduationYear}</p>
                {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
