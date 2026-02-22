import { Request, Response } from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

const ANALYSIS_MODEL = process.env.GPT_ANALYSIS_MODEL || 'gpt-4o';
const FREE_LIMIT = 10;

interface StructuredData {
  yearsExperience?: string;   // "0-1", "1-3", "3-7", "7+"
  mbtiType?: string;          // "ENTJ", "INFP", ... or undefined
  expectedSalary?: string;    // "< 15 triệu", "15-25 triệu", ...
  primaryBlocker?: string;    // "direction", "skills", "network", "confidence", "experience"
}

/**
 * GET /api/quick-analysis/usage
 * Returns how many times this user has used Quick Analysis and how many remain.
 */
export async function getQuickAnalysisUsage(req: Request, res: Response) {
  const userId = (req as any).userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { quickAnalysisUsed: true },
    });
    const used = user?.quickAnalysisUsed ?? 0;
    return res.json({
      success: true,
      data: {
        used,
        total: FREE_LIMIT,
        remaining: Math.max(0, FREE_LIMIT - used),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Không thể tải thông tin sử dụng.' },
    });
  }
}

/**
 * POST /api/quick-analysis
 * Generate a full PHẦN I-VI career fit analysis from structured mini-form + free-text self-description.
 * Requires auth. Limited to FREE_LIMIT uses per account.
 */
