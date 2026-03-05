import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Career, CareerFilters, CareerStats } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { value: 'intern',    label: 'Internship' },
  { value: 'entry',     label: 'Fresh Graduate' },
  { value: 'mid',       label: 'Full-time' },
  { value: 'senior',    label: 'Senior' },
  { value: 'executive', label: 'Executive' },
];

const JOB_TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  intern:    { label: 'Internship',     bg: '#E8F4FF', color: '#007AFF' },
  entry:     { label: 'Fresh Graduate', bg: '#E9FBF0', color: '#1E7E34' },
  mid:       { label: 'Full-time',      bg: '#FFF4E0', color: '#B36B00' },
  senior:    { label: 'Senior',         bg: '#EEE8FF', color: '#5856D6' },
  executive: { label: 'Executive',      bg: '#FFE8EC', color: '#FF2D55' },
};

const CAT: Record<string, { icon: string; gradient: string; label: string }> = {
  marketing:                { icon: '📣', gradient: 'linear-gradient(135deg,#FF9500,#FF6B00)', label: 'Marketing & Truyền thông' },
  sales:                    { icon: '💼', gradient: 'linear-gradient(135deg,#34C759,#30B94A)', label: 'Kinh doanh & Bán hàng' },
  finance:                  { icon: '💰', gradient: 'linear-gradient(135deg,#007AFF,#0055FF)', label: 'Tài chính & Ngân hàng' },
  law:                      { icon: '⚖️', gradient: 'linear-gradient(135deg,#AF52DE,#9333EA)', label: 'Pháp lý & Luật' },
  'international-relations':{ icon: '🌍', gradient: 'linear-gradient(135deg,#5AC8FA,#007AFF)', label: 'Quan hệ Quốc tế' },
  hr:                       { icon: '👥', gradient: 'linear-gradient(135deg,#FF2D55,#FF6B81)', label: 'Nhân sự' },
  it:                       { icon: '💻', gradient: 'linear-gradient(135deg,#5856D6,#3634A3)', label: 'Công nghệ thông tin' },
  design:                   { icon: '🎨', gradient: 'linear-gradient(135deg,#FFCC00,#FF9500)', label: 'Thiết kế' },
  general:                  { icon: '🏢', gradient: 'linear-gradient(135deg,#8E8E93,#636366)', label: 'Đa ngành' },
};

