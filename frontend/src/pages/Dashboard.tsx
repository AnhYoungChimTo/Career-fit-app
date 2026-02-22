import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Interview } from '../types';

// ─── Quick Analysis history types + localStorage helpers ─────────────────────
interface QuickAnalysisRecord {
  id: string;
  targetCareer: string;
  descriptionSnippet: string; // first 200 chars of description
  analysis: string;
  createdAt: string; // ISO string
}

const QA_HISTORY_KEY = 'qa_history';
const QA_DRAFT_KEY = 'qa_draft';

function loadQADraft(): { description: string; targetCareer: string } {
  try {
    const raw = localStorage.getItem(QA_DRAFT_KEY);
    return raw ? JSON.parse(raw) : { description: '', targetCareer: '' };
  } catch {
    return { description: '', targetCareer: '' };
  }
}

function saveQADraft(description: string, targetCareer: string) {
  localStorage.setItem(QA_DRAFT_KEY, JSON.stringify({ description, targetCareer }));
}

function clearQADraft() {
  localStorage.removeItem(QA_DRAFT_KEY);
}

function loadQAHistory(): QuickAnalysisRecord[] {
  try {
    const raw = localStorage.getItem(QA_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQARecord(record: QuickAnalysisRecord) {
  const existing = loadQAHistory();
  const updated = [record, ...existing].slice(0, 10);
  localStorage.setItem(QA_HISTORY_KEY, JSON.stringify(updated));
}

// ─── Suggestion chip data ───────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    label: 'THIẾT YẾU',
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    note: 'Ảnh hưởng lớn nhất đến độ chính xác',
    chips: [
      { text: 'MBTI của bạn (VD: ENTJ, INFP, ISFJ...)', key: 'mbti' },
      { text: 'Học vấn: trường, ngành, năm học', key: 'edu' },
      { text: 'Kinh nghiệm: số năm, lĩnh vực, vị trí', key: 'exp' },
      { text: 'Mục tiêu nghề cụ thể (công ty/vị trí)', key: 'goal' },
    ],
  },
  {
    label: 'KHUYẾN NGHỊ',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    note: 'Tăng đáng kể chất lượng phân tích',
    chips: [
      { text: 'Kỹ năng chính (hard & soft skills)', key: 'skills' },
      { text: 'Ngoại ngữ & chứng chỉ (VD: IELTS 7.5)', key: 'lang' },
      { text: 'Mạng lưới quan hệ trong ngành', key: 'network' },
      { text: 'GPA / Thành tích nổi bật', key: 'gpa' },
      { text: 'Điểm mạnh theo người khác nhận xét', key: 'strengths' },
    ],
  },
  {
    label: 'TÙY CHỌN',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-400',
    note: 'Giúp cá nhân hóa lộ trình',
    chips: [
      { text: 'Phong cách làm việc ưa thích', key: 'style' },
      { text: 'Kỳ vọng thu nhập (VND/tháng)', key: 'salary' },
      { text: 'Giá trị nghề nghiệp cốt lõi', key: 'values' },
      { text: 'Lo ngại / rào cản hiện tại', key: 'concerns' },
    ],
  },
];

// ─── Quick Analysis Component ────────────────────────────────────────────────
function QuickAnalysisBox() {
  const draft = loadQADraft();
  const [description, setDescription] = useState(draft.description);
  const [targetCareer, setTargetCareer] = useState(draft.targetCareer);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [history, setHistory] = useState<QuickAnalysisRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const [usageTotal, setUsageTotal] = useState<number>(3);
  const resultRef = useRef<HTMLDivElement>(null);

  // Persist draft to localStorage whenever description or targetCareer changes
  useEffect(() => {
    saveQADraft(description, targetCareer);
  }, [description, targetCareer]);

  useEffect(() => {
    setHistory(loadQAHistory());
    // Load usage count from backend
    api.getQuickAnalysisUsage().then((res) => {
      if (res.success && res.data) {
        setUsageRemaining(res.data.remaining);
        setUsageTotal(res.data.total);
      }
    }).catch(() => {
      // If we can't fetch, assume full remaining so user isn't blocked by a network error
      setUsageRemaining(3);
    });
  }, []);

  const charCount = description.length;
  const isReady = description.trim().length >= 50 && targetCareer.trim().length >= 2;

  const appendChip = (chipText: string) => {
    const prefix = description.trim() ? description.trimEnd() + '\n' : '';
    setDescription(prefix + chipText + ': ');
  };

  const handleGenerate = async () => {
    if (!isReady) return;
    setIsGenerating(true);
    setAnalysis('');
    setAnalysisError('');
    try {
      const response = await api.generateQuickAnalysis(description, targetCareer);
      if (response.success && response.data) {
        setAnalysis(response.data.analysis);
        // Update usage counter from response
        if (response.data.usage) {
          setUsageRemaining(response.data.usage.remaining);
          setUsageTotal(response.data.usage.total);
        }
        // Save to localStorage history
        const record: QuickAnalysisRecord = {
          id: Date.now().toString(),
          targetCareer: targetCareer.trim(),
          descriptionSnippet: description.trim().slice(0, 200),
          analysis: response.data.analysis,
          createdAt: new Date().toISOString(),
        };
        saveQARecord(record);
        clearQADraft();
        setHistory(loadQAHistory());
        setExpandedId(record.id);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        setAnalysisError(response.error?.message || 'Không thể tạo phân tích.');
      }
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code;
      if (errCode === 'USAGE_LIMIT_REACHED') {
        setUsageRemaining(0);
      }
      setAnalysisError(err.response?.data?.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Phân Tích Career Fit Nhanh</h2>
            <p className="text-indigo-100 text-sm mt-0.5">
              Mô tả bản thân → nhận báo cáo PHẦN I-V chi tiết trong vài phút
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Suggestion chips */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Để đạt kết quả chính xác nhất, hãy đề cập những thông tin sau:
          </p>
          <div className="space-y-2.5">
            {SUGGESTION_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${group.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                    {group.label}
                  </span>
                  <span className="text-xs text-gray-400">{group.note}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.chips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => appendChip(chip.text)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-transparent hover:border-indigo-200"
                      title="Click để thêm vào mô tả"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target career input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nghề nghiệp / Vị trí mục tiêu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={targetCareer}
            onChange={(e) => setTargetCareer(e.target.value)}
            placeholder="VD: Consultant tại McKinsey Vietnam, Product Manager tại startup, UX Designer tại Grab..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Description textarea */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Mô tả bản thân <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs font-medium ${charCount < 50 ? 'text-red-500' : charCount < 200 ? 'text-amber-600' : 'text-green-600'}`}>
              {charCount} ký tự {charCount < 50 ? `(tối thiểu 50, cần thêm ${50 - charCount})` : charCount < 200 ? '— thêm chi tiết để kết quả tốt hơn' : '— tốt!'}
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder={`Ví dụ:\nTôi là sinh viên năm 4 Học viện Ngoại giao, chuyên ngành Truyền thông Quốc tế. MBTI: ENTJ. IELTS 7.5 (Speaking 7.5). GPA: 3.6/4.0.\n\nKinh nghiệm: Intern tại Đại sứ quán Pháp 3 tháng, thực tập truyền thông tại VnExpress 2 tháng.\n\nKỹ năng: Nghiên cứu chính sách, thuyết trình, tiếng Anh & Pháp, Excel cơ bản.\n\nMạng lưới: Quen biết 2 anh chị từng làm tại McKinsey Vietnam và BCG Hanoi.\n\nMục tiêu: Gia nhập McKinsey HCMC với vai trò Business Analyst...`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 resize-y leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Nhấp vào chip màu xanh bên trên để thêm nhanh từng mục vào ô mô tả.
          </p>
        </div>

        {/* In-progress navigation warning */}
        {isGenerating && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Đang phân tích — bạn có thể chuyển tab, kết quả sẽ tự động lưu vào <strong>Lịch Sử Phân Tích</strong> khi hoàn thành.</span>
          </div>
        )}

        {/* Error */}
        {analysisError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {analysisError}
          </div>
        )}

        {/* Usage counter badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {usageRemaining === null ? (
              <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
            ) : usageRemaining > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {Array.from({ length: usageTotal }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block w-2 h-2 rounded-full ${i < (usageTotal - usageRemaining) ? 'bg-gray-300' : 'bg-indigo-500'}`}
                    />
                  ))}
                </span>
                <span className="font-medium text-indigo-700">{usageRemaining}/{usageTotal} lần còn lại</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Đã dùng hết {usageTotal}/{usageTotal} lần miễn phí
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">Mỗi tài khoản có {usageTotal} lần thử miễn phí</span>
        </div>

        {/* Generate button or Paywall */}
        {usageRemaining === 0 ? (
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: 'linear-gradient(#faf5ff, #faf5ff) padding-box, linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%) border-box',
              border: '1.5px solid transparent',
              boxShadow: '0 0 24px rgba(168,85,247,0.12)',
            }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Bạn đã dùng hết lượt miễn phí</h3>
            <p className="text-sm text-gray-600 mb-3">
              Nâng cấp lên <span className="font-semibold text-purple-700">Pro Plan</span> để tiếp tục phân tích không giới hạn.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-default"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Pro Plan — Sắp ra mắt
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Tính năng đang được phát triển. Chúng tôi sẽ thông báo khi Pro Plan ra mắt!
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!isReady || isGenerating || usageRemaining === null}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Đang phân tích... (khoảng 30-60 giây)
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Tạo Báo Cáo Phân Tích Career Fit
              </>
            )}
          </button>
        )}

        {/* Result */}
        {analysis && (
          <div ref={resultRef} className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Báo Cáo Phân Tích Career Fit
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(analysis);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                title="Sao chép toàn bộ báo cáo"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép
              </button>
            </div>
            <div
              className="rounded-xl p-5 max-h-[70vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%) border-box',
                border: '1.5px solid transparent',
                boxShadow: '0 0 28px rgba(99,102,241,0.18), 0 0 12px rgba(168,85,247,0.10)',
              }}
            >
              <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-7 font-sans">
                {analysis}
              </pre>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Báo cáo được tạo bởi GPT-4o dựa trên mô tả của bạn. Kết quả mang tính tham khảo.
            </p>
          </div>
        )}

        {/* ─── Analysis History ─────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch Sử Phân Tích ({history.length})
              <span className="text-xs font-normal text-gray-400 ml-1">— tối đa 10 bản gần nhất</span>
            </h3>
            <div className="space-y-2">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Record header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {record.targetCareer}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(record.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {expandedId !== record.id && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {record.descriptionSnippet}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(record.analysis);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Sao chép báo cáo này"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded analysis */}
                  {expandedId === record.id && (
                    <div
                      className="p-4"
                      style={{
                        background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%) border-box',
                        border: '1.5px solid transparent',
                        borderTop: 'none',
                        boxShadow: 'inset 0 0 20px rgba(99,102,241,0.04)',
                      }}
                    >
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap leading-6 font-sans max-h-[60vh] overflow-y-auto">
                        {record.analysis}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Standalone Quick Analysis History Card ──────────────────────────────────
function QuickAnalysisHistoryCard() {
  const [records, setRecords] = useState<QuickAnalysisRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadQAHistory());
  }, []);

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(QA_HISTORY_KEY, JSON.stringify(updated));
    setRecords(updated);
    if (expandedId === id) setExpandedId(null);
  };

  if (records.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Báo Cáo Phân Tích Nhanh
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {records.length} báo cáo
        </span>
      </div>

      {/* Records list */}
      <div className="divide-y divide-gray-100">
        {records.map((record) => (
          <div key={record.id}>
            {/* Row header — click to expand */}
            <button
              className="w-full flex items-start justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: 'white',
                    }}
                  >
                    {record.targetCareer}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(record.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {expandedId !== record.id && (
                  <p className="text-xs text-gray-500 truncate">{record.descriptionSnippet}</p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                {/* Copy button */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(record.analysis);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && navigator.clipboard.writeText(record.analysis)}
                  className="p-1.5 rounded hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="Sao chép báo cáo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                {/* Delete button */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => deleteRecord(record.id, e)}
                  onKeyDown={(e) => e.key === 'Enter' && deleteRecord(record.id, e as any)}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                  title="Xóa báo cáo này"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </span>
                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ml-1 ${expandedId === record.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded full report */}
            {expandedId === record.id && (
              <div className="px-6 pb-5">
                <div
                  className="rounded-xl p-4 max-h-[65vh] overflow-y-auto"
                  style={{
                    background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%) border-box',
                    border: '1.5px solid transparent',
                    boxShadow: '0 0 24px rgba(99,102,241,0.14), 0 0 8px rgba(168,85,247,0.08)',
                  }}
                >
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap leading-6 font-sans">
                    {record.analysis}
                  </pre>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Được tạo ngày {new Date(record.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadInterviews();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  };

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyInterviews();
      if (response.success && response.data) {
        setInterviews(response.data);
      } else {
        setError(response.error?.message || 'Failed to load interviews');
      }
    } catch (err: any) {
      console.error('Failed to load interviews:', err);
      setError('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: interviews.length,
    inProgress: interviews.filter(i => i.status === 'in_progress').length,
    completed: interviews.filter(i => i.status === 'completed').length,
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const inProgressInterviews = interviews.filter(i => i.status === 'in_progress');
  const latestCompleted = completedInterviews[0];

  // Calculate profile completeness
  const profileFields = [
    user?.name, user?.headline, user?.location, user?.about,
    user?.currentRole, user?.currentCompany, user?.linkedinUrl
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompleteness = Math.round((filledFields / profileFields.length) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your career assessments and continue your journey to find the perfect fit.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Analysis Box */}
      <QuickAnalysisBox />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* In Progress Assessments */}
          {inProgressInterviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Continue Your Assessment
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {inProgressInterviews.map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : interview.interviewType === 'lite_upgraded' ? 'Deep (Upgraded)' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(interview.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/interview/${interview.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Assessments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your Assessments
              </h2>
            </div>

            {interviews.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Start your first career assessment to discover your perfect fit!
                </p>
                <button
                  onClick={() => navigate('/interview-selection')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {completedInterviews.map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : interview.interviewType === 'lite_upgraded' ? 'Deep (Upgraded)' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Completed: {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/results/${interview.id}`)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Results
                    </button>
                  </div>
                ))}

                {/* Show abandoned interviews at the bottom */}
                {interviews.filter(i => i.status === 'abandoned').map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between opacity-60">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Abandoned
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Started: {new Date(interview.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm italic">No longer active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Analysis History */}
          <QuickAnalysisHistoryCard />
        </div>

        {/* Right Column - Sidebar Cards */}
        <div className="space-y-6">
          {/* Profile Completeness */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Profile Completeness</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    profileCompleteness >= 80 ? 'bg-green-500' :
                    profileCompleteness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{profileCompleteness}%</span>
            </div>
            <p className="text-xs text-gray-500">
              {profileCompleteness < 100
                ? 'Complete your profile to get better career matches.'
                : 'Great! Your profile is complete.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/interview-selection')}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Assessment
              </button>

              <button
                onClick={() => navigate('/job-library')}
                className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 border-2 border-indigo-200 text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Browse Jobs
              </button>

              {latestCompleted && (
                <button
                  onClick={() => navigate(`/results/${latestCompleted.id}`)}
                  className="w-full bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 border-2 border-green-200 text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Latest Results
                </button>
              )}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-indigo-100">Recommended Next Steps</h3>
            <ul className="space-y-3">
              {stats.completed === 0 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
                  <span className="text-sm">Complete your first career assessment</span>
                </li>
              )}
              {stats.completed > 0 && stats.completed < 2 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
                  <span className="text-sm">Try the Deep Assessment for more detailed results</span>
                </li>
              )}
              {profileCompleteness < 100 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">{stats.completed === 0 ? '2' : '1'}</span>
                  <span className="text-sm">Complete your profile for better matches</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  {profileCompleteness < 100 ? '3' : '2'}
                </span>
                <span className="text-sm">Explore the Job Library to discover careers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
