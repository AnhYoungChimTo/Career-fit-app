import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Career, CareerFilters, CareerStats } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Internship' },
  { value: 'entry', label: 'Fresh Graduate' },
  { value: 'mid', label: 'Full-time' },
  { value: 'senior', label: 'Senior' },
  { value: 'executive', label: 'Executive' },
];

const JOB_TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  intern:    { label: 'Internship',      bg: '#E3F2FD', color: '#1565C0' },
  entry:     { label: 'Fresh Graduate',  bg: '#FCE4EC', color: '#C62828' },
  mid:       { label: 'Full-time',       bg: '#E8F5E9', color: '#2E7D32' },
  senior:    { label: 'Full-time',       bg: '#E8F5E9', color: '#2E7D32' },
  executive: { label: 'Executive',       bg: '#F3E5F5', color: '#7B1FA2' },
};

const CAT: Record<string, { icon: string; bg: string; label: string }> = {
  marketing:                { icon: '📣', bg: '#FFF3E0', label: 'Marketing & Truyền thông' },
  sales:                    { icon: '💼', bg: '#E8F5E9', label: 'Kinh doanh & Bán hàng' },
  finance:                  { icon: '💰', bg: '#E3F2FD', label: 'Tài chính & Ngân hàng' },
  law:                      { icon: '⚖️', bg: '#F3E5F5', label: 'Pháp lý & Luật' },
  'international-relations':{ icon: '🌍', bg: '#E0F7FA', label: 'Quan hệ Quốc tế' },
  hr:                       { icon: '👥', bg: '#FCE4EC', label: 'Nhân sự' },
  it:                       { icon: '💻', bg: '#E8EAF6', label: 'Công nghệ thông tin' },
  design:                   { icon: '🎨', bg: '#FFF8E1', label: 'Thiết kế' },
  general:                  { icon: '🏢', bg: '#F5F5F5', label: 'Đa ngành' },
};