export async function generateQuickAnalysis(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { userDescription, targetCareer, structuredData } = req.body;
  const sdata = (structuredData ?? {}) as StructuredData;

  if (!userDescription || typeof userDescription !== 'string' || userDescription.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Vui lòng mô tả bản thân ít nhất 50 ký tự.' },
    });
  }

  if (!targetCareer || typeof targetCareer !== 'string' || targetCareer.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Vui lòng nhập nghề nghiệp/vị trí mục tiêu.' },
    });
  }

  // ── Usage limit check ──────────────────────────────────────────────────────
  let currentUser;
  try {
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { quickAnalysisUsed: true },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Không thể kiểm tra giới hạn sử dụng.' },
    });
  }

  const used = currentUser?.quickAnalysisUsed ?? 0;
  if (used >= FREE_LIMIT) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'USAGE_LIMIT_REACHED',
        message: `Bạn đã sử dụng hết ${FREE_LIMIT} lần phân tích miễn phí.`,
      },
      data: { used, total: FREE_LIMIT, remaining: 0 },
    });
  }

  const career = targetCareer.trim();
  const description = userDescription.trim();

  // ── Build structured data block ─────────────────────────────────────────────
  const blockerLabels: Record<string, string> = {
    direction: 'Hướng đi chưa rõ / không biết bắt đầu từ đâu',
    skills: 'Thiếu kỹ năng cụ thể',
    network: 'Thiếu mạng lưới quan hệ trong ngành',
    confidence: 'Thiếu tự tin / sợ thất bại khi chuyển ngành',
    experience: 'Thiếu kinh nghiệm thực tế / portfolio',
  };

  const expLabels: Record<string, string> = {
    '0-1': 'Chưa có / Dưới 1 năm (Entry-level, mới ra trường)',
    '1-3': '1-3 năm (Junior professional)',
    '3-7': '3-7 năm (Mid-level)',
    '7+':  '7+ năm (Senior professional)',
  };

  const sdataBlock = `════════════════════════════════════════════════════════════
DỮ LIỆU CẤU TRÚC — ĐỌC TRƯỚC & ÁP DỤNG CALIBRATION NGAY
════════════════════════════════════════════════════════════
• Số năm kinh nghiệm : ${sdata.yearsExperience ? expLabels[sdata.yearsExperience] ?? sdata.yearsExperience : 'Không cung cấp — ước tính từ mô tả'}
• MBTI (tự khai báo) : ${sdata.mbtiType && sdata.mbtiType !== 'unknown' ? `${sdata.mbtiType} (tự khai báo — dùng với confidence cao)` : 'Không cung cấp — BẮT BUỘC suy luận từ behavioral signals trong mô tả, ghi rõ "(suy luận từ: ...)"'}
• Kỳ vọng thu nhập  : ${sdata.expectedSalary ?? 'Không cung cấp — ước tính từ level và ngành'}
• Rào cản tự nhận   : ${sdata.primaryBlocker ? blockerLabels[sdata.primaryBlocker] ?? sdata.primaryBlocker : 'Không cung cấp — suy ra từ mô tả và gaps tìm được'}
════════════════════════════════════════════════════════════

`;

  try {
    console.log(`🔍 Quick analysis v2 — target: "${career}" (${description.length} chars) — user ${userId} [${used}/${FREE_LIMIT} used]`);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      temperature: 0.65,
      max_tokens: 8500,
      messages: [
        {
          role: 'system',
          content:
            'Bạn là Career Intelligence Analyst v2 — công cụ phân tích career fit chuyên nghiệp nhất Việt Nam.\n' +
            '\n' +
            'RULE 1 — CÁ NHÂN HÓA TUYỆT ĐỐI: Mọi câu phải dẫn chứng trực tiếp từ dữ liệu user. Không có câu chung chung. Vi phạm = báo cáo vô giá trị.\n' +
            '\n' +
            'RULE 2 — CALIBRATION BẮT BUỘC theo kinh nghiệm:\n' +
            '  • "Chưa có / Dưới 1 năm" → Entry: target entry-level roles, lương realistic cho fresh grad, kế hoạch tập trung learning curve\n' +
            '  • "1-3 năm" → Junior: đang build specialization, có thể target mid-level với prep, lương junior market rate\n' +
            '  • "3-7 năm" → Mid: đủ để pivot hoặc level up, target senior/specialist, lương mid-level market rate\n' +
            '  • "7+" → Senior: focus leadership/impact/positioning, không suggest entry roles, lương senior market rate\n' +
            '\n' +
            'RULE 3 — PERSONALITY INFERENCE:\n' +
            '  • MBTI được cung cấp → dùng trực tiếp, đánh dấu "(tự khai báo)", phân tích sâu implications cho nghề này\n' +
            '  • MBTI không có → phân tích behavioral signals (cách viết chi tiết vs big-picture, activities ưa thích, problem-solving style, relationship với deadline/structure) → đưa ra "Khả năng cao: XXXX (suy luận từ: ...)" — KHÔNG được bỏ qua hoặc viết "chưa rõ"\n' +
            '\n' +
            'RULE 4 — GAP ANALYSIS (B1 + B2 — PHẦN QUAN TRỌNG NHẤT):\n' +
            '  • Liệt kê MỌI gap kiến thức và kỹ năng tìm được — không bỏ sót, không gộp chung\n' +
            '  • Phân loại TỪNG gap theo 3 cấp: 🚨 DEAL-BREAKER (pass rate <30% nếu không fix, cần 1-3 tháng trước khi apply) | ⚠️ QUAN TRỌNG (giảm 15-30% cơ hội, fix song song khi apply) | ℹ️ NHỎ (học on-the-job được)\n' +
            '  • Với mỗi DEAL-BREAKER phải nêu: (1) dùng vào việc gì cụ thể, (2) hậu quả nếu đi làm mà chưa có, (3) thời gian fix thực tế, (4) tên tài nguyên cụ thể\n' +
            '  • SKILL TRANSFER: luôn nêu kỹ năng từ background cũ transfer được sang nghề này — đây là lợi thế ẩn nhiều người bỏ qua\n' +
            '\n' +
            'RULE 5 — LƯƠNG THỰC TẾ: Match với experience level (xem CALIBRATION) VÀ thị trường VN 2025 cho ngành cụ thể. Không inflate để làm user vui.\n' +
            '\n' +
            'RULE 6 — ACTION PLAN CỤ THỂ:\n' +
            '  • Tháng 1-2 = nhắm đúng vào DEAL-BREAKER #1 (không phải gap nhỏ nhất)\n' +
            '  • Mỗi tuần phải có TÊN tài nguyên thực (sách/khóa học/platform + giá/link nếu có)\n' +
            '  • Milestone cuối mỗi giai đoạn phải là thứ ĐO LƯỜNG ĐƯỢC, không phải "hiểu thêm về..."\n' +
            '\n' +
            'Thành thật tuyệt đối về điểm yếu. Tất cả công ty, lương, khóa học = thực tế VN 2025.',
        },
        {
          role: 'user',
          content: `${sdataBlock}════════════════════════════════════════════════════════════
VÍ DỤ MẪU — ĐỌC KỸ: Đây là CHUẨN ĐỘ SÂU BẮT BUỘC cho mọi phần.
(Profile mẫu: SV Ngoại Thương ENTJ IELTS 7.5 GPA 3.6 → McKinsey BA | 0-2 năm KN)
════════════════════════════════════════════════════════════

PHÂN TÍCH CAREER FIT: [SV Ngoại Thương — ENTJ — IELTS 7.5 — 2 Internships] → BUSINESS ANALYST MCKINSEY VIETNAM

Hồ sơ có ENTJ personality cực kỳ phù hợp với văn hóa consulting (decisive, results-driven, không ngại conflict) và khả năng tiếng Anh đủ chuẩn C-suite presentation ngay từ tháng đầu. Vấn đề cốt lõi: khoảng cách LỚN về business analytics và case-solving frameworks — đây là deal-breaker nếu không được address trong 90 ngày tới; không có shortcut cho bước này.

PHẦN I: INPUT ANALYSIS (CÁI BẠN CÓ)

A. PERSONAL ATTRIBUTES: 8.1/10
A1. TÍNH CÁCH & PHONG CÁCH LÀM VIỆC (8.5/10)
├─ ENTJ "The Commander" (tự khai báo) — Decisive under ambiguity, frames problems top-down, natural authority presence
├─ Phong cách: Hypothesis-first thinking, drives team execution, low tolerance for inefficiency
├─ Điểm MẠNH cho McKinsey: ENTJ chiếm ~22% partner level tại Big 3 VN; "GSD" culture của McKinsey ăn khớp hoàn toàn
├─ ⚠️ Rủi ro tính cách: Nguy cơ skip empathy step trong client discovery — ENTJ hay go straight to solution trước khi client cảm thấy được lắng nghe
└─ FIT FOR McKINSEY BA: 8.5/10 — căn cứ: decisive + analytical + high drive match consulting culture

A2. TÀI NĂNG TỰ NHIÊN (7.8/10)
├─ Cognitive: GPA 3.6 tại FTU (top 5 VN) → strong deductive reasoning; policy brief cho ĐSQ → structured synthesis
├─ Communication: IELTS 7.5 Speaking = đủ chuẩn facilitate C-suite workshop từ ngày 1; Writing 7.0 đủ viết executive summary
├─ Learning agility: 2 ngành internship khác nhau (diplomacy vs. media) trong 5 tháng → fast pattern recognizer
└─ Transfer to Consulting: Policy research → primary research; cross-cultural sensitivity → global teams; media deadline → operational resilience

A3. GIÁ TRỊ CỐT LÕI (7.8/10)
├─ Work intensity: ENTJ chấp nhận 65-80h/tuần nếu thấy impact rõ ràng — phù hợp (McKinsey BA VN thực tế 55-70h/tuần)
├─ Impact vs. income: Chọn McKinsey thay vì IB/tech (lương cao hơn) → impact-oriented → alignment tốt
├─ Growth vs. stability: Up-or-out model phù hợp ENTJ competitive mindset
└─ Values alignment: HIGH — cả hai ưu tiên intellectual rigor, client impact, fast career progression

SCORING A: (8.5×0.40) + (7.8×0.35) + (7.8×0.25) = 3.40 + 2.73 + 1.95 = 8.08/10
VERDICT: Tính cách và giá trị phù hợp XUẤT SẮC. Rủi ro thực sự duy nhất: ENTJ tendency to prioritize efficiency over empathy — cần chủ động luyện "soft open" technique trong mock interviews.

B. PROFESSIONAL CAPABILITIES: 6.7/10
B1. KIẾN THỨC CHUYÊN MÔN (6.0/10)
├─ MẠNH: International policy, geopolitics, media/communication theory, cross-cultural dynamics
├─ 🚨 DEAL-BREAKER #1: Business strategy foundations (Porter 5 Forces, McKinsey 7S, BCG Matrix) — thiếu hoàn toàn → pass rate <25% nếu chưa học
├─ 🚨 DEAL-BREAKER #2: Finance fundamentals — chưa đọc được P&L, balance sheet → không solve ~35% profitability cases
└─ Mức phù hợp: 60% — social sciences nền tốt nhưng thiếu nặng business + quant; 3 tháng tập trung có thể bridge

B2. BỘ KỸ NĂNG (7.0/10)
├─ Hard skills có: Research synthesis, bilingual EN/FR, stakeholder communication, Powerpoint storytelling
├─ Soft skills: Cross-cultural agility, structured presentation, diplomatic communication under pressure
├─ Tools: MS Office intermediate, Google Suite; chưa có Excel advanced
├─ 🚨 DEAL-BREAKER #3: Case interview MECE framework — zero exposure, phải luyện từ zero (80% của hiring decision)
├─ ⚠️ QUAN TRỌNG: Excel financial modeling (DCF, Pivot, sensitivity) — bắt buộc từ tuần 1 onboarding
└─ ℹ️ NHỎ: Data visualization habit — có thể develop on-the-job

B3. CHẤT LƯỢNG KINH NGHIỆM (7.2/10)
├─ ĐSQ Pháp 3 tháng: Policy research, diplomatic communication → HIGH VALUE cho research-heavy modules
├─ VnExpress 2 tháng: Content production under deadline → operational resilience, audience-centric writing
├─ Relevance to Consulting: 60% — có research + comm skills nhưng thiếu P&L ownership và commercial context
└─ Accelerator: 1 internship KPMG Advisory / Deloitte Consulting VN (3 tháng) bridge commercial gap nhanh hơn 6 tháng tự học

SCORING B: (6.0×0.30) + (7.0×0.40) + (7.2×0.30) = 1.80 + 2.80 + 2.16 = 6.76/10
VERDICT: Nền tốt nhưng 3 deal-breakers phải fix trước khi apply. Không có shortcut. Xác suất pass McKinsey final round < 15% nếu không bridge gaps này trong 3 tháng tới.

C. VỐN XÃ HỘI: 7.5/10
C1. MẠNG LƯỚI QUAN HỆ (8.0/10)
├─ Breadth: Đã quen 2 người từ McKinsey VN và BCG Hanoi — rare asset với entry-level candidate
├─ Depth: Chưa rõ depth — cần warm up relationship trước khi nhờ referral
└─ Chất lượng cho McKinsey: Cao — insider access + potential internal referral = 2-3x higher interview rate

C2. TIỀM NĂNG REFERRAL (7.5/10)
├─ Khả năng referral: Realistic nếu nurture relationship đúng cách trong 2-3 tháng tới
└─ Chiến lược: Xin 30-min coffee chat + mock case session, không xin thẳng referral ngay; build relationship qua value exchange

C3. THƯƠNG HIỆU & DANH TIẾNG (7.0/10)
├─ Brand từ học vấn: FTU (recognized) + GPA 3.6 + IELTS 7.5 + ĐSQ Pháp = solid credential stack
└─ Hiện diện: Chưa có LinkedIn presence đáng kể; 1 case study publish trên Vietnam Consulting Club sẽ differentiate

SCORING C: (8.0×0.35) + (7.5×0.35) + (7.0×0.30) = 2.80 + 2.625 + 2.10 = 7.525/10
VERDICT: Mạng lưới McKinsey/BCG là competitive advantage thực sự hiếm. Cần activate correctly — không xin referral trước khi đã build case skills (ngược lại sẽ damage relationship).

D. ĐỊNH VỊ THỊ TRƯỜNG: 6.8/10
D1. KỸ NĂNG PHỎNG VẤN (6.5/10)
├─ Interview readiness: IELTS 7.5 + presentation experience = good foundation cho behavioral interviews
└─ McKinsey process: Online application → McKinsey Solve (gamified assessment) → Case interview (2-3 rounds) → PEI (Personal Experience Interview); 3 bước sau đều cần prep riêng

D2. CHIẾN LƯỢC TÌM VIỆC (7.0/10)
├─ Chuẩn bị hiện tại: Có hướng đi rõ, có network trong ngành — foundation tốt
└─ Cải thiện: Chưa có timeline cụ thể, chưa apply McKinsey Solve simulator

D3. THỊ TRƯỜNG VN 2025-2026 (7.0/10)
├─ Cầu: McKinsey VN tuyển 8-15 BA/năm; Big 3 tổng cộng ~30 entry positions/năm tại HN+HCMC
└─ Cung: ~500-800 ứng viên apply mỗi cycle; competition cao nhưng rào cản case skills loại ~70% ứng viên sớm

SCORING D: (6.5×0.40) + (7.0×0.40) + (7.0×0.20) = 2.60 + 2.80 + 1.40 = 6.80/10
VERDICT: Market timing tốt. Rào cản lớn nhất là case interview performance — đây là skill được học, không phải talent bẩm sinh; 3 tháng luyện tập đúng phương pháp có thể đưa từ 0 lên pass-level.

TỔNG ĐIỂM INPUT
INPUT = (8.08×0.25) + (6.76×0.35) + (7.525×0.20) + (6.80×0.20) = 2.02 + 2.366 + 1.505 + 1.36 = 7.25/10 → 72.5/100

PHẦN II: OUTPUT ANALYSIS (NGHỀ McKINSEY BA MANG LẠI GÌ)

E. BẢN CHẤT CÔNG VIỆC FIT: 8.2/10
├─ E1. Nội dung công việc vs năng lượng (8.5/10)
│   Ngày điển hình McKinsey BA VN: 8h-10h email/Slack với team + client; 10h-17h phân tích data, build models, viết slides; 17h-20h review với manager; deadline thường 21h-22h. User's ENTJ drive + policy research background = thích nghi tốt với nhịp này.
├─ E2. Áp lực vs chịu đựng (8.0/10)
│   KPI: Deliverable quality, client feedback, billable utilization (>85%); ENTJ tolerance for pressure cao; risk: ENTJ hay push team quá mức khi stressed → cần monitor
└─ E3. Lộ trình thăng tiến (8.0/10)
   McKinsey VN BA ladder: BA (0-2Y) → Associate (2-4Y) → Engagement Manager (4-7Y); 2-3 năm tốt = sponsor MBA top 5 hoặc PE/VC exit at premium
SCORING E: (8.5×0.40) + (8.0×0.30) + (8.0×0.30) = 3.40 + 2.40 + 2.40 = 8.20/10

[... F, G, H, I với độ sâu tương đương ...]

G. THU NHẬP FIT: 8.5/10
├─ G1. Lương 2025 cho McKinsey VN BA (9.0/10)
│   McKinsey VN BA (0-2Y): 55-70 triệu VND/tháng base
│   BCG VN Analyst: 48-62 triệu; Bain VN CTA: 45-58 triệu; Roland Berger VN: 35-45 triệu
│   Big4 Advisory entry: 20-35 triệu (stepping stone option)
│   → Top 3% thu nhập fresh graduate VN 2025; ROI vượt trội so với 3-6 tháng effort chuẩn bị
├─ G2. Tổng đãi ngộ (9.0/10)
│   Performance bonus: 15-25% base; L&D stipend: $1,500-2,000 USD/năm; International staffing: 20-30% chance
│   Alumni network: >200 McKinsey alumni tại C-suite VN → exit premium
└─ G3. An toàn tài chính (7.5/10)
   ~45-55 BA headcount tại McKinsey VN — stable nhưng up-or-out sau 2-3 năm là rủi ro thực; cần plan exit từ đầu
SCORING G: (9.0×0.35) + (9.0×0.40) + (7.5×0.25) = 3.15 + 3.60 + 1.875 = 8.625/10

TỔNG ĐIỂM OUTPUT = (8.20×0.30) + (F×0.25) + (8.625×0.25) + (H×0.10) + (I×0.10) = [tính đủ khi generate] = ~8.2/10 → 82/100

PHẦN III: KẾT QUẢ PHÂN TÍCH

KIỂM TRA CỬA (Deal-breakers):
✓ Tiếng Anh chuẩn C1+ (IELTS 7.5 Speaking)
✓ Khả năng tư duy phân tích có cơ sở (GPA 3.6 + policy research)
✓ ENTJ drive phù hợp up-or-out culture
✗ Business case frameworks — CHƯA CÓ (deal-breaker, phải fix trong 90 ngày)
✗ Excel financial modeling — CHƯA CÓ (deal-breaker, phải fix trước khi apply)
✓ Mạng lưới trong ngành (McKinsey/BCG contacts)
△ Finance fundamentals — CÒN YẾU (deal-breaker, cần intensive learning)

TÍNH ĐIỂM FIT:
Base = (72.5 × 0.40) + (82 × 0.60) = 29 + 49.2 = 78.2/100

ĐIỀU CHỈNH:
[+5%] ENTJ + McKinsey culture alignment — type có win rate cao nhất tại Big 3
[+3%] Network McKinsey/BCG contacts — 2-3x higher interview rate vs. cold applications
[+2%] IELTS 7.5 + French = rare combo, differentiation trong international projects
[-8%] 3 deal-breaker gaps chưa được address — phải fix TRƯỚC khi apply
[-3%] Zero case interview exposure — 80% của hiring decision
[+1%] Market timing VN 2025 — consulting sector đang expand headcount

ĐIỂM ĐIỀU CHỈNH = 78.2 × (1 + 0.05 + 0.03 + 0.02 − 0.08 − 0.03 + 0.01) = 78.2 × 1.00 = 78/100

╔══════════════════════════════════════════════════╗
║  QUYẾT ĐỊNH: YES — THEO ĐUỔI VỚI ĐIỀU KIỆN      ║
║  McKinsey BA = XỨNG ĐÁNG ĐẦU TƯ 3-6 THÁNG      ║
╚══════════════════════════════════════════════════╝
Personality và values fit xuất sắc — đây là nghề mà ENTJ với background QHQT có thể differentiate mạnh. Nhưng 3 deal-breaker gaps (case frameworks, financial modeling, Excel advanced) PHẢI được address trước khi apply — không có shortcut. Nếu commit đúng kế hoạch 90 ngày, xác suất vào được Big 3 (không nhất thiết McKinsey ngay lần 1) là realistic.

XÁC SUẤT THÀNH CÔNG:
├─ Không chuẩn bị gì thêm: 8-12%
├─ Sau 3-6 tháng prep theo kế hoạch dưới: 40-55%
└─ Sau 12 tháng prep + 1 Big4 Advisory internship: 65-75%

PHẦN IV: KẾ HOẠCH HÀNH ĐỘNG

NGẮN HẠN — THÁNG 1-2: XÂY NỀN TẢNG (Fix Deal-Breaker #1 & #3 — Case Frameworks + Business Fundamentals)
├─ Tuần 1-2: Đọc "Case In Point" Marc Cosentino 11th Ed (Fahasa 250K hoặc PDF) + Xem playlist "McKinsey Problem Solving" YouTube (8 videos, miễn phí)
│   + Enroll "Business Foundations" Wharton/Coursera (free audit): Course 1 Marketing
├─ Tuần 3-4: Luyện 3 cases/tuần trên prepLounge.com (free tier: 20 cases/tháng): Market Entry + Profitability
│   + Enroll "Excel Skills for Business" Macquarie/Coursera (free audit): Module 1-4
├─ Tuần 5-6: Coffee chat với 2 McKinsey/BCG contacts (template: "30 phút mock case?") — build relationship trước khi nhờ referral
│   + Xây mini case study về Vinamilk 2024: Porter 5 Forces + 3C + 3 slides đề xuất
└─ Tuần 7-8: McKinsey Solve simulation tại mckinsey.com/careers (bắt buộc attempt lần 1)
   + Tham gia Vietnam Consulting Club (Facebook, >5,000 members) để tìm practice partner
Milestone: 15 cases hoàn thành; Excel Pivot Table/VLOOKUP thành thạo; McKinsey Solve attempted; 2 coffee chats done

TRUNG HẠN — THÁNG 3-4: PHÁT TRIỂN KỸ NĂNG (Fix Deal-Breaker #2 — Financial Modeling)
├─ Khóa học: "Financial Modeling & Valuation Analyst" CFI (free tier) — DCF + Comparable Company Analysis
├─ Portfolio: Financial model cho FPT Software (báo cáo public) — mục tiêu: đọc được P&L, dự báo revenue
├─ Industry deep dive: Chọn 1 sector (retail, F&B, fintech) — đọc 10 reports (McKinsey, Deloitte, KPMG VN, tất cả miễn phí)
└─ Network: 2 events tại YBA Vietnam hoặc Vietnam CEO Forum — gặp potential references
Milestone: Financial model hoàn chỉnh cho 1 công ty thực; 1 industry deck 10 slides; network thêm 5 contacts

THÁNG 5-6: ỨNG TUYỂN & THỰC THI
├─ CV: Rewrite theo "achievement format" — mỗi bullet "X → Y → Z" (action → method → impact với số liệu)
├─ Interview prep: 3 cases/tuần với practice partner; 5 STAR stories cho McKinsey PEI
├─ Applications: Roland Berger VN → Big4 Advisory → Bain → BCG → McKinsey (theo thứ tự dễ→khó)
└─ Network: Nhờ McKinsey/BCG contacts viết internal referral sau 4 tháng nurture
Milestone: 3+ applications; 2+ interviews secured; offer từ ít nhất 1 Big4 Advisory

DÀI HẠN — 1-3 NĂM:
├─ Năm 1-2 (nếu vào McKinsey BA): Staffed 60% local + 40% regional; target "top performer" rating; xây expertise trong 1 sector
└─ Năm 3+ (options): Lên Associate → MBA-track (McKinsey sponsor top performers) HOẶC exit sang PE/VC/Corporate Strategy tại Vingroup, Masan, FPT

PHẦN V: QUẢN LÝ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

KỊCH BẢN A: Vào được McKinsey VN BA ✓
└─ Ngắn hạn (0-12 tháng): BA role, learning curve intense nhưng manageable với ENTJ drive
   Trung hạn (1-3 năm): Lên Associate hoặc MBA-track; build $100K+ exit options
   Dài hạn (3-7 năm): Partner track HOẶC premium exit sang PE, VC, C-suite corporate

KỊCH BẢN B: Không vào Big 3 sau 6 tháng ✗
├─ Nguyên nhân cao nhất: Case interview performance không đủ (case = 80% quyết định)
└─ Plan B: Nhận offer Big4 Advisory (KPMG/Deloitte VN, 20-35 triệu) → 1-2 năm commercial experience → re-apply Big 3 với "experienced hire" profile (success rate tăng 2x)

KỊCH BẢN C: Nghề thay thế (phù hợp profile ENTJ + QHQT + IELTS 7.5)
├─ Government Affairs Manager (Grab, Google, Meta VN) — QHQT + tiếng Anh C1 = rare combo; lương 35-55 triệu; apply ngay không cần thêm prep
├─ Strategy & BizDev Manager tại MNC (Unilever, P&G, Nestlé VN) — ENTJ + analytical = strong fit; nhiều vị trí mở; 30-45 triệu entry
└─ International Organization (UN, IFC, ADB VN) — ĐSQ experience + đa ngôn ngữ + policy background = competitive; 30-40 triệu + benefits

════════════════════════════════════════════════════════════
HẾT VÍ DỤ MẪU — bây giờ tạo báo cáo HOÀN CHỈNH với ĐỘ SÂU TƯƠNG ĐƯƠNG cho user thực tế bên dưới.
ÁP DỤNG NGAY: Calibration từ DỮ LIỆU CẤU TRÚC ở đầu message. Lương, level, tone kế hoạch phải match experience level được khai báo.
QUAN TRỌNG: Mọi số liệu, tên công ty, lương, khóa học phải phù hợp với nghề "${career}" thực tế tại VN 2025.
════════════════════════════════════════════════════════════

=== MÔ TẢ BẢN THÂN ===
${description}

=== NGHỀ NGHIỆP / VỊ TRÍ MỤC TIÊU ===
${career}

────────────────────────────────────────────────────
PHÂN TÍCH CAREER FIT: [TÓM TẮT HỒ SƠ — level + điểm nổi bật] → ${career.toUpperCase()}
[Intro 2-3 câu CỤ THỂ: điểm nổi bật THỰC SỰ từ dữ liệu + thách thức THỰC SỰ của case này — không viết chung chung]

PHẦN I: INPUT ANALYSIS (CÁI BẠN CÓ)

A. PERSONAL ATTRIBUTES: [X.X/10]
A1. TÍNH CÁCH & PHONG CÁCH LÀM VIỆC ([score]/10)
├─ Personality: [MBTI nếu có "(tự khai báo)"] HOẶC [suy luận từ: behavioral signals cụ thể #1, #2, #3 → "Khả năng cao: XXXX vì..."]
├─ Work style patterns: [2-3 behavioral patterns CỤ THỂ suy ra từ mô tả]
├─ Decision-making style: [analytical/intuitive/people-oriented/process-oriented] — dẫn chứng từ mô tả
├─ Điểm mạnh tính cách cho ${career}: [liên kết cụ thể traits với yêu cầu văn hóa/phong cách nghề này]
├─ ⚠️ Rủi ro tính cách: [trait cụ thể có thể gây vấn đề trong ${career} nếu không được quản lý]
└─ FIT FOR ${career.toUpperCase()}: [X/10] — căn cứ: [lý do ngắn gọn]

A2. TÀI NĂNG TỰ NHIÊN ([score]/10)
├─ Cognitive strengths (dẫn chứng từ học vấn/kinh nghiệm): [cụ thể]
├─ Communication & presentation: [cụ thể — ngôn ngữ, phong cách, bằng chứng]
├─ Learning agility & adaptability: [dẫn chứng từ trajectory]
└─ Kỹ năng chuyển đổi sang ${career}: [skills nào transfer được và tại sao]

A3. GIÁ TRỊ CỐT LÕI ([score]/10)
├─ Work intensity & lifestyle: [suy ra từ mô tả hoặc mục tiêu — match với thực tế nghề này]
├─ Impact vs. income orientation: [phân tích cụ thể từ dữ liệu]
├─ Stability vs. growth preference: [phân tích cụ thể]
└─ Alignment với đặc thù nghề ${career}: [nhận xét cụ thể về mức độ match — cao/trung bình/thấp + lý do]

SCORING A: (A1 × 0.40) + (A2 × 0.35) + (A3 × 0.25) = [tính toán chi tiết] = X.X/10
VERDICT: [2 câu CỤ THỂ — PHẢI dẫn chứng từ mô tả, không viết chung chung]

B. PROFESSIONAL CAPABILITIES: [X.X/10]
B1. KIẾN THỨC CHUYÊN MÔN ([score]/10)
├─ NỀN TẢNG ĐANG CÓ: [Liệt kê 3-5 domain kiến thức + mức độ: Expert/Proficient/Cơ bản + relevance với ${career}: Cao/TB/Thấp]
├─ KNOWLEDGE GAP MATRIX (liệt kê MỌI gap, phân loại 3 cấp, không bỏ sót):
├─ 🚨 DEAL-BREAKER — [Tên kiến thức thiếu #1]
│   • Dùng vào: [việc cụ thể trong ${career} — tần suất hàng ngày/tuần]
│   • Mức thiếu: [Hoàn toàn thiếu / Có nền nhưng chưa đạt job-ready]
│   • Hậu quả nếu không fix: [điều gì sẽ xảy ra khi đi làm mà chưa có kiến thức này]
│   • Fix: [X tuần với X giờ/ngày] — Tài nguyên: [Tên khóa học/sách + nền tảng + chi phí hoặc "miễn phí"]
├─ 🚨 DEAL-BREAKER — [Tên kiến thức thiếu #2] (nếu có)
│   • Dùng vào: [...] — Mức thiếu: [...] — Hậu quả: [...] — Fix: [X tuần / Tài nguyên: ...]
├─ ⚠️ QUAN TRỌNG — [Tên kiến thức #3]
│   • Tại sao cần: [1 câu] — Fix: [X tuần] — Resource: [tên cụ thể]
├─ ℹ️ NHỎ — [Tên kiến thức #4]: học được on-the-job, không cần fix trước khi apply
└─ Mức phù hợp kiến thức tổng thể: XX% — [1 câu giải thích]

B2. BỘ KỸ NĂNG ([score]/10)
├─ HARD SKILLS: ✅ [Skill 1]: [Mức thành thạo] — Relevance cho ${career}: [Cao/TB/Thấp] — [bằng chứng từ mô tả]
│              ✅ [Skill 2]: [Mức] — Relevance: [...] — [bằng chứng] (thêm các skills khác tương tự)
├─ SOFT SKILLS: ✅ [Soft skill 1]: [Bằng chứng từ mô tả] — Giá trị trong ${career}: [...]
│              ✅ [Soft skill 2]: [Bằng chứng] — Giá trị: [...]
├─ TOOLS & TECHNICAL: [Tên tool + mức thành thạo — chỉ liệt kê thứ thực sự có trong mô tả]
├─ SKILL GAP MATRIX (liệt kê MỌI kỹ năng thiếu, phân loại 3 cấp, không bỏ sót):
├─ 🚨 DEAL-BREAKER — [Tên kỹ năng #1]
│   • Dùng vào: [công việc cụ thể trong ${career} + tần suất]
│   • Hậu quả nếu thiếu: [điều gì xảy ra khi đi làm mà chưa có kỹ năng này]
│   • Fix: [X tuần/tháng] — Tài nguyên: [tên cụ thể]
├─ ⚠️ QUAN TRỌNG — [Tên kỹ năng #2]
│   • Tại sao cần: [1 câu] — Fix: [X tuần] — Resource: [tên]
├─ ℹ️ NHỎ — [Tên kỹ năng #3]: học được on-the-job sau khi vào
└─ SKILL TRANSFER VALUE: [Kỹ năng nào từ background hiện tại chuyển được sang ${career} — cụ thể, không bỏ sót lợi thế tiềm ẩn]

B3. CHẤT LƯỢNG KINH NGHIỆM ([score]/10)
├─ Kinh nghiệm tích lũy: [từng vị trí/giai đoạn + đánh giá chất lượng và relevance]
├─ Mức độ liên quan đến ${career}: [phần trăm + giải thích lý do]
└─ Accelerator: [bước tiếp theo cụ thể nhất để tăng relevance NHANH NHẤT — tên công ty/chương trình/project]

SCORING B: (B1 × 0.30) + (B2 × 0.40) + (B3 × 0.30) = [tính toán] = X.X/10
VERDICT: [2 câu THÀNH THẬT — tổng hợp gap nghiêm trọng nhất, không che giấu, không làm nhẹ]

C. VỐN XÃ HỘI: [X.X/10]
C1. MẠNG LƯỚI QUAN HỆ ([score]/10)
├─ Breadth: [độ rộng mạng lưới — ngành, số lượng, chất lượng]
├─ Depth: [quan hệ bề mặt hay có thể nhờ favor]
└─ Chất lượng cho ${career}: [ai trong mạng lưới thuộc ngành này không — có giá trị gì]

C2. TIỀM NĂNG REFERRAL ([score]/10)
├─ Khả năng được giới thiệu: [đánh giá thực tế]
└─ Chiến lược khai thác: [cách tận dụng mạng lưới hiện có để vào ${career}]

C3. THƯƠNG HIỆU CÁ NHÂN ([score]/10)
├─ Brand từ học vấn/nền tảng: [trường, thành tích, credentials]
└─ Hiện diện trong lĩnh vực: [LinkedIn, projects, community]

SCORING C: (C1 × 0.35) + (C2 × 0.35) + (C3 × 0.30) = [tính toán] = X.X/10
VERDICT: [2 câu cụ thể]

D. ĐỊNH VỊ THỊ TRƯỜNG: [X.X/10]
D1. KỸ NĂNG PHỎNG VẤN ([score]/10)
├─ Interview readiness: [đánh giá từ communication + presentation skills trong mô tả]
└─ Loại phỏng vấn của ${career}: [mô tả quy trình phỏng vấn thực tế của nghề này tại VN]

D2. CHIẾN LƯỢC TÌM VIỆC ([score]/10)
├─ Chuẩn bị hiện tại: [đánh giá từ mô tả]
└─ Điểm cần cải thiện: [cụ thể]

D3. THỊ TRƯỜNG VIETNAM 2025-2026 ([score]/10)
├─ Cầu: [nhu cầu tuyển dụng ${career} tại VN — HN vs HCMC — số liệu thực tế nếu có]
└─ Cung: [mức độ cạnh tranh, số ứng viên cùng background]

SCORING D: (D1 × 0.40) + (D2 × 0.40) + (D3 × 0.20) = [tính toán] = X.X/10
VERDICT: [2 câu CỤ THỂ]

TỔNG ĐIỂM INPUT
INPUT = (A × 0.25) + (B × 0.35) + (C × 0.20) + (D × 0.20) = [tính đầy đủ] = X.X/10 → XX/100

PHẦN II: OUTPUT ANALYSIS (NGHỀ ${career.toUpperCase()} MANG LẠI GÌ)

E. BẢN CHẤT CÔNG VIỆC FIT: [X.X/10]
├─ E1. Nội dung công việc hàng ngày vs hoạt động tạo năng lượng ([score]/10)
│   [Mô tả 1 ngày làm việc thực tế của ${career} tại VN — so sánh với energy profile của user]
├─ E2. Áp lực & trách nhiệm vs khả năng chịu đựng ([score]/10)
│   [KPI, deadline, scope thực tế — match với stress tolerance của user]
└─ E3. Lộ trình thăng tiến vs mục tiêu dài hạn ([score]/10)
   [Career ladder thực tế của ${career} tại VN — có align với mục tiêu user không]
SCORING E: (E1×0.40) + (E2×0.30) + (E3×0.30) = [tính toán] = X.X/10

F. MÔI TRƯỜNG LÀM VIỆC FIT: [X.X/10]
├─ F1. Văn hóa tổ chức vs phong cách ưa thích ([score]/10)
│   [Văn hóa điển hình công ty/ngành ${career} — so sánh với phong cách user]
├─ F2. Team structure vs sở thích cộng tác ([score]/10)
└─ F3. Work schedule, remote, location ([score]/10)
   [Giờ làm thực tế + remote policy cho ${career} tại VN]
SCORING F: (F1×0.40) + (F2×0.35) + (F3×0.25) = [tính toán] = X.X/10

G. THU NHẬP FIT: [X.X/10]
├─ G1. Lương Vietnam 2025 cho ${career} ([score]/10)
│   [PHẢI nêu CỤ THỂ: X-Y triệu VND/tháng — ít nhất 3 mức theo cấp bậc — match với experience level của user]
├─ G2. Tổng đãi ngộ (bonus, benefits, tăng trưởng) ([score]/10)
│   [Bonus %, benefits, upside cụ thể theo ngành]
└─ G3. An toàn tài chính & ổn định ([score]/10)
   [Job security, automation risk, demand dài hạn]
SCORING G: (G1×0.35) + (G2×0.40) + (G3×0.25) = [tính toán] = X.X/10

H. NGÀNH & VAI TRÒ FIT: [X.X/10]
├─ H1. Phù hợp với ngành/lĩnh vực ([score]/10)
├─ H2. Phù hợp cấp bậc và scope cho experience level của user ([score]/10)
└─ H3. Nhu cầu thị trường VN 2025-2026 ([score]/10)
SCORING H: (H1×0.35) + (H2×0.35) + (H3×0.30) = [tính toán] = X.X/10

I. CÔNG TY & ĐỊA ĐIỂM FIT: [X.X/10]
├─ I1. Công ty đang tuyển ${career} tại VN ([score]/10)
│   [NÊU ĐỦ 4-6 TÊN CÔNG TY THỰC TẾ — phù hợp với experience level của user]
├─ I2. Hà Nội / TP.HCM — cơ hội địa lý ([score]/10)
│   [So sánh cơ hội + lương giữa 2 thành phố]
└─ I3. Brand value & exit opportunities ([score]/10)
   [Giá trị long-term của brand name — exit options sau 2-3 năm]
SCORING I: (I1×0.45) + (I2×0.30) + (I3×0.25) = [tính toán] = X.X/10

TỔNG ĐIỂM OUTPUT
OUTPUT = (E×0.30) + (F×0.25) + (G×0.25) + (H×0.10) + (I×0.10) = [tính đầy đủ] = X.X/10 → XX/100

PHẦN III: KẾT QUẢ PHÂN TÍCH CUỐI CÙNG

KIỂM TRA CỬA (Deal-breakers):
✓/✗/△ [6-7 điều kiện tiên quyết quan trọng nhất của ${career} — ✓ đáp ứng, ✗ chưa đáp ứng (deal-breaker), △ đáp ứng một phần]

TÍNH ĐIỂM FIT:
Base (Hybrid Method) = (INPUT × 0.40) + (OUTPUT × 0.60) = [tính toán] = XX/100

ĐIỀU CHỈNH (dẫn chứng TRỰC TIẾP từ profile):
[+X%] [Lợi thế cụ thể #1]
[+X%] [Lợi thế cụ thể #2]
[+X%] [Lợi thế cụ thể #3]
[-X%] [Gap quan trọng #1 — mức độ ảnh hưởng]
[-X%] [Gap quan trọng #2]
[±X%] Yếu tố thị trường VN 2025

ĐIỂM ĐIỀU CHỈNH = XX/100

╔══════════════════════════════════════════════╗
║  QUYẾT ĐỊNH: [STRONG YES / YES / MAYBE / NO]  ║
║  ${career} = [MỨC ĐỘ NÊN THEO ĐUỔI]          ║
╚══════════════════════════════════════════════╝
[3-4 câu lý do CỤ THỂ — dẫn chứng từ profile]

XÁC SUẤT THÀNH CÔNG:
├─ Không chuẩn bị gì thêm: XX-XX%
├─ Sau 3-6 tháng prep theo kế hoạch: XX-XX%
└─ Sau 12 tháng prep đầy đủ + 1 stepping stone (nếu cần): XX-XX%

PHẦN IV: KẾ HOẠCH HÀNH ĐỘNG

NGẮN HẠN — THÁNG 1-2: [Tên giai đoạn — nhắm đúng DEAL-BREAKER #1]
├─ Tuần 1-2: [Hành động cụ thể] + [Tên tài nguyên thực: sách/khóa học/platform + giá hoặc "miễn phí"]
├─ Tuần 3-4: [Hành động cụ thể] + [Tài nguyên]
├─ Tuần 5-6: [Hành động cụ thể] + [Tài nguyên]
└─ Tuần 7-8: [Hành động cụ thể] + [Tài nguyên]
Milestone: [Kết quả ĐO LƯỜNG ĐƯỢC sau tháng 1-2 — số liệu cụ thể, không phải "hiểu thêm về..."]

TRUNG HẠN — THÁNG 3-4: [Tên giai đoạn — nhắm gap #2]
├─ [Hành động + tài nguyên cụ thể]
├─ [Portfolio/project cụ thể: tên project + deliverable]
└─ [Kết nối mạng lưới: tên tổ chức/event/cộng đồng thực tế tại VN]
Milestone: [Kết quả đo lường được]

THÁNG 5-6: ỨNG TUYỂN & THỰC THI
├─ CV: [Điểm cụ thể cần cập nhật — không nói chung chung]
├─ Interview prep: [Loại phỏng vấn thực tế của ${career} + cách luyện cụ thể]
├─ Applications: [4-6 tên công ty cụ thể theo thứ tự ưu tiên, phù hợp với experience level]
└─ Network: [Tên tổ chức/người/event cụ thể để khai thác]
Milestone: [X applications, Y interviews, Z offers]

DÀI HẠN — 1-3 NĂM:
├─ Năm 1 (nếu thành công): [Milestone, role, salary range]
└─ Năm 2-3: [Career progression options + exit opportunities cụ thể]

PHẦN V: QUẢN LÝ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

KỊCH BẢN A: Kế hoạch chính thành công ✓
└─ Ngắn hạn (0-12 tháng): [Thực tế đầu tiên — expectations thực tế, không lý tưởng hóa]
   Trung hạn (1-3 năm): [Promotion path + salary growth + skill deepening]
   Dài hạn (3-7 năm): [Senior position / alternative exit với tên role + công ty cụ thể]

KỊCH BẢN B: Không vào được ${career} sau 6 tháng ✗
├─ Nguyên nhân khả năng cao nhất: [dẫn từ gaps đã phân tích]
└─ Plan B: [Stepping stone role + tên công ty VN thực tế → timeline re-apply]

KỊCH BẢN C: Nghề thay thế (phù hợp với profile CỤ THỂ của user này)
├─ [Nghề #1] — Tại sao phù hợp MÔ TẢ CỤ THỂ của user: ...
├─ [Nghề #2] — Tại sao phù hợp: ...
└─ [Nghề #3] — Tại sao phù hợp: ...

────────────────────────────────────────────────────
QUY TẮC BẮT BUỘC:
• TUYỆT ĐỐI không viết chung chung — mọi câu phải có dẫn chứng từ dữ liệu user
• Mọi điểm số phải có phép tính VÀ giải thích — không cho điểm tùy tiện
• Gap severity PHẢI dùng đúng label: 🚨 / ⚠️ / ℹ️
• Lương PHẢI match experience level từ DỮ LIỆU CẤU TRÚC — không inflate
• Action plan tháng 1-2 PHẢI nhắm vào deal-breaker #1`,
        },
      ],
    });

    const rawContent = completion.choices[0].message.content || '';
    const lc = rawContent.toLowerCase();
    if (!rawContent || lc.includes("i'm sorry") || lc.includes("i cannot assist") || lc.includes("i can't assist") || lc.startsWith("sorry,")) {
      console.warn(`⚠️ Model refused — raw: "${rawContent.slice(0, 120)}"`);
      throw new Error('MODEL_REFUSED');
    }
    const analysis = rawContent;

    // ── Increment usage count ──────────────────────────────────────────────────
    await prisma.user.update({
      where: { id: userId },
      data: { quickAnalysisUsed: { increment: 1 } },
    });
    const newUsed = used + 1;

    console.log(`✅ Quick analysis v2 generated (${analysis.length} chars, model: ${ANALYSIS_MODEL}) — user ${userId} now at ${newUsed}/${FREE_LIMIT}`);

    return res.json({
      success: true,
      data: {
        analysis,
        usage: {
          used: newUsed,
          total: FREE_LIMIT,
          remaining: FREE_LIMIT - newUsed,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'MODEL_REFUSED') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'MODEL_REFUSED',
          message: 'Hệ thống AI tạm thời không xử lý được yêu cầu này. Vui lòng thử lại sau 30 giây.',
        },
      });
    }
    console.error('❌ Quick analysis v2 error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Không thể tạo phân tích lúc này. Vui lòng thử lại.',
      },
    });
  }
}