const POPULAR_TAGS = [
  { label: 'Marketing', category: 'marketing' },
  { label: 'Sales',     category: 'sales' },
  { label: 'Finance',   category: 'finance' },
  { label: 'Law',       category: 'law' },
  { label: 'Quốc tế',  category: 'international-relations' },
  { label: 'Nhân sự',  category: 'hr' },
  { label: 'IT',        category: 'it' },
  { label: 'Design',    category: 'design' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function catInfo(category: string) {
  return CAT[category] ?? { icon: '🏢', gradient: 'linear-gradient(135deg,#8E8E93,#636366)', label: category };
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days < 1) return 'Hôm nay';
  if (days < 30) return `${days} ngày trước`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} tháng trước`;
  return `${Math.floor(m / 12)} năm trước`;
}

function buildPageNums(cur: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (cur > 3) pages.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StressBadge({ level }: { level?: string }) {
  const map: Record<string, [string, string, string]> = {
    low:       ['#E9FBF0', '#1E7E34', 'Áp lực thấp'],
    medium:    ['#FFF4E0', '#B36B00', 'Áp lực vừa'],
    high:      ['#FFE8EC', '#CC2936', 'Áp lực cao'],
    very_high: ['#FFE8EC', '#FF2D55', 'Áp lực rất cao'],
  };
  if (!level || !map[level]) return null;
  const [bg, color, label] = map[level];
  return <span style={{ padding: '3px 10px', borderRadius: 20, background: bg, color, fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function GrowthBadge({ level }: { level?: string }) {
  const map: Record<string, [string, string, string]> = {
    very_high: ['#EEE8FF', '#5856D6', 'Tăng trưởng rất cao'],
    high:      ['#E8F4FF', '#007AFF', 'Tăng trưởng cao'],
    medium:    ['#E9FBF0', '#1E7E34', 'Tăng trưởng vừa'],
    low:       ['#F5F5F7', '#636366', 'Tăng trưởng thấp'],
  };
  if (!level || !map[level]) return null;
  const [bg, color, label] = map[level];
  return <span style={{ padding: '3px 10px', borderRadius: 20, background: bg, color, fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobLibrary() {
  const navigate = useNavigate();

  const [careers, setCareers]               = useState<Career[]>([]);
  const [stats, setStats]                   = useState<CareerStats | null>(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [mobileOpen, setMobileOpen]         = useState(false);

  const [searchQuery, setSearchQuery]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter]       = useState('');

  const [pendingSearch, setPendingSearch]     = useState('');
  const [pendingCategory, setPendingCategory] = useState('');
  const [pendingLevel, setPendingLevel]       = useState('');

  const [currentPage, setCurrentPage]   = useState(1);
  const [totalCareers, setTotalCareers] = useState(0);
  const PER_PAGE = 10;

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadCareers(); }, [searchQuery, categoryFilter, levelFilter, currentPage]);

  async function loadStats() {
    try {
      const res = await api.getCareerStats();
      if (res.success && res.data) setStats(res.data);
    } catch { /* silent */ }
  }

  async function loadCareers() {
    setIsLoading(true); setError('');
    try {
      const filters: CareerFilters = { limit: PER_PAGE, offset: (currentPage - 1) * PER_PAGE };
      if (searchQuery)    filters.search          = searchQuery;
      if (categoryFilter) filters.category        = categoryFilter;
      if (levelFilter)    filters.experienceLevel = levelFilter;
      const res = await api.getAllCareers(filters);
      if (res.success && res.data) {
        setCareers(res.data.careers);
        setTotalCareers(res.data.pagination.total);
      } else {
        setError(res.error?.message ?? 'Không thể tải danh sách việc làm');
      }
    } catch {
      setError('Không thể tải danh sách việc làm');
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters() {
    setSearchQuery(pendingSearch); setCategoryFilter(pendingCategory);
    setLevelFilter(pendingLevel);  setCurrentPage(1); setMobileOpen(false);
  }

  function clearFilters() {
    setPendingSearch('');   setSearchQuery('');
    setPendingCategory(''); setCategoryFilter('');
    setPendingLevel('');    setLevelFilter('');
    setCurrentPage(1);
  }

  function quickTag(category: string) {
    const next = categoryFilter === category ? '' : category;
    setPendingCategory(next); setCategoryFilter(next); setCurrentPage(1);
  }

  function goPage(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(totalCareers / PER_PAGE);
  const hasFilters = !!(searchQuery || categoryFilter || levelFilter);

  // ── Filter form ────────────────────────────────────────────────────────────
  function FilterForm() {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <label style={S.filterLabel}>Danh mục</label>
          <select value={pendingCategory} onChange={e => setPendingCategory(e.target.value)} style={S.input}>
            <option value="">Tất cả danh mục</option>
            {stats && Object.keys(stats.byCategory).map(cat => (
              <option key={cat} value={cat}>{catInfo(cat).label} ({stats.byCategory[cat]})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={S.filterLabel}>Tìm kiếm</label>
          <input
            type="text" value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder="Tên công việc..." style={S.input}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={S.filterLabel}>Cấp độ</label>
          {EXPERIENCE_LEVELS.map(lv => {
            const badge = JOB_TYPE_BADGE[lv.value];
            const sel = pendingLevel === lv.value;
            return (
              <label key={lv.value} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 12, marginBottom: 4, cursor: 'pointer',
                background: sel ? badge.bg : 'transparent', transition: 'background 0.15s',
              }}>
                <input type="radio" name="lvFilter" checked={sel}
                  onChange={() => setPendingLevel(sel ? '' : lv.value)}
                  style={{ accentColor: '#007AFF', width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 14, color: sel ? badge.color : '#1D1D1F', fontWeight: sel ? 600 : 400 }}>
                  {lv.label}
                </span>
              </label>
            );
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={S.filterLabel}>Tags phổ biến</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_TAGS.map(tag => {
              const active = categoryFilter === tag.category || pendingCategory === tag.category;
              const cat = catInfo(tag.category);
              return (
                <button key={tag.category}
                  onClick={() => { setPendingCategory(tag.category); quickTag(tag.category); }}
                  style={{ padding: '5px 13px', borderRadius: 20, border: 'none',
                    background: active ? cat.gradient : '#F5F5F7',
                    color: active ? '#fff' : '#1D1D1F',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={applyFilters} style={S.btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.background = '#0066CC')}
          onMouseLeave={e => (e.currentTarget.style.background = '#007AFF')}
        >
          Tìm kiếm
        </button>
        {hasFilters && (
          <button onClick={clearFilters} style={{ ...S.btnOutline, marginTop: 8 }}>Xóa bộ lọc</button>
        )}
      </div>
    );
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function ModalContent({ career }: { career: Career }) {
    const badge = JOB_TYPE_BADGE[career.experienceLevel] ?? { label: career.experienceLevel, bg: '#F5F5F7', color: '#636366' };
    const cat   = catInfo(career.category);
    return (
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', fontFamily: 'inherit' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '24px 28px 20px', position: 'sticky', top: 0, background: '#fff', borderRadius: '24px 24px 0 0', borderBottom: '1px solid rgba(0,0,0,0.06)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                <span style={{ fontSize: 13, color: '#86868B' }}>· {timeAgo(career.createdAt)}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{career.name}</h2>
              <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>{career.vietnameseName}</p>
            </div>
            <button onClick={() => setSelectedCareer(null)}
              style={{ background: '#F5F5F7', border: 'none', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: '#636366', flexShrink: 0 }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          {/* Left */}
          <div style={{ flex: '0 0 62%', padding: '24px 28px', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
            {/* Salary + hours */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {career.avgSalaryVND && (
                <div style={{ flex: 1, background: 'linear-gradient(135deg,#34C759,#30B94A)', borderRadius: 16, padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mức lương</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{career.avgSalaryVND}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>VNĐ / tháng</p>
                </div>
              )}
              {career.workHoursPerWeek && (
                <div style={{ flex: 1, background: 'linear-gradient(135deg,#007AFF,#0055FF)', borderRadius: 16, padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giờ làm việc</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{career.workHoursPerWeek} giờ</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>mỗi tuần</p>
                </div>
              )}
            </div>

            <Section title="Mô tả công việc">
              <p style={{ fontSize: 14, color: '#1D1D1F', lineHeight: 1.75, margin: 0 }}>{career.description}</p>
            </Section>

            <Section title="Ngành & Lĩnh vực">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cat.icon}</div>
                <span style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>{cat.label}</span>
              </div>
            </Section>

            {career.requirements && (
              <Section title="Yêu cầu ứng viên">
                {career.requirements.a1 && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Tính cách & EQ</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      {Object.entries(career.requirements.a1 as Record<string, number>).slice(0, 6).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#F5F5F7', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: 'linear-gradient(90deg,#007AFF,#5856D6)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#86868B', width: 80, textAlign: 'right', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {career.requirements.a2 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Kỹ năng chuyên môn</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      {Object.entries(career.requirements.a2 as Record<string, number>).slice(0, 6).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#F5F5F7', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: 'linear-gradient(90deg,#34C759,#30B94A)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#86868B', width: 80, textAlign: 'right', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            <Section title="Chính sách đãi ngộ">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#1D1D1F', lineHeight: 2.1 }}>
                {career.avgSalaryVND && <li>Mức lương: <strong>{career.avgSalaryVND} VNĐ/tháng</strong></li>}
                {career.workHoursPerWeek && <li>Giờ làm: <strong>{career.workHoursPerWeek} giờ/tuần</strong></li>}
                {career.growthPotential && <li>Tiềm năng phát triển: <strong style={{ textTransform: 'capitalize' }}>{career.growthPotential.replace('_', ' ')}</strong></li>}
                <li>Môi trường chuyên nghiệp, cơ hội học hỏi cao</li>
              </ul>
            </Section>

            {career.cachedAnalysis && (
              <Section title="Phân tích chi tiết">
                <div style={{ background: '#F5F5F7', borderRadius: 14, padding: 16 }}>
                  {typeof career.cachedAnalysis === 'string' ? (
                    <pre style={{ fontSize: 13, color: '#1D1D1F', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.7 }}>{career.cachedAnalysis}</pre>
                  ) : (
                    <div>
                      {career.cachedAnalysis.detailedAnalysis && (
                        <p style={{ fontSize: 14, color: '#1D1D1F', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{career.cachedAnalysis.detailedAnalysis}</p>
                      )}
                      {career.cachedAnalysis.skillStack?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Kỹ năng cần có</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {career.cachedAnalysis.skillStack.map((s: string, i: number) => (
                              <span key={i} style={{ padding: '4px 12px', background: '#E8F4FF', color: '#007AFF', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>

          {/* Right */}
          <div style={{ flex: '0 0 38%', padding: '24px 20px' }}>
            <div style={{ background: '#F5F5F7', borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Thông tin</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow icon="📅" label="Ngày đăng" value={new Date(career.createdAt).toLocaleDateString('vi-VN')} />
                <InfoRow icon="📊" label="Cấp độ" value={JOB_TYPE_BADGE[career.experienceLevel]?.label ?? career.experienceLevel} />
                <InfoRow icon="🏷️" label="Ngành" value={catInfo(career.category).label} />
                {career.workHoursPerWeek && <InfoRow icon="⏰" label="Giờ/tuần" value={`${career.workHoursPerWeek} giờ`} />}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <StressBadge level={career.stressLevel} />
                <GrowthBadge level={career.growthPotential} />
              </div>
            </div>

            <div style={{ background: '#F5F5F7', borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cat.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', margin: 0 }}>{cat.label}</p>
                  <p style={{ fontSize: 12, color: '#86868B', margin: 0 }}>Lĩnh vực nghề nghiệp</p>
                </div>
              </div>
            </div>

            <button onClick={() => { setSelectedCareer(null); navigate('/interview-selection'); }}
              style={{ ...S.btnPrimary, borderRadius: 14, padding: '13px 0', fontSize: 15 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0066CC')}
              onMouseLeave={e => (e.currentTarget.style.background = '#007AFF')}
            >
              Làm bài đánh giá
            </button>
            <button onClick={() => setSelectedCareer(null)}
              style={{ ...S.btnOutline, marginTop: 8, borderRadius: 14, padding: '12px 0', fontSize: 15 }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif' }}>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#007AFF', fontSize: 15, fontWeight: 500, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
            ‹ Dashboard
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>Thư viện nghề nghiệp</h1>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden"
            style={{ background: '#007AFF', border: 'none', borderRadius: 10, padding: '6px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Lọc
          </button>
          <div className="hidden lg:block" style={{ width: 90 }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside className="hidden lg:block" style={{ width: 268, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: 22, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', position: 'sticky', top: 76 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>Bộ lọc</h2>
              {hasFilters && (
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Xóa tất cả</button>
              )}
            </div>
            <FilterForm />
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#86868B', marginBottom: 6 }}>
              <span style={{ color: '#007AFF', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/dashboard')}>Trang chủ</span>
              <span> › Việc làm</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-0.03em' }}>Công việc</h2>
              <span style={{ fontSize: 14, color: '#86868B' }}>
                {totalCareers} vị trí{hasFilters && <span style={{ color: '#007AFF' }}> (đã lọc)</span>}
              </span>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '14px 18px', background: '#FFE8EC', borderRadius: 14, color: '#FF2D55', fontSize: 14, fontWeight: 500 }}>{error}</div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '20px', display: 'flex', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 64, height: 64, background: '#F5F5F7', borderRadius: 16, flexShrink: 0, animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, background: '#F5F5F7', borderRadius: 7, marginBottom: 10, width: '50%', animation: 'pulse 1.5s ease infinite' }} />
                    <div style={{ height: 12, background: '#F5F5F7', borderRadius: 6, marginBottom: 8, width: '32%', animation: 'pulse 1.5s ease infinite' }} />
                    <div style={{ height: 12, background: '#F5F5F7', borderRadius: 6, width: '22%', animation: 'pulse 1.5s ease infinite' }} />
                  </div>
                </div>
              ))}
            </div>

          ) : careers.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 22, padding: 64, textAlign: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 8, letterSpacing: '-0.02em' }}>Không tìm thấy</h3>
              <p style={{ fontSize: 14, color: '#86868B', marginBottom: 22 }}>Thử thay đổi bộ lọc hoặc từ khóa</p>
              <button onClick={clearFilters} style={{ ...S.btnPrimary, width: 'auto', padding: '11px 30px', borderRadius: 14 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0066CC')}
                onMouseLeave={e => (e.currentTarget.style.background = '#007AFF')}
              >Xóa bộ lọc</button>
            </div>

          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {careers.map(career => {
                  const badge = JOB_TYPE_BADGE[career.experienceLevel] ?? { label: career.experienceLevel, bg: '#F5F5F7', color: '#636366' };
                  const cat   = catInfo(career.category);
                  return (
                    <div key={career.id} onClick={() => setSelectedCareer(career)}
                      style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.22s ease,transform 0.22s ease', border: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Icon */}
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
                        {cat.icon}
                      </div>

                      {/* Body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>{badge.label}</span>
                          <span style={{ fontSize: 12, color: '#86868B' }}>· {timeAgo(career.createdAt)}</span>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F', margin: '0 0 2px', letterSpacing: '-0.02em', lineHeight: 1.35 }}>{career.name}</h3>
                        <p style={{ fontSize: 13, color: '#86868B', margin: '0 0 8px' }}>{career.vietnameseName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: '#86868B' }}>📍 {cat.label}</span>
                        </div>
                        {career.avgSalaryVND && (
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#34C759', marginBottom: 8, letterSpacing: '-0.01em' }}>
                            {career.avgSalaryVND} VNĐ/tháng
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <StressBadge level={career.stressLevel} />
                          <GrowthBadge level={career.growthPotential} />
                        </div>
                      </div>

                      {/* CTA */}
                      <div style={{ flexShrink: 0, paddingTop: 22 }}>
                        <button onClick={e => { e.stopPropagation(); setSelectedCareer(career); }}
                          style={{ padding: '8px 18px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s,transform 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#0066CC'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#007AFF'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => goPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: 12, background: currentPage === 1 ? '#F5F5F7' : '#007AFF', color: currentPage === 1 ? '#C7C7CC' : '#fff', fontSize: 16, fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                    ‹
                  </button>
                  {buildPageNums(currentPage, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} style={{ padding: '8px 6px', color: '#86868B', fontSize: 13 }}>···</span>
                    ) : (
                      <button key={p} onClick={() => goPage(p as number)}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 12, background: currentPage === p ? '#007AFF' : '#fff', color: currentPage === p ? '#fff' : '#1D1D1F', fontSize: 14, fontWeight: currentPage === p ? 700 : 400, cursor: 'pointer', boxShadow: currentPage === p ? '0 2px 8px rgba(0,122,255,0.35)' : '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 0.15s' }}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => goPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: 12, background: currentPage === totalPages ? '#F5F5F7' : '#007AFF', color: currentPage === totalPages ? '#C7C7CC' : '#fff', fontSize: 16, fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, background: '#fff', padding: 24, overflowY: 'auto', boxShadow: '4px 0 40px rgba(0,0,0,0.2)', animation: 'slideIn 0.25s ease', borderRadius: '0 20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>Bộ lọc</h2>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: '#F5F5F7', border: 'none', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: '#636366' }}>✕</button>
            </div>
            <FilterForm />
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedCareer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setSelectedCareer(null)}>
          <ModalContent career={selectedCareer} />
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
      `}</style>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const S = {
  filterLabel: {
    display: 'block' as const, fontSize: 12, fontWeight: 600,
    color: '#86868B', textTransform: 'uppercase' as const,
    letterSpacing: '0.05em', marginBottom: 10,
  },
  input: {
    width: '100%', padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12,
    fontSize: 14, color: '#1D1D1F', background: '#F5F5F7',
    outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
  },
  btnPrimary: {
    width: '100%', padding: '12px 0', background: '#007AFF',
    color: '#fff', border: 'none', borderRadius: 14, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
    fontFamily: 'inherit', letterSpacing: '-0.01em',
  },
  btnOutline: {
    width: '100%', padding: '11px 0', background: '#F5F5F7',
    color: '#1D1D1F', border: 'none', borderRadius: 14, fontSize: 15,
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1F', margin: '0 0 12px', paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.06)', letterSpacing: '-0.01em' }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#86868B', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>{value}</span>
    </div>
  );
}
