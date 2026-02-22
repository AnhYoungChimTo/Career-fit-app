import { useState } from 'react';
import { api } from '../../services/api';

interface ExperienceSectionProps {
  experiences: any[];
  isOwnProfile: boolean;
  onUpdate: () => void;
}

const emptyForm = { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };

export default function ExperienceSection({ experiences, isOwnProfile, onUpdate }: ExperienceSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.title || !formData.company || !formData.startDate || !formData.description) {
      setError('Title, company, start date, and description are required');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      await api.post('/profile/experience', formData);
      setFormData(emptyForm);
      setIsAdding(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add experience');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expId: string) => {
    try {
      await api.delete(`/profile/experience/${expId}`);
      onUpdate();
    } catch {
      // ignore
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
        {isOwnProfile && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">+ Add Experience</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Job Title *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company *" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Location" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date *</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={formData.current} onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: '' })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            I currently work here
          </label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your responsibilities and achievements *" rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={isSaving} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button onClick={() => { setIsAdding(false); setFormData(emptyForm); setError(''); }} className="text-gray-600 hover:text-gray-800 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {experiences.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">{isOwnProfile ? 'Add your work experience' : 'No experience listed'}</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="group relative border-l-2 border-indigo-200 pl-4 pb-2">
              {isOwnProfile && (
                <button onClick={() => handleDelete(exp.id)}
                  className="absolute top-0 right-0 hidden group-hover:block text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-sm text-gray-600">{exp.company}{exp.location ? ` - ${exp.location}` : ''}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