const POPULAR_TAGS = [
  { label: 'MARKETING',  category: 'marketing' },
  { label: 'SALES',      category: 'sales' },
  { label: 'FINANCE',    category: 'finance' },
  { label: 'LAW',        category: 'law' },
  { label: 'QUỐC TẾ',   category: 'international-relations' },
  { label: 'NHÂN SỰ',   category: 'hr' },
  { label: 'IT',         category: 'it' },
  { label: 'THIẾT KẾ',  category: 'design' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function catInfo(category: string) {
  return CAT[category] ?? { icon: '🏢', bg: '#F5F5F5', label: category };
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
    low:       ['#E8F5E9', '#2E7D32', 'Áp lực thấp'],
    medium:    ['#FFF8E1', '#F57F17', 'Áp lực vừa'],
    high:      ['#FFF3E0', '#E65100', 'Áp lực cao'],
    very_high: ['#FFEBEE', '#B71C1C', 'Áp lực rất cao'],
  };
  if (!level || !map[level]) return null;
  const [bg, color, label] = map[level];
  return <span style={{ padding: '2px 8px', borderRadius: 12, background: bg, color, fontSize: 11, fontWeight: 500 }}>{label}</span>;
}

function GrowthBadge({ level }: { level?: string }) {
  const map: Record<string, [string, string, string]> = {
    very_high: ['#EDE7F6', '#4527A0', 'Tăng trưởng rất cao'],
    high:      ['#E3F2FD', '#1565C0', 'Tăng trưởng cao'],
    medium:    ['#E8F5E9', '#2E7D32', 'Tăng trưởng vừa'],
    low:       ['#F5F5F5', '#616161', 'Tăng trưởng thấp'],
  };
  if (!level || !map[level]) return null;
  const [bg, color, label] = map[level];
  return <span style={{ padding: '2px 8px', borderRadius: 12, background: bg, color, fontSize: 11, fontWeight: 500 }}>{label}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobLibrary() {
  const navigate = useNavigate();

  const [careers, setCareers]           = useState<Career[]>([]);
  const [stats, setStats]               = useState<CareerStats | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [mobileOpen, setMobileOpen]     = useState(false);

  // Applied filters (trigger API call)
  const [searchQuery, setSearchQuery]           = useState('');
  const [categoryFilter, setCategoryFilter]     = useState('');
  const [levelFilter, setLevelFilter]           = useState('');

  // Pending (sidebar form state before hitting Search)
  const [pendingSearch, setPendingSearch]       = useState('');
  const [pendingCategory, setPendingCategory]   = useState('');
  const [pendingLevel, setPendingLevel]         = useState('');

  const [currentPage, setCurrentPage]   = useState(1);
  const [totalCareers, setTotalCareers] = useState(0);
  const PER_PAGE = 10;

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    loadCareers();
  }, [searchQuery, categoryFilter, levelFilter, currentPage]);

  async function loadStats() {
    try {
      const res = await api.getCareerStats();
      if (res.success && res.data) setStats(res.data);
    } catch { /* silent */ }
  }

  async function loadCareers() {
    setIsLoading(true);
    setError('');
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
    setSearchQuery(pendingSearch);
    setCategoryFilter(pendingCategory);
    setLevelFilter(pendingLevel);
    setCurrentPage(1);
    setMobileOpen(false);
  }

  function clearFilters() {
    setPendingSearch('');   setSearchQuery('');
    setPendingCategory(''); setCategoryFilter('');
    setPendingLevel('');    setLevelFilter('');
    setCurrentPage(1);
  }

  function quickTag(category: string) {
    const next = categoryFilter === category ? '' : category;
    setPendingCategory(next);
    setCategoryFilter(next);
    setCurrentPage(1);
  }

  function goPage(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages   = Math.ceil(totalCareers / PER_PAGE);
  const hasFilters   = !!(searchQuery || categoryFilter || levelFilter);

  // ── Filter form JSX (reused in sidebar + drawer) ──────────────────────────
  function FilterForm() {
    return (
      <div>
        {/* Category */}
        <div style={{ marginBottom: 18 }}>
          <label style={S.filterLabel}>Danh mục công việc</label>
          <select
            value={pendingCategory}
            onChange={e => setPendingCategory(e.target.value)}
            style={S.input}
          >
            <option value="">Tất cả danh mục</option>
            {stats && Object.keys(stats.byCategory).map(cat => (
              <option key={cat} value={cat}>
                {catInfo(cat).label} ({stats.byCategory[cat]})
              </option>
            ))}
          </select>
        </div>

        {/* Keyword */}
        <div style={{ marginBottom: 18 }}>
          <label style={S.filterLabel}>Tiêu đề công việc</label>
          <input
            type="text"
            value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder="Nhập tiêu đề công việc..."
            style={S.input}
          />
        </div>

        {/* Job type */}
        <div style={{ marginBottom: 18 }}>
          <label style={S.filterLabel}>Loại công việc</label>
          {EXPERIENCE_LEVELS.map(lv => (
            <label key={lv.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="lvFilter"
                checked={pendingLevel === lv.value}
                onChange={() => setPendingLevel(pendingLevel === lv.value ? '' : lv.value)}
                style={{ accentColor: '#2E75B6', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#1A1A2E' }}>{lv.label}</span>
            </label>
          ))}
        </div>

        {/* Popular tags */}
        <div style={{ marginBottom: 20 }}>
          <label style={S.filterLabel}>Tags phổ biến</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_TAGS.map(tag => {
              const active = categoryFilter === tag.category || pendingCategory === tag.category;
              return (
                <button
                  key={tag.category}
                  onClick={() => { setPendingCategory(tag.category); quickTag(tag.category); }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 16,
                    border: `1px solid ${active ? '#2E75B6' : '#E0E0E0'}`,
                    background: active ? '#E3F2FD' : '#fff',
                    color: active ? '#1565C0' : '#6C757D',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                    transition: 'transform 0.15s',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={applyFilters}
          style={S.btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.background = '#1A5A96')}
          onMouseLeave={e => (e.currentTarget.style.background = '#2E75B6')}
        >
          Tìm kiếm
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{ ...S.btnOutline, marginTop: 8 }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    );
  }

  // ── Modal body content ─────────────────────────────────────────────────────
  function ModalContent({ career }: { career: Career }) {
    const badge = JOB_TYPE_BADGE[career.experienceLevel] ?? { label: career.experienceLevel, bg: '#F5F5F5', color: '#616161' };
    const cat   = catInfo(career.category);

    return (
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', fontFamily: 'Inter, "Be Vietnam Pro", system-ui, sans-serif' }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ borderBottom: '1px solid #E0E0E0', padding: '20px 24px', position: 'sticky', top: 0, background: '#fff', borderRadius: '12px 12px 0 0', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, border: '1px solid rgba(0,0,0,0.07)' }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ padding: '3px 10px', borderRadius: 12, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>
                  {badge.label}
                </span>
                <span style={{ fontSize: 12, color: '#6C757D' }}>· {timeAgo(career.createdAt)}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2E', margin: '0 0 2px' }}>{career.name}</h2>
              <p style={{ fontSize: 14, color: '#6C757D', margin: 0 }}>{career.vietnameseName}</p>
            </div>
            <button
              onClick={() => setSelectedCareer(null)}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6C757D', lineHeight: 1, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {/* ── Main content (left 65%) ── */}
          <div style={{ flex: '0 0 65%', padding: '20px 24px', borderRight: '1px solid #E0E0E0' }}>

            {/* Salary + hours highlight */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {career.avgSalaryVND && (
                <div style={{ flex: 1, background: '#E8F5E9', borderRadius: 8, padding: '12px 16px', border: '1px solid #C8E6C9' }}>
                  <p style={{ fontSize: 11, color: '#388E3C', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mức lương</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1B5E20', margin: 0 }}>{career.avgSalaryVND} VNĐ</p>
                  <p style={{ fontSize: 11, color: '#388E3C', margin: '2px 0 0' }}>mỗi tháng</p>
                </div>
              )}
              {career.workHoursPerWeek && (
                <div style={{ flex: 1, background: '#E3F2FD', borderRadius: 8, padding: '12px 16px', border: '1px solid #BBDEFB' }}>
                  <p style={{ fontSize: 11, color: '#1565C0', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giờ làm việc</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0D47A1', margin: 0 }}>{career.workHoursPerWeek} giờ</p>
                  <p style={{ fontSize: 11, color: '#1565C0', margin: '2px 0 0' }}>mỗi tuần</p>
                </div>
              )}
            </div>

            {/* 1. Mô tả công việc */}
            <Section title="1. Mô tả công việc">
              <p style={{ fontSize: 14, color: '#1A1A2E', lineHeight: 1.75, margin: 0 }}>{career.description}</p>
            </Section>

            {/* 2. Ngành / Lĩnh vực */}
            <Section title="2. Ngành & Lĩnh vực">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 500 }}>{cat.label}</span>
              </div>
            </Section>

            {/* 3. Yêu cầu ứng viên (A-factor) */}
            {career.requirements && (
              <Section title="3. Yêu cầu ứng viên">
                {career.requirements.a1 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6C757D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tính cách & EQ</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                      {Object.entries(career.requirements.a1 as Record<string, number>).slice(0, 6).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: '#2E75B6', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#6C757D', width: 80, textAlign: 'right', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {career.requirements.a2 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6C757D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Kỹ năng chuyên môn</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                      {Object.entries(career.requirements.a2 as Record<string, number>).slice(0, 6).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: '#28A745', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#6C757D', width: 80, textAlign: 'right', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* 4. Chính sách đãi ngộ */}
            <Section title="4. Chính sách đãi ngộ">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#1A1A2E', lineHeight: 2 }}>
                {career.avgSalaryVND && <li>Mức lương: <strong>{career.avgSalaryVND} VNĐ/tháng</strong></li>}
                {career.workHoursPerWeek && <li>Giờ làm: <strong>{career.workHoursPerWeek} giờ/tuần</strong></li>}
                {career.growthPotential && <li>Tiềm năng phát triển: <strong style={{ textTransform: 'capitalize' }}>{career.growthPotential.replace('_', ' ')}</strong></li>}
                <li>Môi trường làm việc chuyên nghiệp, cơ hội học hỏi cao</li>
              </ul>
            </Section>

            {/* 5. Cached analysis */}
            {career.cachedAnalysis && (
              <Section title="5. Phân tích chi tiết">
                <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 16, border: '1px solid #E0E0E0' }}>
                  {typeof career.cachedAnalysis === 'string' ? (
                    <pre style={{ fontSize: 13, color: '#1A1A2E', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.7 }}>
                      {career.cachedAnalysis}
                    </pre>
                  ) : (
                    <div>
                      {career.cachedAnalysis.detailedAnalysis && (
                        <p style={{ fontSize: 14, color: '#1A1A2E', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
                          {career.cachedAnalysis.detailedAnalysis}
                        </p>
                      )}
                      {career.cachedAnalysis.skillStack?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#6C757D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Kỹ năng cần có</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {career.cachedAnalysis.skillStack.map((s: string, i: number) => (
                              <span key={i} style={{ padding: '3px 10px', background: '#E3F2FD', color: '#1565C0', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{s}</span>
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

          {/* ── Sidebar (right 35%) ── */}
          <div style={{ flex: '0 0 35%', padding: '20px 20px' }}>

            {/* Block 1: Thông tin tổng quan */}
            <div style={{ background: '#F8F9FA', borderRadius: 8, border: '1px solid #E0E0E0', padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Thông tin</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <InfoRow icon="📅" label="Ngày đăng" value={new Date(career.createdAt).toLocaleDateString('vi-VN')} />
                <InfoRow icon="📊" label="Cấp độ" value={JOB_TYPE_BADGE[career.experienceLevel]?.label ?? career.experienceLevel} />
                <InfoRow icon="🏷️" label="Ngành" value={catInfo(career.category).label} />
                {career.workHoursPerWeek && <InfoRow icon="⏰" label="Giờ/tuần" value={`${career.workHoursPerWeek} giờ`} />}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E0E0E0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6C757D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Mức độ</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <StressBadge level={career.stressLevel} />
                  <GrowthBadge level={career.growthPotential} />
                </div>
              </div>
            </div>

            {/* Block 2: Nhà tuyển dụng / Career field */}
            <div style={{ background: '#F8F9FA', borderRadius: 8, border: '1px solid #E0E0E0', padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: catInfo(career.category).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(0,0,0,0.07)' }}>
                  {catInfo(career.category).icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{catInfo(career.category).label}</p>
                  <p style={{ fontSize: 12, color: '#6C757D', margin: 0 }}>Lĩnh vực nghề nghiệp</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => { setSelectedCareer(null); navigate('/interview-selection'); }}
              style={{ ...S.btnPrimary, fontSize: 14 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1A5A96')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2E75B6')}
            >
              Làm bài đánh giá nghề nghiệp
            </button>
            <button
              onClick={() => setSelectedCareer(null)}
              style={{ ...S.btnOutline, marginTop: 8, fontSize: 14 }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Inter, "Be Vietnam Pro", system-ui, sans-serif' }}>

      {/* Top navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E0E0E0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2E75B6', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            ← Dashboard
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Thư viện nghề nghiệp</h1>
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 6, padding: '6px 12px', color: '#1A1A2E', fontSize: 13, cursor: 'pointer' }}
          >
            ⚙ Lọc
          </button>
          <div className="hidden lg:block" style={{ width: 80 }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block" style={{ width: 270, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E0E0E0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Bộ lọc</h2>
              {hasFilters && (
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#2E75B6', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  Xóa tất cả
                </button>
              )}
            </div>
            <FilterForm />
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb + title */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#6C757D', marginBottom: 4 }}>
              <span style={{ color: '#2E75B6', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Trang chủ</span>
              {' > '}Việc làm
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Công việc</h2>
              <span style={{ fontSize: 14, color: '#6C757D' }}>
                Tất cả {totalCareers} công việc
                {hasFilters && <span style={{ color: '#2E75B6' }}> (đã lọc)</span>}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, color: '#B71C1C', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #E0E0E0', padding: 20, display: 'flex', gap: 16 }}>
                  <div style={{ width: 60, height: 60, background: '#F0F0F0', borderRadius: 8, flexShrink: 0, animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 13, background: '#F0F0F0', borderRadius: 4, marginBottom: 8, width: '55%' }} />
                    <div style={{ height: 11, background: '#F0F0F0', borderRadius: 4, marginBottom: 6, width: '35%' }} />
                    <div style={{ height: 11, background: '#F0F0F0', borderRadius: 4, width: '25%' }} />
                  </div>
                </div>
              ))}
            </div>

          ) : careers.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E0E0E0', padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>Không tìm thấy việc làm</h3>
              <p style={{ fontSize: 14, color: '#6C757D', marginBottom: 16 }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={clearFilters} style={{ ...S.btnPrimary, width: 'auto', padding: '8px 24px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1A5A96')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2E75B6')}
              >
                Xóa bộ lọc
              </button>
            </div>

          ) : (
            <>
              {/* Job card list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {careers.map(career => {
                  const badge = JOB_TYPE_BADGE[career.experienceLevel] ?? { label: career.experienceLevel, bg: '#F5F5F5', color: '#616161' };
                  const cat   = catInfo(career.category);
                  return (
                    <div
                      key={career.id}
                      onClick={() => setSelectedCareer(career)}
                      style={{
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #E0E0E0',
                        padding: '16px 20px',
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#2E75B6';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#E0E0E0';
                      }}
                    >
                      {/* Logo / category icon */}
                      <div style={{ width: 60, height: 60, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }}>
                        {cat.icon}
                      </div>

                      {/* Card body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badge + time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ padding: '2px 10px', borderRadius: 12, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>
                            {badge.label}
                          </span>
                          <span style={{ fontSize: 12, color: '#6C757D' }}>· {timeAgo(career.createdAt)}</span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', margin: '0 0 3px', lineHeight: 1.4 }}>
                          {career.name}
                        </h3>
                        <p style={{ fontSize: 13, color: '#6C757D', margin: '0 0 8px' }}>{career.vietnameseName}</p>

                        {/* Industry row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#6C757D' }}>📍</span>
                          <span style={{ fontSize: 13, color: '#6C757D' }}>{cat.label}</span>
                        </div>

                        {/* Salary */}
                        {career.avgSalaryVND && (
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#D32F2F', marginBottom: 6 }}>
                            {career.avgSalaryVND} VNĐ/tháng
                          </div>
                        )}

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <StressBadge level={career.stressLevel} />
                          <GrowthBadge level={career.growthPotential} />
                        </div>
                      </div>

                      {/* Apply button */}
                      <div style={{ flexShrink: 0, paddingTop: 28 }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedCareer(career); }}
                          style={{ padding: '8px 18px', background: '#2E75B6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#1A5A96')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#2E75B6')}
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => goPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '6px 12px', border: '1px solid #E0E0E0', borderRadius: 6, background: '#fff', color: currentPage === 1 ? '#BDBDBD' : '#1A1A2E', fontSize: 14, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    «
                  </button>

                  {buildPageNums(currentPage, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} style={{ padding: '6px 4px', color: '#6C757D', fontSize: 13 }}>...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goPage(p)}
                        style={{
                          width: 36, height: 36,
                          border: `1px solid ${currentPage === p ? '#2E75B6' : '#E0E0E0'}`,
                          borderRadius: 6,
                          background: currentPage === p ? '#2E75B6' : '#fff',
                          color: currentPage === p ? '#fff' : '#1A1A2E',
                          fontSize: 13, fontWeight: currentPage === p ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '6px 12px', border: '1px solid #E0E0E0', borderRadius: 6, background: '#fff', color: currentPage === totalPages ? '#BDBDBD' : '#1A1A2E', fontSize: 14, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    »
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, background: '#fff', padding: 20, overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,0.15)', animation: 'slideIn 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Bộ lọc</h2>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6C757D' }}>✕</button>
            </div>
            <FilterForm />
          </div>
        </div>
      )}

      {/* Job detail modal */}
      {selectedCareer && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setSelectedCareer(null)}
        >
          <ModalContent career={selectedCareer} />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const S = {
  filterLabel: {
    display: 'block' as const,
    fontSize: 12,
    fontWeight: 600,
    color: '#6C757D',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E0E0E0',
    borderRadius: 6,
    fontSize: 14,
    color: '#1A1A2E',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  btnPrimary: {
    width: '100%',
    padding: '10px 0',
    background: '#2E75B6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  btnOutline: {
    width: '100%',
    padding: '9px 0',
    background: 'transparent',
    color: '#6C757D',
    border: '1px solid #E0E0E0',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', margin: '0 0 10px', paddingBottom: 8, borderBottom: '1px solid #E0E0E0' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16, width: 22 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#6C757D', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{value}</span>
    </div>
  );
}
