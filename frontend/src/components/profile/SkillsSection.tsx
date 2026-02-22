import { useState } from 'react';
import { api } from '../../services/api';

interface SkillsSectionProps {
  skills: any[];
  isOwnProfile: boolean;
  onUpdate: () => void;
}

const LEVEL_CONFIG: Record<string, { stars: number; color: string; label: string }> = {
  beginner: { stars: 1, color: 'bg-gray-100 text-gray-800', label: 'Beginner' },
  intermediate: { stars: 2, color: 'bg-blue-100 text-blue-800', label: 'Intermediate' },
  advanced: { stars: 3, color: 'bg-indigo-100 text-indigo-800', label: 'Advanced' },
  expert: { stars: 4, color: 'bg-purple-100 text-purple-800', label: 'Expert' },
};

export default function SkillsSection({ skills, isOwnProfile, onUpdate }: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!newSkill.name.trim()) return;
    try {
      setError('');
      await api.post('/profile/skills', newSkill);
      setNewSkill({ name: '', level: 'beginner' });
      setIsAdding(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add skill');
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await api.delete(`/profile/skills/${skillId}`);
      onUpdate();
    } catch {
      // ignore
    }
  };

  const cfg = (level: string) => LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
        {isOwnProfile && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">+ Add Skill</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <div className="flex gap-3">
            <input type="text" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="Skill name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            <select value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleAdd} disabled={!newSkill.name.trim()} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">Add</button>
            <button onClick={() => { setIsAdding(false); setError(''); }} className="text-gray-600 hover:text-gray-800 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">{isOwnProfile ? 'Add skills to showcase your expertise' : 'No skills listed'}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill.id} className="group flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <span className="text-sm font-medium text-gray-900">{skill.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg(skill.level).color}`}>
                {cfg(skill.level).label}
              </span>
              {skill.verified && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {isOwnProfile && (
                <button onClick={() => handleDelete(skill.id)} className="hidden group-hover:block text-red-400 hover:text-red-600 ml-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
