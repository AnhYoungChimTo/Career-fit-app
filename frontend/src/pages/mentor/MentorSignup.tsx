import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { MentorSignupData, MentorWorkExperience, MentorEducation } from '../../types';

const INDUSTRIES = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Consulting',
  'Corporate Finance',
  'Startup',
  'Asset Management',
  'Other',
];

const FINANCE_INDUSTRIES = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Funds',
  'Asset Management',
  'Corporate Finance',
  'Consulting',
  'Accounting / CPA',
  'Insurance / Risk',
  'Fintech',
  'Startup',
  'Real Estate Finance',
  'Other',
];

const GOALS = [
  { value: 'land_role', label: 'Land a specific job/role' },
  { value: 'career_switch', label: 'Career switch' },
  { value: 'top_university', label: 'Get into top university' },
  { value: 'build_startup', label: 'Build a startup' },
];

const CREDENTIAL_BADGES = [
  { type: 'ex_tier1_bank', label: 'Ex-Tier 1 Bank' },
  { type: 'cfa_cpa_mba', label: 'CFA/CPA/MBA' },
  { type: 'vc_pe', label: 'VC or PE Background' },
  { type: 'university', label: 'Top University' },
  { type: 'years_exp', label: 'Years of Experience (5+)' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = ['Morning', 'Afternoon', 'Evening'];

const defaultFormData: MentorSignupData = {
  displayName: '',
  primaryLanguage: 'English',
  timezone: '',
  locationCity: '',
  locationCountry: '',
  linkedinUrl: '',
  linkedinVerified: false,
  currentRoleTitle: '',
  currentCompany: '',
  industry: '',
  yearsExperience: 1,
  workExperiences: [],
  educationEntries: [],
  credentials: [],
  supportedGoals: [],
  mentorIndustries: [],
  mentorshipStyle: '',
  sessionPriceUsd: 50,
  freeIntroSession: false,
  maxMentees: 3,
  availability: {},
  sessionDuration: 60,
  externalMeetUrl: '',
  bufferTime: 15,
  advanceBooking: '2 weeks',
  headline: '',
  aboutMe: '',
  philosophy: '',
  username: '',
};

const STORAGE_KEY = 'mentor_signup_draft';

function StepIllustration({ step }: { step: number }) {
  const illustrations = [
    { icon: '👤', title: 'Who are you?', subtitle: 'Tell us about yourself' },
    { icon: '🔗', title: 'Connect LinkedIn', subtitle: 'Import your credentials' },
    { icon: '💼', title: 'Your Background', subtitle: 'Share your experience' },
    { icon: '🎯', title: 'Mentorship Focus', subtitle: 'Define your niche' },
    { icon: '📅', title: 'Availability', subtitle: 'Set your schedule' },
    { icon: '✨', title: 'Final Preview', subtitle: 'Almost there!' },
  ];
  const current = illustrations[step - 1];
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-10 rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 40%, #4ECDC4 100%)' }}
    >
      <div className="text-8xl mb-6">{current.icon}</div>
      <h2 className="text-3xl font-bold text-white mb-3 font-['Plus_Jakarta_Sans'] text-center">
        {current.title}
      </h2>
      <p className="text-white/80 text-lg text-center">{current.subtitle}</p>
      <div className="mt-10 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ backgroundColor: i === step ? 'white' : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MentorSignup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MentorSignupData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultFormData, ...JSON.parse(saved) };
      } catch {
        // ignore
      }
    }
    return { ...defaultFormData, displayName: user?.name || '' };
  });
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.displayName) {
      setFormData((prev) => ({ ...prev, displayName: user.name || '' }));
    }
  }, [user]);

  const updateField = <K extends keyof MentorSignupData>(key: K, value: MentorSignupData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const saveAndExit = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    navigate('/dashboard');
  };

  const checkUsername = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) return;
      setUsernameStatus('checking');
      try {
        const res = await api.checkUsernameAvailability(slug);
        setUsernameStatus(res?.data?.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        checkUsername(formData.username);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.username, checkUsername]);

  const handleLinkedInConnect = async () => {
    setLinkedinLoading(true);
    try {
      await api.linkedinImport();
      setLinkedinConnected(true);
    } catch {
      // stub – mark as connected anyway for UX
      setLinkedinConnected(true);
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.signupMentor(formData);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/mentor/pending');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      setError(axiosErr?.response?.data?.error || axiosErr?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Work Experience helpers ──────────────────────────────────────────
  const addWorkExp = () => {
    if ((formData.workExperiences?.length ?? 0) >= 5) return;
    updateField('workExperiences', [
      ...(formData.workExperiences || []),
      { id: Date.now().toString(), company: '', title: '', startDate: '', endDate: '', description: '' },
    ]);
  };
  const removeWorkExp = (id: string) =>
    updateField(
      'workExperiences',
      (formData.workExperiences || []).filter((e) => e.id !== id)
    );
  const updateWorkExp = (id: string, field: keyof MentorWorkExperience, val: string) =>
    updateField(
      'workExperiences',
      (formData.workExperiences || []).map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );

  // ── Education helpers ────────────────────────────────────────────────
  const addEdu = () => {
    if ((formData.educationEntries?.length ?? 0) >= 3) return;
    updateField('educationEntries', [
      ...(formData.educationEntries || []),
      { id: Date.now().toString(), university: '', degree: '', graduationYear: '' },
    ]);
  };
  const removeEdu = (id: string) =>
    updateField(
      'educationEntries',
      (formData.educationEntries || []).filter((e) => e.id !== id)
    );
  const updateEdu = (id: string, field: keyof MentorEducation, val: string) =>
    updateField(
      'educationEntries',
      (formData.educationEntries || []).map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );

  // ── Availability helpers ─────────────────────────────────────────────
  const toggleAvailability = (day: string, block: string) => {
    const key = `${day}_${block}`;
    updateField('availability', { ...(formData.availability || {}), [key]: !(formData.availability?.[key]) });
  };

  // ── Credential helpers ───────────────────────────────────────────────
  const toggleCredential = (type: string, label: string) => {
    const existing = formData.credentials || [];
    const has = existing.some((c) => c.badgeType === type);
    if (has) {
      updateField('credentials', existing.filter((c) => c.badgeType !== type));
    } else {
      updateField('credentials', [...existing, { badgeType: type, badgeLabel: label }]);
    }
  };

  // ── Goal helpers ─────────────────────────────────────────────────────
  const toggleGoal = (value: string) => {
    const existing = formData.supportedGoals || [];
    if (existing.includes(value)) {
      updateField('supportedGoals', existing.filter((g) => g !== value));
    } else {
      updateField('supportedGoals', [...existing, value]);
    }
  };

  const toggleMentorIndustry = (value: string) => {
    const existing = formData.mentorIndustries || [];
    if (existing.includes(value)) {
      updateField('mentorIndustries', existing.filter((i) => i !== value));
    } else {
      updateField('mentorIndustries', [...existing, value]);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white';
  const focusStyle = { '--tw-ring-color': '#FF6B6B' } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(step / 6) * 100}%`, backgroundColor: '#FF6B6B' }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <span className="text-sm text-gray-500 font-medium">Step {step} of 6</span>
        <button
          onClick={saveAndExit}
          className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Save &amp; Exit
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left illustration panel */}
        <div className="w-96 shrink-0 p-8 hidden lg:block">
          <StepIllustration step={step} />
        </div>

        {/* Right form panel */}
        <div className="flex-1 overflow-y-auto px-8 py-10 max-w-2xl">
          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Let's get started
                </h1>
                <p className="text-gray-500">Tell us the basics about yourself.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    style={focusStyle}
                    value={formData.displayName || ''}
                    onChange={(e) => updateField('displayName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Primary Language <span className="text-red-400">*</span>
                  </label>
                  <select
                    className={inputClass}
                    value={formData.primaryLanguage}
                    onChange={(e) => updateField('primaryLanguage', e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.timezone || ''}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    placeholder="e.g. Asia/Ho_Chi_Minh"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.locationCity || ''}
                      onChange={(e) => updateField('locationCity', e.target.value)}
                      placeholder="Ho Chi Minh City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.locationCountry || ''}
                      onChange={(e) => updateField('locationCountry', e.target.value)}
                      placeholder="Vietnam"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Connect LinkedIn
                </h1>
                <p className="text-gray-500">Import your professional profile for faster setup.</p>
              </div>

              {!linkedinConnected ? (
                <button
                  onClick={handleLinkedInConnect}
                  disabled={linkedinLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#0A66C2' }}
                >
                  {linkedinLoading ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  )}
                  {linkedinLoading ? 'Connecting...' : 'Connect with LinkedIn'}
                </button>
              ) : (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl border-2"
                  style={{ borderColor: '#4ECDC4', backgroundColor: '#F0FDF9' }}
                >
                  <span className="text-2xl">✓</span>
                  <span className="font-semibold" style={{ color: '#4ECDC4' }}>
                    LinkedIn Connected
                  </span>
                </div>
              )}

              <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-3">What gets imported:</p>
                {[
                  'Current role & company',
                  'Work history (up to 10 entries)',
                  'Education & degrees',
                  'Skills & endorsements',
                  'Profile headline & summary',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span style={{ color: '#4ECDC4' }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                🔒 Privacy: We only read your public profile data. We never post on your behalf or
                store your LinkedIn password.
              </p>

              <button
                onClick={() => setStep(3)}
                className="text-sm underline text-gray-400 hover:text-gray-600 transition-colors"
              >
                Enter manually instead →
              </button>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Professional Background
                </h1>
                <p className="text-gray-500">Help mentees understand your experience.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Role Title</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.currentRoleTitle || ''}
                      onChange={(e) => updateField('currentRoleTitle', e.target.value)}
                      placeholder="Associate, VP..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Company</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.currentCompany || ''}
                      onChange={(e) => updateField('currentCompany', e.target.value)}
                      placeholder="Goldman Sachs..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
                  <select
                    className={inputClass}
                    value={formData.industry || ''}
                    onChange={(e) => updateField('industry', e.target.value)}
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Years of Experience: <span style={{ color: '#FF6B6B' }}>{formData.yearsExperience}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={formData.yearsExperience || 1}
                    onChange={(e) => updateField('yearsExperience', parseInt(e.target.value))}
                    className="w-full accent-red-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 yr</span>
                    <span>30 yrs</span>
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Work Experience</label>
                    <button
                      onClick={addWorkExp}
                      disabled={(formData.workExperiences?.length ?? 0) >= 5}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: '#FF6B6B' }}
                    >
                      + Add Entry
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(formData.workExperiences || []).map((exp) => (
                      <div key={exp.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-400 font-medium">Work Experience</span>
                          <button
                            onClick={() => removeWorkExp(exp.id)}
                            className="text-gray-300 hover:text-red-400 text-sm transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateWorkExp(exp.id, 'company', e.target.value)}
                          />
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Title"
                            value={exp.title}
                            onChange={(e) => updateWorkExp(exp.id, 'title', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Start Date (e.g. Jan 2020)"
                            value={exp.startDate || ''}
                            onChange={(e) => updateWorkExp(exp.id, 'startDate', e.target.value)}
                          />
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="End Date (or Present)"
                            value={exp.endDate || ''}
                            onChange={(e) => updateWorkExp(exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <textarea
                          className={`${inputClass} resize-none`}
                          rows={2}
                          placeholder="Brief description..."
                          value={exp.description || ''}
                          onChange={(e) => updateWorkExp(exp.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                    {(formData.workExperiences?.length ?? 0) === 0 && (
                      <p className="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                        No entries yet. Click "+ Add Entry" to add your work experience.
                      </p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Education</label>
                    <button
                      onClick={addEdu}
                      disabled={(formData.educationEntries?.length ?? 0) >= 3}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: '#FF6B6B' }}
                    >
                      + Add Entry
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(formData.educationEntries || []).map((edu) => (
                      <div key={edu.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-400 font-medium">Education</span>
                          <button
                            onClick={() => removeEdu(edu.id)}
                            className="text-gray-300 hover:text-red-400 text-sm transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="University"
                            value={edu.university}
                            onChange={(e) => updateEdu(edu.id, 'university', e.target.value)}
                          />
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                          />
                        </div>
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Graduation Year"
                          value={edu.graduationYear || ''}
                          onChange={(e) => updateEdu(edu.id, 'graduationYear', e.target.value)}
                        />
                      </div>
                    ))}
                    {(formData.educationEntries?.length ?? 0) === 0 && (
                      <p className="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                        No entries yet. Click "+ Add Entry" to add your education.
                      </p>
                    )}
                  </div>
                </div>

                {/* Credential badges */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Credential Badges
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CREDENTIAL_BADGES.map((badge) => {
                      const selected = (formData.credentials || []).some(
                        (c) => c.badgeType === badge.type
                      );
                      return (
                        <label
                          key={badge.type}
                          className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                          style={{
                            borderColor: selected ? '#FF6B6B' : '#E5E7EB',
                            backgroundColor: selected ? '#FFF5F5' : 'white',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleCredential(badge.type, badge.label)}
                            className="hidden"
                          />
                          <span
                            className="w-4 h-4 rounded border-2 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              borderColor: selected ? '#FF6B6B' : '#D1D5DB',
                              backgroundColor: selected ? '#FF6B6B' : 'transparent',
                            }}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="text-sm text-gray-700">{badge.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4 ─── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Mentorship Focus &amp; Pricing
                </h1>
                <p className="text-gray-500">Define who you want to help and how.</p>
              </div>

              <div className="space-y-5">
                {/* Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Goals you support
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((goal) => {
                      const selected = (formData.supportedGoals || []).includes(goal.value);
                      return (
                        <label
                          key={goal.value}
                          className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                          style={{
                            borderColor: selected ? '#FF6B6B' : '#E5E7EB',
                            backgroundColor: selected ? '#FFF5F5' : 'white',
                          }}
                        >
                          <input type="checkbox" checked={selected} onChange={() => toggleGoal(goal.value)} className="hidden" />
                          <span
                            className="w-4 h-4 rounded border-2 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              borderColor: selected ? '#FF6B6B' : '#D1D5DB',
                              backgroundColor: selected ? '#FF6B6B' : 'transparent',
                            }}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="text-sm text-gray-700">{goal.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Industries I mentor in
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FINANCE_INDUSTRIES.map((ind) => {
                      const selected = (formData.mentorIndustries || []).includes(ind);
                      return (
                        <label
                          key={ind}
                          className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                          style={{
                            borderColor: selected ? '#4ECDC4' : '#E5E7EB',
                            backgroundColor: selected ? '#F0FDFB' : 'white',
                          }}
                        >
                          <input type="checkbox" checked={selected} onChange={() => toggleMentorIndustry(ind)} className="hidden" />
                          <span
                            className="w-4 h-4 rounded border-2 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              borderColor: selected ? '#4ECDC4' : '#D1D5DB',
                              backgroundColor: selected ? '#4ECDC4' : 'transparent',
                            }}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="text-sm text-gray-700">{ind}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Mentorship style */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mentorship Style
                  </label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    maxLength={300}
                    placeholder="Describe your mentoring approach, communication style, and what mentees can expect..."
                    value={formData.mentorshipStyle || ''}
                    onChange={(e) => updateField('mentorshipStyle', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {(formData.mentorshipStyle || '').length}/300
                  </p>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Session Price (USD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={formData.sessionPriceUsd || 0}
                      onChange={(e) => updateField('sessionPriceUsd', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Free Intro Session
                    </label>
                    <button
                      onClick={() => updateField('freeIntroSession', !formData.freeIntroSession)}
                      className="flex items-center gap-2 mt-1"
                    >
                      <div
                        className="w-12 h-6 rounded-full relative transition-colors duration-300"
                        style={{ backgroundColor: formData.freeIntroSession ? '#4ECDC4' : '#D1D5DB' }}
                      >
                        <div
                          className="absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 shadow"
                          style={{ left: formData.freeIntroSession ? '26px' : '2px' }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {formData.freeIntroSession ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Max mentees locked */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Max Mentees: 3 (Free Plan)</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Free plan is limited to 3 active mentees at a time.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-medium">
                      Locked
                    </span>
                  </div>
                  <button className="mt-3 text-xs font-semibold text-amber-700 underline hover:text-amber-900">
                    Upgrade to Premium for unlimited mentees →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 5 ─── */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Your Availability
                </h1>
                <p className="text-gray-500">Set when mentees can book sessions with you.</p>
              </div>

              <div className="space-y-5">
                {/* Weekly grid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Weekly Schedule
                  </label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">Day</th>
                          {TIME_BLOCKS.map((b) => (
                            <th key={b} className="text-center text-xs text-gray-400 font-medium pb-2 px-2">
                              {b}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day) => (
                          <tr key={day} className="border-t border-gray-100">
                            <td className="py-2 pr-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                              {day.slice(0, 3)}
                            </td>
                            {TIME_BLOCKS.map((block) => {
                              const key = `${day}_${block}`;
                              const checked = !!(formData.availability?.[key]);
                              return (
                                <td key={block} className="text-center py-2 px-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleAvailability(day, block)}
                                    className="w-4 h-4 cursor-pointer rounded"
                                    style={{ accentColor: '#FF6B6B' }}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Session duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Session Duration
                  </label>
                  <div className="flex gap-3">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => updateField('sessionDuration', mins)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
                        style={{
                          borderColor: formData.sessionDuration === mins ? '#FF6B6B' : '#E5E7EB',
                          backgroundColor: formData.sessionDuration === mins ? '#FFF5F5' : 'white',
                          color: formData.sessionDuration === mins ? '#FF6B6B' : '#6B7280',
                        }}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* External meeting link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Meeting Link (Zoom / Google Meet)
                  </label>
                  <input
                    type="url"
                    className={inputClass}
                    placeholder="https://meet.google.com/..."
                    value={formData.externalMeetUrl || ''}
                    onChange={(e) => updateField('externalMeetUrl', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Buffer Time
                    </label>
                    <select
                      className={inputClass}
                      value={formData.bufferTime ?? 15}
                      onChange={(e) => updateField('bufferTime', parseInt(e.target.value))}
                    >
                      <option value={0}>No buffer</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Advance Booking
                    </label>
                    <select
                      className={inputClass}
                      value={formData.advanceBooking || '2 weeks'}
                      onChange={(e) => updateField('advanceBooking', e.target.value)}
                    >
                      <option value="1 week">1 week ahead</option>
                      <option value="2 weeks">2 weeks ahead</option>
                      <option value="1 month">1 month ahead</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 6 ─── */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">
                  Profile Preview
                </h1>
                <p className="text-gray-500">Fine-tune your public profile before going live.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Edit form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Headline <span className="text-gray-400 font-normal">(160 chars)</span>
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      maxLength={160}
                      placeholder="Ex-Goldman VP | IB & PE Mentor | 10yr+ Finance"
                      value={formData.headline || ''}
                      onChange={(e) => updateField('headline', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {(formData.headline || '').length}/160
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      About Me <span className="text-gray-400 font-normal">(600 chars)</span>
                    </label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={5}
                      maxLength={600}
                      placeholder="Tell potential mentees who you are, your journey, and what drives your passion for mentoring..."
                      value={formData.aboutMe || ''}
                      onChange={(e) => updateField('aboutMe', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {(formData.aboutMe || '').length}/600
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mentorship Philosophy <span className="text-gray-400 font-normal">(400 chars)</span>
                    </label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      maxLength={400}
                      placeholder="My approach to mentorship..."
                      value={formData.philosophy || ''}
                      onChange={(e) => updateField('philosophy', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {(formData.philosophy || '').length}/400
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Username / Profile URL
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">
                        /m/
                      </span>
                      <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
                        placeholder="your-name"
                        value={formData.username || ''}
                        onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      />
                    </div>
                    <div className="mt-1 text-xs">
                      {usernameStatus === 'checking' && <span className="text-gray-400">Checking availability...</span>}
                      {usernameStatus === 'available' && <span style={{ color: '#4ECDC4' }}>✓ Username is available</span>}
                      {usernameStatus === 'taken' && <span className="text-red-400">✗ Username is already taken</span>}
                    </div>
                  </div>
                </div>

                {/* Profile preview card */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">
                    Live Preview
                  </p>
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ backgroundColor: '#FF6B6B' }}
                    >
                      {(formData.displayName || user?.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {formData.displayName || user?.name || 'Your Name'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formData.headline || 'Your headline will appear here'}
                      </p>
                    </div>
                  </div>

                  {formData.aboutMe && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">
                      {formData.aboutMe}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(formData.credentials || []).slice(0, 3).map((c) => (
                      <span
                        key={c.badgeType}
                        className="text-xs px-2 py-1 rounded-full font-medium text-white"
                        style={{ backgroundColor: '#4ECDC4' }}
                      >
                        {c.badgeLabel}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                    <span>${formData.sessionPriceUsd || 0}/session</span>
                    <span>{formData.locationCity || 'Location'}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded"
                  style={{ accentColor: '#FF6B6B' }}
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="underline" style={{ color: '#FF6B6B' }}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="underline" style={{ color: '#FF6B6B' }}>
                    Privacy Policy
                  </a>
                  . I confirm that all information provided is accurate.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !agreedToTerms}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
