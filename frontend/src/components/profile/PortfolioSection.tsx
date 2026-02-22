import { useState } from 'react';
import { api } from '../../services/api';

interface PortfolioSectionProps {
  portfolioItems: any[];
  isOwnProfile: boolean;
  onUpdate: () => void;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  project: { color: 'bg-blue-100 text-blue-800', icon: 'Project' },
  certificate: { color: 'bg-green-100 text-green-800', icon: 'Certificate' },
  publication: { color: 'bg-purple-100 text-purple-800', icon: 'Publication' },
  award: { color: 'bg-yellow-100 text-yellow-800', icon: 'Award' },
};

const emptyForm = { title: '', description: '', type: 'project', url: '', skills: '' };

export default function PortfolioSection({ portfolioItems, isOwnProfile, onUpdate }: PortfolioSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.title || !formData.description || !formData.type) {
      setError('Title, description, and type are required');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      await api.post('/profile/portfolio', {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.url || undefined,
        skills: skillsArray,
      });
      setFormData(emptyForm);
      setIsAdding(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add portfolio item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/profile/portfolio/${itemId}`);
      onUpdate();
    } catch {
      // ignore
    }
  };

  const cfg = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.project;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
        {isOwnProfile && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">+ Add Item</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title *" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description *" rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="project">Project</option>
              <option value="certificate">Certificate</option>
              <option value="publication">Publication</option>
              <option value="award">Award</option>
            </select>
            <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="URL (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="Skills used (comma-separated, e.g., React, TypeScript, Design)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={isSaving} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button onClick={() => { setIsAdding(false); setFormData(emptyForm); setError(''); }} className="text-gray-600 hover:text-gray-800 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {portfolioItems.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">{isOwnProfile ? 'Showcase your projects, certificates, and achievements' : 'No portfolio items'}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <div key={item.id} className="group relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {isOwnProfile && (
                <button onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 hidden group-hover:block text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg(item.type).color}`}>
                  {cfg(item.type).icon}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              {Array.isArray(item.skills) && item.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(item.skills as string[]).map((skill, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{skill}</span>
                  ))}
                </div>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm mt-2 font-medium">
                  View
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
