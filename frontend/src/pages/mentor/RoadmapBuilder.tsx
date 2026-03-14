import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SidePanel from '../../components/mentor/SidePanel';
import type { MentorConnection, Roadmap, RoadmapMilestone } from '../../types';

type MilestoneCategory =
  | 'cv_application'
  | 'networking'
  | 'technical'
  | 'interview'
  | 'research'
  | 'other';

const CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  cv_application: 'bg-blue-100 text-blue-700',
  networking: 'bg-purple-100 text-purple-700',
  technical: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-orange-100 text-orange-700',
  research: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  pending_confirmation: 'bg-amber-100 text-amber-700',
  complete: 'bg-green-100 text-green-700',
};

const STATUS_DOT: Record<string, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  pending_confirmation: 'bg-amber-400',
  complete: 'bg-green-500',
};

const CATEGORY_OPTIONS: MilestoneCategory[] = [
  'cv_application',
  'networking',
  'technical',
  'interview',
  'research',
  'other',
];

const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  cv_application: 'CV & Application',
  networking: 'Networking',
  technical: 'Technical',
  interview: 'Interview',
  research: 'Research',
  other: 'Other',
};

interface AddMilestoneForm {
  title: string;
  category: MilestoneCategory;
  description: string;
  dueDate: string;
  phaseLabel: string;
}

const EMPTY_FORM: AddMilestoneForm = {
  title: '',
  category: 'other',
  description: '',
  dueDate: '',
  phaseLabel: '',
};

export default function RoadmapBuilder() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [connection, setConnection] = useState<MentorConnection | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddMilestoneForm>(EMPTY_FORM);
  const [addingMilestone, setAddingMilestone] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  const [expandedDesc, setExpandedDesc] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isMentor = user?.id === connection?.mentor?.userId;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!connectionId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [connRes, roadmapRes] = await Promise.all([
          api.getConnection(connectionId),
          api.getRoadmap(connectionId),
        ]);
        const connData = connRes?.data || connRes;
        const roadmapData = roadmapRes?.data || roadmapRes;
        setConnection(connData);
        setRoadmap(roadmapData);
        const sorted = [...(roadmapData?.milestones || [])].sort(
          (a: RoadmapMilestone, b: RoadmapMilestone) => a.sortOrder - b.sortOrder
        );
        setMilestones(sorted);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [connectionId]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
    }
  }, [editingId]);

  const menteeName =
    connection?.mentee?.name || connection?.mentee?.email || 'Mentee';

  const handleMoveUp = async (index: number) => {
    if (index === 0 || !roadmap) return;
    const updated = [...milestones];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((m, i) => ({ ...m, sortOrder: i + 1 }));
    setMilestones(reordered);
    try {
      await api.reorderMilestones(
        roadmap.id,
        reordered.map((m) => ({ id: m.id, sortOrder: m.sortOrder }))
      );
    } catch {
      showToast('Failed to reorder');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === milestones.length - 1 || !roadmap) return;
    const updated = [...milestones];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((m, i) => ({ ...m, sortOrder: i + 1 }));
    setMilestones(reordered);
    try {
      await api.reorderMilestones(
        roadmap.id,
        reordered.map((m) => ({ id: m.id, sortOrder: m.sortOrder }))
      );
    } catch {
      showToast('Failed to reorder');
    }
  };

  const handleEditTitle = (milestone: RoadmapMilestone) => {
    setEditingId(milestone.id);
    setEditTitle(milestone.title);
  };

  const handleSaveTitle = async (milestoneId: string) => {
    if (!editTitle.trim()) return;
    try {
      await api.updateMilestone(milestoneId, { title: editTitle.trim() });
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, title: editTitle.trim() } : m))
      );
    } catch {
      showToast('Failed to update title');
    }
    setEditingId(null);
  };

  const handleMarkComplete = async (milestoneId: string) => {
    setActionLoading(milestoneId);
    try {
      await api.mentorConfirmMilestone(milestoneId);
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId ? { ...m, mentorConfirmed: true, status: 'pending_confirmation' } : m
        )
      );
      showToast('Milestone marked — awaiting mentee confirmation');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to confirm');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!window.confirm('Delete this milestone?')) return;
    setActionLoading(milestoneId + '_del');
    try {
      await api.deleteMilestone(milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      showToast('Milestone deleted');
    } catch {
      showToast('Failed to delete milestone');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleDesc = (id: string) => {
    setExpandedDesc((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddMilestone = async () => {
    if (!addForm.title.trim() || !roadmap) return;
    setAddingMilestone(true);
    try {
      const payload: any = {
        title: addForm.title.trim(),
        category: addForm.category,
        description: addForm.description.trim() || undefined,
        dueDate: addForm.dueDate || undefined,
        phaseLabel: addForm.phaseLabel.trim() || undefined,
        sortOrder: milestones.length + 1,
      };
      const res = await api.addMilestone(roadmap.id, payload);
      const newMilestone: RoadmapMilestone = res?.data || res;
      setMilestones((prev) => [...prev, newMilestone]);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      showToast('Milestone added');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to add milestone');
    } finally {
      setAddingMilestone(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      <SidePanel activeTab="mentees" onTabChange={() => {}} />

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {menteeName} — Roadmap Builder
              </h1>
              {roadmap?.title && (
                <p className="text-sm text-gray-500">{roadmap.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            + Add Milestone
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center flex-1">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50"
            >
              ← Go Back
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex-1 px-6 py-6">
            <div className="max-w-3xl mx-auto">
              {milestones.length === 0 && !showAddForm && (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-sm mb-4">No milestones yet.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    + Add First Milestone
                  </button>
                </div>
              )}

              {/* Timeline + milestone cards */}
              <div className="flex gap-0">
                {/* Left vertical timeline */}
                {milestones.length > 0 && (
                  <div className="flex flex-col items-center" style={{ width: 40, minWidth: 40 }}>
                    {milestones.map((m, idx) => (
                      <div key={m.id} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full mt-6 flex-shrink-0 ${STATUS_DOT[m.status] || 'bg-gray-400'}`}
                        />
                        {idx < milestones.length - 1 && (
                          <div
                            className="w-0.5 flex-1"
                            style={{
                              backgroundColor: '#E5E7EB',
                              minHeight: 80,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Milestone cards */}
                <div className="flex-1 space-y-4">
                  {milestones.map((milestone, idx) => (
                    <div
                      key={milestone.id}
                      className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5"
                    >
                      {/* Phase label */}
                      {milestone.phaseLabel && (
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          {milestone.phaseLabel}
                        </p>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Drag handle (visual) */}
                        <span className="text-gray-300 cursor-grab mt-1 select-none text-lg">⠿</span>

                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-start gap-2 flex-wrap">
                            {editingId === milestone.id ? (
                              <input
                                ref={editRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={() => handleSaveTitle(milestone.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTitle(milestone.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="flex-1 text-sm font-semibold text-gray-900 border-b border-gray-300 outline-none bg-transparent min-w-0"
                              />
                            ) : (
                              <h3
                                className="text-sm font-semibold text-gray-900 cursor-pointer hover:underline"
                                onClick={() => handleEditTitle(milestone)}
                                title="Click to edit"
                              >
                                {milestone.title}
                              </h3>
                            )}

                            {/* Category badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                CATEGORY_COLORS[milestone.category] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {CATEGORY_LABELS[milestone.category] || milestone.category}
                            </span>

                            {/* Status badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                STATUS_COLORS[milestone.status] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {milestone.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Due date */}
                          {milestone.dueDate && (
                            <p className="text-xs text-gray-400 mt-1">
                              Due:{' '}
                              {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}

                          {/* Description toggle */}
                          {milestone.description && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleDesc(milestone.id)}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {expandedDesc.has(milestone.id)
                                  ? '▲ Hide details'
                                  : '▼ Show details'}
                              </button>
                              {expandedDesc.has(milestone.id) && (
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                  {milestone.description}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {isMentor &&
                              milestone.status !== 'complete' &&
                              milestone.status !== 'pending_confirmation' && (
                                <button
                                  onClick={() => handleMarkComplete(milestone.id)}
                                  disabled={actionLoading === milestone.id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-60"
                                  style={{ backgroundColor: '#4ECDC4' }}
                                >
                                  {actionLoading === milestone.id
                                    ? 'Saving...'
                                    : 'Mark Complete'}
                                </button>
                              )}
                            {milestone.status === 'pending_confirmation' && (
                              <span className="text-xs text-amber-600 font-medium">
                                Awaiting mentee confirmation
                              </span>
                            )}
                            {milestone.status === 'complete' && (
                              <span className="text-xs text-green-600 font-medium">Completed</span>
                            )}
                          </div>
                        </div>

                        {/* Right controls */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                            title="Move up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === milestones.length - 1}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                            title="Move down"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleDelete(milestone.id)}
                            disabled={actionLoading === milestone.id + '_del'}
                            className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors text-sm"
                            title="Delete milestone"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add milestone form */}
              {showAddForm && (
                <div className="mt-4 bg-white rounded-2xl border border-orange-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">New Milestone</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={addForm.title}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="e.g. Update LinkedIn profile"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#FF6B6B' } as any}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Category
                        </label>
                        <select
                          value={addForm.category}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              category: e.target.value as MilestoneCategory,
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={addForm.dueDate}
                          onChange={(e) =>
                            setAddForm((f) => ({ ...f, dueDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Phase Label (optional)
                      </label>
                      <input
                        type="text"
                        value={addForm.phaseLabel}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, phaseLabel: e.target.value }))
                        }
                        placeholder="e.g. Phase 1: Preparation"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={addForm.description}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, description: e.target.value }))
                        }
                        placeholder="Optional details about this milestone..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleAddMilestone}
                        disabled={addingMilestone || !addForm.title.trim()}
                        className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                        style={{ backgroundColor: '#FF6B6B' }}
                      >
                        {addingMilestone ? 'Adding...' : 'Add Milestone'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setAddForm(EMPTY_FORM);
                        }}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
